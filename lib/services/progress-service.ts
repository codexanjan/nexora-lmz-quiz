import { prisma } from "@/lib/db/prisma";
import { dispatchDomainEvent } from "./event-service";

export interface CourseProgressResult {
  courseId: string;
  studentId: string;
  percentage: number;
  completedActivities: number;
  totalActivities: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  completedQuizzesCount: number;
  totalQuizzesCount: number;
  isCompleted: boolean;
  explanation: string;
}

export async function calculateCourseProgress(studentId: string, courseId: string): Promise<CourseProgressResult> {
  // Fetch all published required lessons in the course
  const lessons = await prisma.lesson.findMany({
    where: {
      module: {
        courseId,
        course: { state: "PUBLISHED" },
      },
      isRequired: true,
    },
    select: { id: true },
  });

  // Fetch all published required quizzes in the course
  const quizzes = await prisma.quiz.findMany({
    where: {
      courseId,
      state: "PUBLISHED",
      isRequired: true,
    },
    select: { id: true },
  });

  const lessonIds = lessons.map((l) => l.id);
  const quizIds = quizzes.map((q) => q.id);

  // Completed lessons by student
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      studentId,
      lessonId: { in: lessonIds },
      isCompleted: true,
    },
  });

  // Completed/passed quizzes by student
  const completedQuizzes = await prisma.attempt.count({
    where: {
      studentId,
      quizId: { in: quizIds },
      status: { in: ["GRADED", "RELEASED"] },
      isPassed: true,
      isSelectedForGradebook: true,
    },
  });

  const totalActivities = lessonIds.length + quizIds.length;
  const completedActivities = completedLessons + completedQuizzes;

  const percentage = totalActivities > 0 ? Math.min(100, Math.round((completedActivities / totalActivities) * 100)) : 0;

  const explanation = `${completedActivities} of ${totalActivities} required published activities completed (${percentage}%)`;

  return {
    courseId,
    studentId,
    percentage,
    completedActivities,
    totalActivities,
    completedLessonsCount: completedLessons,
    totalLessonsCount: lessonIds.length,
    completedQuizzesCount: completedQuizzes,
    totalQuizzesCount: quizIds.length,
    isCompleted: totalActivities > 0 && completedActivities >= totalActivities,
    explanation,
  };
}

export async function completeLesson(studentId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Upsert progress record
  const progress = await prisma.lessonProgress.upsert({
    where: {
      studentId_lessonId: { studentId, lessonId },
    },
    update: {
      isCompleted: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    },
    create: {
      studentId,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    },
  });

  // Dispatch domain event to update progress, notifications, and audits
  await dispatchDomainEvent("LESSON_COMPLETED", {
    studentId,
    courseId: lesson.module.courseId,
    lessonId,
    lessonTitle: lesson.title,
    organizationId: lesson.module.course.organizationId,
  });

  const progressResult = await calculateCourseProgress(studentId, lesson.module.courseId);

  return { progress, courseProgress: progressResult };
}
