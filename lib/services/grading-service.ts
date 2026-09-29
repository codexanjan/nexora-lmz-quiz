import { prisma } from "@/lib/db/prisma";
import { dispatchDomainEvent } from "./event-service";
import { updateGradebookSelectionInternal } from "./quiz-service";

export async function gradeEssayAnswer({
  attemptId,
  answerId,
  graderId,
  score,
  feedback,
  reason,
}: {
  attemptId: string;
  answerId: string;
  graderId: string;
  score: number;
  feedback?: string | null;
  reason?: string | null;
}) {
  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: { course: true },
        },
        quizVersion: true,
        answers: true,
        questionSnapshots: true,
      },
    });

    if (!attempt) throw new Error("Attempt not found");

    const answer = attempt.answers.find((a) => a.id === answerId);
    if (!answer) throw new Error("Answer not found");

    const snapshot = attempt.questionSnapshots.find((s) => s.questionVersionId === answer.questionVersionId);
    const maxPoints = snapshot ? snapshot.pointsPossible : 10.0;

    // Validate score bounds: 0 <= score <= maxPoints
    if (score < 0 || score > maxPoints) {
      throw new Error(`Score must be between 0 and ${maxPoints}`);
    }

    const previousScore = answer.pointsEarned;
    const previousFeedback = answer.feedback;

    // 1. Update Answer record
    await tx.answer.update({
      where: { id: answerId },
      data: {
        pointsEarned: score,
        isCorrect: score >= maxPoints * 0.7,
        feedback: feedback || null,
      },
    });

    // 2. Create immutable GradeRevision
    await tx.gradeRevision.create({
      data: {
        attemptId,
        answerId,
        graderId,
        previousScore,
        newScore: score,
        previousFeedback,
        newFeedback: feedback || null,
        reason: reason || "Manual instructor evaluation",
      },
    });

    // 3. Recalculate total points for the attempt
    const allAnswers = await tx.answer.findMany({
      where: { attemptId },
    });

    let totalPointsEarned = 0;
    let anyUngraded = false;
    for (const ans of allAnswers) {
      if (ans.pointsEarned !== null) {
        totalPointsEarned += ans.pointsEarned;
      } else {
        anyUngraded = true;
      }
    }

    const totalPossible = attempt.totalPointsPossible || 1.0;
    const percentage = Math.round((totalPointsEarned / totalPossible) * 100 * 10) / 10;
    const isPassed = percentage >= attempt.quizVersion.passingPercentage;

    let newStatus = attempt.status;
    if (!anyUngraded) {
      if (attempt.quizVersion.resultReleasePolicy === "IMMEDIATE") {
        newStatus = "RELEASED";
      } else {
        newStatus = "GRADED";
      }
    }

    const updatedAttempt = await tx.attempt.update({
      where: { id: attemptId },
      data: {
        status: newStatus,
        totalPointsEarned,
        percentage,
        isPassed,
      },
    });

    await updateGradebookSelectionInternal(tx, attempt.quizId, attempt.studentId, attempt.quizVersion.gradeSelectionRule);

    if (newStatus === "RELEASED") {
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
  });
}

export async function releaseAttemptResult(attemptId: string, graderId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { include: { course: true } },
    },
  });

  if (!attempt) throw new Error("Attempt not found");

  const updatedAttempt = await prisma.attempt.update({
    where: { id: attemptId },
    data: { status: "RELEASED" },
  });

  await dispatchDomainEvent("RESULT_RELEASED", {
    attemptId,
    quizTitle: attempt.quiz.title,
    studentId: attempt.studentId,
    organizationId: attempt.quiz.course.organizationId,
    score: attempt.totalPointsEarned || 0,
    percentage: attempt.percentage || 0,
  });

  return updatedAttempt;
}
