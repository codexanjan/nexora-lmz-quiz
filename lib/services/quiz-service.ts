import { prisma } from "@/lib/db/prisma";
import { dispatchDomainEvent } from "./event-service";

export async function startQuizAttempt(studentId: string, quizId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Quiz with latest version and course
    const quiz = await tx.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: {
          include: {
            enrollments: { where: { studentId } },
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: {
            questions: {
              include: {
                questionVersion: true,
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!quiz) throw new Error("Quiz not found");
    if (quiz.state !== "PUBLISHED") throw new Error("Quiz is not published");
    if (quiz.course.state !== "PUBLISHED") throw new Error("Course is not published");
    if (quiz.course.enrollments.length === 0) throw new Error("You are not enrolled in this course");

    const latestVersion = quiz.versions[0];
    if (!latestVersion) throw new Error("Quiz has no published version");

    // 2. Check accommodations
    const accommodation = await tx.quizAccommodation.findUnique({
      where: { quizId_studentId: { quizId, studentId } },
    });

    const maxAttemptsAllowed = latestVersion.maxAttempts + (accommodation?.extraAttempts || 0);

    // 3. Count existing attempts
    const existingAttempts = await tx.attempt.findMany({
      where: { quizId, studentId },
      orderBy: { attemptNumber: "desc" },
    });

    // Check if there is an active in-progress attempt
    const activeAttempt = existingAttempts.find((a) => a.status === "IN_PROGRESS");
    if (activeAttempt) {
      // Check if deadline passed
      if (new Date() > activeAttempt.deadlineAt) {
        // Auto-finalize it
        await finalizeAttemptInternal(tx, activeAttempt.id, true);
      } else {
        // Return existing active attempt to resume
        return activeAttempt;
      }
    }

    const completedAttemptsCount = existingAttempts.filter((a) => a.status !== "IN_PROGRESS").length;
    if (completedAttemptsCount >= maxAttemptsAllowed) {
      throw new Error(`Maximum attempts (${maxAttemptsAllowed}) reached for this assessment`);
    }

    const nextAttemptNumber = existingAttempts.length + 1;

    // 4. Calculate server-authoritative deadline
    const now = new Date();
    const durationMinutes = latestVersion.timeLimitMinutes + (accommodation?.extraTimeMinutes || 0);
    const durationDeadline = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const quizClosingDate = accommodation?.extendedClosingDate || quiz.closingDate;
    let effectiveDeadline = durationDeadline;
    if (quizClosingDate && quizClosingDate < durationDeadline) {
      effectiveDeadline = quizClosingDate;
    }

    // 5. Calculate total points possible
    let totalPointsPossible = 0;
    for (const q of latestVersion.questions) {
      totalPointsPossible += q.pointsOverride ?? q.questionVersion.points;
    }

    // 6. Create Attempt
    const attempt = await tx.attempt.create({
      data: {
        quizId,
        quizVersionId: latestVersion.id,
        studentId,
        attemptNumber: nextAttemptNumber,
        status: "IN_PROGRESS",
        startedAt: now,
        deadlineAt: effectiveDeadline,
        totalPointsPossible,
        isSelectedForGradebook: nextAttemptNumber === 1,
      },
    });

    // 7. Create Question Snapshots and blank Answer records
    for (const q of latestVersion.questions) {
      const qv = q.questionVersion;
      await tx.attemptQuestionSnapshot.create({
        data: {
          attemptId: attempt.id,
          questionVersionId: qv.id,
          orderIndex: q.orderIndex,
          prompt: qv.prompt,
          type: qv.type,
          options: qv.options,
          explanation: qv.explanation,
          rubric: qv.rubric,
          pointsPossible: q.pointsOverride ?? qv.points,
        },
      });

      await tx.answer.create({
        data: {
          attemptId: attempt.id,
          questionVersionId: qv.id,
          response: null,
          isFlagged: false,
          revision: 1,
        },
      });
    }

    return attempt;
  });
}

export async function autosaveAnswer({
  attemptId,
  questionVersionId,
  studentId,
  response,
  isFlagged,
  revision,
}: {
  attemptId: string;
  questionVersionId: string;
  studentId: string;
  response?: string | null;
  isFlagged?: boolean;
  revision: number;
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.studentId !== studentId) throw new Error("Unauthorized");
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt is no longer in progress");
  }

  // Authoritative server-deadline check
  if (new Date() > attempt.deadlineAt) {
    // Auto-finalize and reject late edits
    await finalizeAttempt(attemptId, true);
    throw new Error("Deadline has passed. Your attempt has been finalized.");
  }

  // Concurrency check: Ensure newer revision does not get overwritten by older request
  const existingAnswer = await prisma.answer.findUnique({
    where: { attemptId_questionVersionId: { attemptId, questionVersionId } },
  });

  if (existingAnswer && existingAnswer.revision > revision) {
    return { status: "ignored_older_revision", answer: existingAnswer };
  }

  const updatedAnswer = await prisma.answer.upsert({
    where: { attemptId_questionVersionId: { attemptId, questionVersionId } },
    update: {
      response: response !== undefined ? response : existingAnswer?.response,
      isFlagged: isFlagged !== undefined ? isFlagged : existingAnswer?.isFlagged || false,
      revision,
      lastSavedAt: new Date(),
      isAutosaved: true,
      serverAcceptedAt: new Date(),
    },
    create: {
      attemptId,
      questionVersionId,
      response: response || null,
      isFlagged: isFlagged || false,
      revision,
      isAutosaved: true,
    },
  });

  await prisma.attempt.update({
    where: { id: attemptId },
    data: { lastSavedAt: new Date() },
  });

  return { status: "saved", answer: updatedAnswer };
}

export async function submitQuizAttempt(attemptId: string, studentId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.studentId !== studentId) throw new Error("Unauthorized");
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt has already been submitted");
  }

  return await finalizeAttempt(attemptId, false);
}

