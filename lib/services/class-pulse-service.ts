import { prisma } from "@/lib/db/prisma";

export interface StudentSupportItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  reasons: string[];
  severity: "HIGH" | "MEDIUM";
  courseTitle: string;
}

export interface GapMapConcept {
  concept: string;
  totalAnswered: number;
  incorrectCount: number;
  incorrectPercentage: number;
  pointsLost: number;
}

export interface ClassPulseData {
  courseId?: string;
  activeCoursesCount: number;
  totalStudentsCount: number;
  pendingGradingCount: number;
  averageFinalizedScore: number;
  overallCompletionRate: number;
  quizParticipationRate: number;
  gapMap: GapMapConcept[];
  atRiskStudents: StudentSupportItem[];
  recentSubmissions: {
    id: string;
    studentName: string;
    quizTitle: string;
    courseTitle: string;
    submittedAt: string;
    status: string;
    score: number | null;
    totalPossible: number;
  }[];
}

export async function getClassPulse(teacherId: string, courseIdFilter?: string): Promise<ClassPulseData> {
  // 1. Find teacher's assigned courses
  const courseTeachers = await prisma.courseTeacher.findMany({
    where: { teacherId },
    include: {
      course: {
        include: {
          enrollments: { include: { student: true } },
          quizzes: true,
          modules: { include: { lessons: true } },
        },
      },
    },
  });

  let courses = courseTeachers.map((ct) => ct.course);
  if (courseIdFilter) {
    courses = courses.filter((c) => c.id === courseIdFilter);
  }

  const courseIds = courses.map((c) => c.id);

  // 2. Total students enrolled
  const studentMap = new Map<string, { id: string; name: string; email: string; courseTitle: string }>();
  for (const c of courses) {
    for (const enr of c.enrollments) {
      studentMap.set(enr.studentId, {
        id: enr.student.id,
        name: enr.student.name,
        email: enr.student.email,
        courseTitle: c.title,
      });
    }
  }

  // 3. Pending grading count
  const pendingGradingCount = await prisma.attempt.count({
    where: {
      quiz: { courseId: { in: courseIds } },
      status: "AWAITING_GRADING",
    },
  });

  // 4. Finalized scores
  const finalizedAttempts = await prisma.attempt.findMany({
    where: {
      quiz: { courseId: { in: courseIds } },
      status: { in: ["GRADED", "RELEASED"] },
      isSelectedForGradebook: true,
    },
  });

  const avgScore =
    finalizedAttempts.length > 0
      ? Math.round((finalizedAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / finalizedAttempts.length) * 10) / 10
      : 0;

  // 5. Completion rate calculation
  let totalLessonsRequired = 0;
  for (const c of courses) {
    for (const m of c.modules) {
      totalLessonsRequired += m.lessons.filter((l) => l.isRequired).length;
    }
  }

  const completedLessonProgressCount = await prisma.lessonProgress.count({
    where: {
      lesson: { module: { courseId: { in: courseIds } }, isRequired: true },
      isCompleted: true,
    },
  });

  const totalPossibleCompletions = totalLessonsRequired * studentMap.size;
  const overallCompletionRate =
    totalPossibleCompletions > 0 ? Math.round((completedLessonProgressCount / totalPossibleCompletions) * 100) : 0;

  // 6. Quiz participation rate
  const totalQuizzes = courses.reduce((acc, c) => acc + c.quizzes.filter((q) => q.state === "PUBLISHED").length, 0);
  const totalPossibleQuizAttempts = totalQuizzes * studentMap.size;
  const uniqueStudentQuizAttempts = await prisma.attempt.groupBy({
    by: ["studentId", "quizId"],
    where: { quiz: { courseId: { in: courseIds } } },
  });
  const quizParticipationRate =
    totalPossibleQuizAttempts > 0 ? Math.round((uniqueStudentQuizAttempts.length / totalPossibleQuizAttempts) * 100) : 0;

  // 7. GapMap Concept Gaps Aggregation
  const answers = await prisma.answer.findMany({
    where: {
      attempt: {
        quiz: { courseId: { in: courseIds } },
        status: { in: ["GRADED", "RELEASED"] },
      },
    },
    include: {
      questionVersion: true,
    },
  });

  const conceptStats = new Map<string, { total: number; incorrect: number; pointsLost: number }>();
  for (const ans of answers) {
    const qv = ans.questionVersion;
    let tags = ["Core Concepts"];
    if (qv.tags) {
      try {
        const parsed = JSON.parse(qv.tags);
        if (Array.isArray(parsed) && parsed.length > 0) tags = parsed;
      } catch {
        tags = qv.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const isMissed = ans.isCorrect === false;
    const lost = qv.points - (ans.pointsEarned ?? 0);

    for (const tag of tags) {
      const existing = conceptStats.get(tag) || { total: 0, incorrect: 0, pointsLost: 0 };
      existing.total += 1;
      if (isMissed) existing.incorrect += 1;
      if (lost > 0) existing.pointsLost += lost;
      conceptStats.set(tag, existing);
    }
  }

  const gapMap: GapMapConcept[] = Array.from(conceptStats.entries())
    .map(([concept, stat]) => ({
      concept,
      totalAnswered: stat.total,
      incorrectCount: stat.incorrect,
      incorrectPercentage: stat.total > 0 ? Math.round((stat.incorrect / stat.total) * 100) : 0,
      pointsLost: Math.round(stat.pointsLost * 10) / 10,
    }))
    .sort((a, b) => b.incorrectPercentage - a.incorrectPercentage);

  // 8. Transparent Student Support Indicators (Section 33)
  const atRiskStudents: StudentSupportItem[] = [];

  for (const student of Array.from(studentMap.values())) {
    const reasons: string[] = [];

    // Rule A: Check finalized quiz scores below 60%
    const studentAttempts = finalizedAttempts.filter((a) => a.studentId === student.id);
    const lowAttempts = studentAttempts.filter((a) => (a.percentage || 0) < 60);
    if (lowAttempts.length >= 1) {
      reasons.push(`${lowAttempts.length} assessment score(s) below passing threshold (60%)`);
    }

    // Rule B: Incomplete lessons
    const studentCompleted = await prisma.lessonProgress.count({
      where: {
        studentId: student.id,
        isCompleted: true,
        lesson: { module: { courseId: { in: courseIds } } },
      },
    });

    if (totalLessonsRequired > 3 && studentCompleted <= 1) {
      reasons.push(`${totalLessonsRequired - studentCompleted} required lesson(s) pending`);
    }

    if (reasons.length > 0) {
      atRiskStudents.push({
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        reasons,
        severity: reasons.length > 1 ? "HIGH" : "MEDIUM",
        courseTitle: student.courseTitle,
      });
    }
  }

  // 9. Recent submissions
  const recentAttempts = await prisma.attempt.findMany({
    where: { quiz: { courseId: { in: courseIds } } },
    orderBy: { submittedAt: "desc" },
    take: 6,
    include: {
      student: true,
      quiz: { include: { course: true } },
    },
  });

  const recentSubmissions = recentAttempts.map((a) => ({
    id: a.id,
    studentName: a.student.name,
    quizTitle: a.quiz.title,
    courseTitle: a.quiz.course.title,
    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : a.startedAt.toISOString(),
    status: a.status,
    score: a.totalPointsEarned,
    totalPossible: a.totalPointsPossible,
  }));

  return {
    courseId: courseIdFilter,
    activeCoursesCount: courses.length,
    totalStudentsCount: studentMap.size,
    pendingGradingCount,
    averageFinalizedScore: avgScore,
    overallCompletionRate,
    quizParticipationRate,
    gapMap,
    atRiskStudents,
    recentSubmissions,
  };
}
