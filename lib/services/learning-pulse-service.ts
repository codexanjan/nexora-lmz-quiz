import { prisma } from "@/lib/db/prisma";

export interface LearningPulseSignal {
  type: "positive" | "negative" | "neutral";
  text: string;
  weight: number;
}

export interface LearningPulseResult {
  score: number;
  label: "Thriving" | "On Track" | "Needs Attention" | "Critical";
  signals: LearningPulseSignal[];
  calculatedAt: string;
}

export async function calculateLearningPulse(studentId: string): Promise<LearningPulseResult> {
  const signals: LearningPulseSignal[] = [];
  let score = 70; // baseline

  // 1. Enrollment & activity completion signal
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    include: { course: true },
  });

  if (enrollments.length === 0) {
    return {
      score: 50,
      label: "Needs Attention",
      signals: [{ type: "neutral", text: "No active course enrollments yet", weight: 0 }],
      calculatedAt: new Date().toISOString(),
    };
  }

  const courseIds = enrollments.map((e) => e.courseId);

  // Total required lessons across courses
  const totalLessons = await prisma.lesson.count({
    where: {
      module: { courseId: { in: courseIds } },
      isRequired: true,
    },
  });

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      studentId,
      isCompleted: true,
      lesson: { isRequired: true, module: { courseId: { in: courseIds } } },
    },
  });

  const completionRatio = totalLessons > 0 ? completedLessons / totalLessons : 0;
  if (completionRatio >= 0.75) {
    score += 15;
    signals.push({ type: "positive", text: `High lesson completion (${Math.round(completionRatio * 100)}%)`, weight: 15 });
  } else if (completionRatio >= 0.4) {
    score += 5;
    signals.push({ type: "positive", text: `Steady lesson progress (${Math.round(completionRatio * 100)}%)`, weight: 5 });
  } else {
    score -= 10;
    signals.push({ type: "negative", text: `Low lesson completion (${Math.round(completionRatio * 100)}%)`, weight: -10 });
  }

  // 2. Quiz performance signal (from finalized attempts)
  const attempts = await prisma.attempt.findMany({
    where: {
      studentId,
      status: { in: ["GRADED", "RELEASED"] },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  if (attempts.length > 0) {
    const avgPercentage = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / attempts.length;
    if (avgPercentage >= 85) {
      score += 15;
      signals.push({ type: "positive", text: `Strong assessment mastery (avg ${avgPercentage.toFixed(0)}%)`, weight: 15 });
    } else if (avgPercentage >= 70) {
      score += 5;
      signals.push({ type: "positive", text: `Solid assessment results (avg ${avgPercentage.toFixed(0)}%)`, weight: 5 });
    } else {
      score -= 15;
      signals.push({ type: "negative", text: `Recent assessment scores below target (avg ${avgPercentage.toFixed(0)}%)`, weight: -15 });
    }
  } else {
    signals.push({ type: "neutral", text: "No completed assessments yet", weight: 0 });
  }

  // 3. Quiz participation signal
  const publishedQuizzes = await prisma.quiz.count({
    where: { courseId: { in: courseIds }, state: "PUBLISHED" },
  });

  const attemptedQuizzes = await prisma.attempt.groupBy({
    by: ["quizId"],
    where: { studentId },
  });

  if (publishedQuizzes > 0 && attemptedQuizzes.length >= publishedQuizzes) {
    score += 5;
    signals.push({ type: "positive", text: "Active quiz participation across all courses", weight: 5 });
  }

  // 4. Overdue check
  const now = new Date();
  const overdueQuizzes = await prisma.quiz.count({
    where: {
      courseId: { in: courseIds },
      state: "PUBLISHED",
      closingDate: { lt: now },
      attempts: {
        none: { studentId },
      },
    },
  });

  if (overdueQuizzes > 0) {
    score -= overdueQuizzes * 8;
    signals.push({ type: "negative", text: `${overdueQuizzes} overdue assessment deadline(s)`, weight: -overdueQuizzes * 8 });
  }

  // Clamp score between 10 and 100
  score = Math.max(10, Math.min(100, Math.round(score)));

  let label: LearningPulseResult["label"] = "On Track";
  if (score >= 85) label = "Thriving";
  else if (score >= 70) label = "On Track";
  else if (score >= 50) label = "Needs Attention";
  else label = "Critical";

  return {
    score,
    label,
    signals,
    calculatedAt: new Date().toISOString(),
  };
}
