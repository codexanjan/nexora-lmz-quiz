import { prisma } from "@/lib/db/prisma";
import { getReviewLoopItems } from "./reviewloop-service";

export interface NextStepAction {
  id: string;
  category: "LESSON" | "QUIZ" | "REVIEW" | "FEEDBACK";
  title: string;
  description: string;
  actionText: string;
  actionUrl: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  badge?: string;
}

export async function getNextStepRecommendations(studentId: string): Promise<NextStepAction[]> {
  const recommendations: NextStepAction[] = [];

  // 1. Check for unread teacher feedback or newly released results
  const releasedAttemptWithFeedback = await prisma.attempt.findFirst({
    where: {
      studentId,
      status: "RELEASED",
      answers: {
        some: {
          feedback: { not: null },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    include: { quiz: true },
  });

  if (releasedAttemptWithFeedback) {
    recommendations.push({
      id: `feedback-${releasedAttemptWithFeedback.id}`,
      category: "FEEDBACK",
      title: "Review Teacher Feedback",
      description: `Your instructor provided detailed rubric feedback on "${releasedAttemptWithFeedback.quiz.title}".`,
      actionText: "View Feedback",
      actionUrl: `/student/results/${releasedAttemptWithFeedback.id}`,
      priority: "HIGH",
      badge: "Feedback Ready",
    });
  }

  // 2. Check for upcoming/active quizzes not yet attempted
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    select: { courseId: true },
  });
  const courseIds = enrollments.map((e) => e.courseId);

  const pendingQuiz = await prisma.quiz.findFirst({
    where: {
      courseId: { in: courseIds },
      state: "PUBLISHED",
      attempts: {
        none: { studentId },
      },
    },
    orderBy: { closingDate: "asc" },
    include: { course: true },
  });

  if (pendingQuiz) {
    recommendations.push({
      id: `quiz-${pendingQuiz.id}`,
      category: "QUIZ",
      title: `Take ${pendingQuiz.title}`,
      description: `Required assessment for "${pendingQuiz.course.title}". Passing score: ${pendingQuiz.passingPercentage}%.`,
      actionText: "Start Assessment",
      actionUrl: `/student/quizzes/${pendingQuiz.id}`,
      priority: "HIGH",
      badge: "Assessment Ready",
    });
  }

  // 3. Check for next incomplete lesson in enrolled courses
  const nextIncompleteLesson = await prisma.lesson.findFirst({
    where: {
      isRequired: true,
      module: {
        courseId: { in: courseIds },
        course: { state: "PUBLISHED" },
      },
      progress: {
        none: {
          studentId,
          isCompleted: true,
        },
      },
    },
    orderBy: [
      { module: { orderIndex: "asc" } },
      { orderIndex: "asc" },
    ],
    include: {
      module: {
        include: { course: true },
      },
    },
  });

  if (nextIncompleteLesson) {
    recommendations.push({
      id: `lesson-${nextIncompleteLesson.id}`,
      category: "LESSON",
      title: `Continue: ${nextIncompleteLesson.title}`,
      description: `In "${nextIncompleteLesson.module.course.title}" • Module: ${nextIncompleteLesson.module.title}`,
      actionText: "Open Lesson",
      actionUrl: `/student/courses/${nextIncompleteLesson.module.courseId}/lessons/${nextIncompleteLesson.id}`,
      priority: "MEDIUM",
      badge: "Next Lesson",
    });
  }

  // 4. Check for weak concepts from ReviewLoop
  const reviewItems = await getReviewLoopItems(studentId);
  if (reviewItems.length > 0) {
    const topMissed = reviewItems[0];
    recommendations.push({
      id: `review-${topMissed.concept}`,
      category: "REVIEW",
      title: `Review Weak Concept: ${topMissed.concept}`,
      description: `You missed ${topMissed.missedCount} question(s) on ${topMissed.concept}. Strengthen your foundation now.`,
      actionText: topMissed.suggestedLessonId ? "Review Lesson" : "Open ReviewLoop",
      actionUrl: topMissed.suggestedLessonId
        ? `/student/courses/${topMissed.courseId}/lessons/${topMissed.suggestedLessonId}`
        : `/student/learning-pulse`,
      priority: "MEDIUM",
      badge: "Concept Gap",
    });
  }

  return recommendations;
}