export async function finalizeAttempt(attemptId: string, isExpired = false) {
  return await prisma.$transaction(async (tx) => {
    return await finalizeAttemptInternal(tx, attemptId, isExpired);
  });
}

// Internal reusable finalization logic
async function finalizeAttemptInternal(tx: any, attemptId: string, isExpired: boolean) {
  const attempt = await tx.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          course: true,
        },
      },
      quizVersion: true,
      student: true,
      questionSnapshots: {
        include: {
          questionVersion: true,
        },
      },
      answers: true,
    },
  });

  if (!attempt || attempt.status !== "IN_PROGRESS") {
    return attempt;
  }

  let totalPointsEarned = 0;
  let hasEssayQuestion = false;

  // Grade each answer
  for (const snapshot of attempt.questionSnapshots) {
    const answer = attempt.answers.find((a: any) => a.questionVersionId === snapshot.questionVersionId);
    const qv = snapshot.questionVersion;
    const maxPoints = snapshot.pointsPossible;

    if (!answer || !answer.response) {
      if (qv.type === "ESSAY") hasEssayQuestion = true;
      continue;
    }

    const userResponse = answer.response.trim();

    if (qv.type === "SINGLE_CHOICE") {
      let isCorrect = false;
      try {
        const correct = JSON.parse(qv.correctAnswers || "[]");
        const correctId = Array.isArray(correct) ? correct[0] : correct;
        isCorrect = String(userResponse) === String(correctId);
      } catch {
        isCorrect = String(userResponse) === String(qv.correctAnswers);
      }
      const earned = isCorrect ? maxPoints : 0;
      totalPointsEarned += earned;
      await tx.answer.update({
        where: { id: answer.id },
        data: { isCorrect, pointsEarned: earned },
      });
    } else if (qv.type === "TRUE_FALSE") {
      let isCorrect = false;
      const parsedUser = userResponse.toLowerCase() === "true";
      const expected = String(qv.correctAnswers).toLowerCase().includes("true");
      isCorrect = parsedUser === expected;
      const earned = isCorrect ? maxPoints : 0;
      totalPointsEarned += earned;
      await tx.answer.update({
        where: { id: answer.id },
        data: { isCorrect, pointsEarned: earned },
      });
    } else if (qv.type === "MULTIPLE_SELECT") {
      let isCorrect = false;
      try {
        const userSelected: string[] = JSON.parse(userResponse);
        const correctSet: string[] = JSON.parse(qv.correctAnswers || "[]");
        if (
          Array.isArray(userSelected) &&
          Array.isArray(correctSet) &&
          userSelected.length === correctSet.length &&
          userSelected.every((val) => correctSet.includes(val))
        ) {
          isCorrect = true;
        }
      } catch {}
      const earned = isCorrect ? maxPoints : 0;
      totalPointsEarned += earned;
      await tx.answer.update({
        where: { id: answer.id },
        data: { isCorrect, pointsEarned: earned },
      });
    } else if (qv.type === "SHORT_ANSWER") {
      let isCorrect = false;
      const normalizedUser = userResponse.toLowerCase().replace(/\s+/g, " ");
      try {
        const accepted: string[] = JSON.parse(qv.acceptedAnswers || "[]");
        isCorrect = accepted.some((acc) => acc.toLowerCase().trim().replace(/\s+/g, " ") === normalizedUser);
      } catch {
        isCorrect = String(qv.acceptedAnswers).toLowerCase().trim() === normalizedUser;
      }
      const earned = isCorrect ? maxPoints : 0;
      totalPointsEarned += earned;
      await tx.answer.update({
        where: { id: answer.id },
        data: { isCorrect, pointsEarned: earned },
      });
    } else if (qv.type === "ESSAY") {
      hasEssayQuestion = true;
      // Marked for manual teacher grading
      await tx.answer.update({
        where: { id: answer.id },
        data: { pointsEarned: null, isCorrect: null },
      });
    }
  }

  const totalPossible = attempt.totalPointsPossible || 1.0;
  const percentage = Math.round((totalPointsEarned / totalPossible) * 100 * 10) / 10;
  const isPassed = percentage >= attempt.quizVersion.passingPercentage;

  let finalStatus = "AWAITING_GRADING";
  if (!hasEssayQuestion) {
    if (attempt.quizVersion.resultReleasePolicy === "IMMEDIATE") {
      finalStatus = "RELEASED";
    } else {
      finalStatus = "GRADED";
    }
  }

  const updatedAttempt = await tx.attempt.update({
    where: { id: attemptId },
    data: {
      status: finalStatus,
      submittedAt: new Date(),
      expiredAt: isExpired ? new Date() : null,
      totalPointsEarned,
      percentage,
      isPassed,
    },
  });

  // Re-evaluate Grade Selection Rule (HIGHEST, LATEST, FIRST) for Gradebook
  await updateGradebookSelectionInternal(tx, attempt.quizId, attempt.studentId, attempt.quizVersion.gradeSelectionRule);

  // Dispatch Domain Event
  await dispatchDomainEvent("ATTEMPT_SUBMITTED", {
    attemptId,
    quizId: attempt.quizId,
    quizTitle: attempt.quiz.title,
    studentId: attempt.studentId,
    studentName: attempt.student.name,
    courseId: attempt.quiz.courseId,
    organizationId: attempt.quiz.course.organizationId,
    requiresManualGrading: hasEssayQuestion,
  });

  if (finalStatus === "RELEASED") {
    await dispatchDomainEvent("RESULT_RELEASED", {
      attemptId,
      quizTitle: attempt.quiz.title,
      studentId: attempt.studentId,
      organizationId: attempt.quiz.course.organizationId,
      score: totalPointsEarned,
      percentage,
    });
  }

  return updatedAttempt;
}

export async function updateGradebookSelectionInternal(
  tx: any,
  quizId: string,
  studentId: string,
  rule: "HIGHEST" | "LATEST" | "FIRST" | string
) {
  const finalizedAttempts = await tx.attempt.findMany({
    where: {
      quizId,
      studentId,
      status: { in: ["GRADED", "RELEASED", "AWAITING_GRADING"] },
    },
    orderBy: { submittedAt: "asc" },
  });

  if (finalizedAttempts.length === 0) return;

  let selectedId = finalizedAttempts[0].id;

  if (rule === "FIRST") {
    selectedId = finalizedAttempts[0].id;
  } else if (rule === "LATEST") {
    selectedId = finalizedAttempts[finalizedAttempts.length - 1].id;
  } else {
    // HIGHEST (default)
    let maxPct = -1;
    for (const a of finalizedAttempts) {
      const pct = a.percentage || 0;
      if (pct > maxPct) {
        maxPct = pct;
        selectedId = a.id;
      }
    }
  }

  // Reset all and mark selected
  await tx.attempt.updateMany({
    where: { quizId, studentId },
    data: { isSelectedForGradebook: false },
  });

  await tx.attempt.update({
    where: { id: selectedId },
    data: { isSelectedForGradebook: true },
  });
}
