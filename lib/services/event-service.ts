import { prisma } from "@/lib/db/prisma";
import { createNotification } from "./notification-service";
import { createAuditEvent } from "./audit-service";
import { createSystemAlert } from "./alert-service";

export type DomainEventType =
  | "USER_REGISTERED"
  | "COURSE_PUBLISHED"
  | "COURSE_ARCHIVED"
  | "STUDENT_ENROLLED"
  | "LESSON_COMPLETED"
  | "QUIZ_PUBLISHED"
  | "ATTEMPT_STARTED"
  | "ANSWER_SAVED"
  | "ATTEMPT_SUBMITTED"
  | "ATTEMPT_EXPIRED"
  | "ATTEMPT_GRADED"
  | "RESULT_RELEASED"
  | "GRADE_CHANGED"
  | "MEMBERSHIP_ROLE_CHANGED";

export async function dispatchDomainEvent(eventType: DomainEventType, payload: Record<string, unknown>) {
  // 1. Persist Outbox Event for durability
  const outbox = await prisma.outboxEvent.create({
    data: {
      eventType,
      payload: JSON.stringify(payload),
      status: "PROCESSING",
    },
  });

  try {
    // 2. Execute side-effects based on event type
    switch (eventType) {
      case "COURSE_PUBLISHED": {
        const { courseId, title, organizationId, actorId } = payload as {
          courseId: string;
          title: string;
          organizationId: string;
          actorId: string;
        };
        // Audit
        await createAuditEvent({
          organizationId,
          actorId,
          action: "COURSE_PUBLISH",
          entityType: "Course",
          entityId: courseId,
          metadata: { title },
        });

        // Notify all enrolled students
        const enrollments = await prisma.enrollment.findMany({
          where: { courseId },
          select: { studentId: true },
        });
        for (const enr of enrollments) {
          await createNotification({
            userId: enr.studentId,
            organizationId,
            type: "COURSE_PUBLISHED",
            title: `Course Published: ${title}`,
            message: `The course "${title}" has been published and is now open for learning.`,
            linkUrl: `/student/courses/${courseId}`,
          });
        }

        await createSystemAlert({
          organizationId,
          category: "COURSE",
          level: "INFO",
          title: `Course Published: ${title}`,
          message: `Course has been published with ${enrollments.length} enrolled student(s).`,
          linkUrl: `/teacher/courses/${courseId}`,
        });
        break;
      }

      case "LESSON_COMPLETED": {
        const { studentId, courseId, lessonId, lessonTitle, organizationId } = payload as {
          studentId: string;
          courseId: string;
          lessonId: string;
          lessonTitle: string;
          organizationId: string;
        };

        await createAuditEvent({
          organizationId,
          actorId: studentId,
          action: "LESSON_COMPLETE",
          entityType: "Lesson",
          entityId: lessonId,
          metadata: { lessonTitle, courseId },
        });

        await createNotification({
          userId: studentId,
          organizationId,
          type: "LESSON_COMPLETED",
          title: `Lesson Completed`,
          message: `You completed "${lessonTitle}". Your course progress has been updated!`,
          linkUrl: `/student/courses/${courseId}`,
        });
        break;
      }

      case "QUIZ_PUBLISHED": {
        const { quizId, quizTitle, courseId, organizationId, actorId } = payload as {
          quizId: string;
          quizTitle: string;
          courseId: string;
          organizationId: string;
          actorId: string;
        };

        await createAuditEvent({
          organizationId,
          actorId,
          action: "QUIZ_PUBLISH",
          entityType: "Quiz",
          entityId: quizId,
          metadata: { quizTitle, courseId },
        });

        const enrollments = await prisma.enrollment.findMany({
          where: { courseId },
          select: { studentId: true },
        });
        for (const enr of enrollments) {
          await createNotification({
            userId: enr.studentId,
            organizationId,
            type: "QUIZ_PUBLISHED",
            title: `New Quiz: ${quizTitle}`,
            message: `A new quiz "${quizTitle}" is available for your course.`,
            linkUrl: `/student/quizzes/${quizId}`,
          });
        }
        break;
      }

      case "ATTEMPT_SUBMITTED": {
        const { attemptId, quizId, quizTitle, studentId, studentName, courseId, organizationId, requiresManualGrading } = payload as {
          attemptId: string;
          quizId: string;
          quizTitle: string;
          studentId: string;
          studentName: string;
          courseId: string;
          organizationId: string;
          requiresManualGrading: boolean;
        };

        await createAuditEvent({
          organizationId,
          actorId: studentId,
          action: "ATTEMPT_SUBMIT",
          entityType: "Attempt",
          entityId: attemptId,
          metadata: { quizTitle, requiresManualGrading },
        });

        // Notify course teachers
        const teachers = await prisma.courseTeacher.findMany({
          where: { courseId },
          select: { teacherId: true },
        });

        for (const t of teachers) {
          await createNotification({
            userId: t.teacherId,
            organizationId,
            type: requiresManualGrading ? "ESSAY_AWAITING_GRADING" : "SUBMISSION_RECEIVED",
            title: requiresManualGrading ? `Grading Needed: ${quizTitle}` : `New Submission: ${quizTitle}`,
            message: `${studentName} submitted "${quizTitle}". ${
              requiresManualGrading ? "Contains essay questions awaiting grading." : "Auto-graded."
            }`,
            linkUrl: `/teacher/submissions/${attemptId}`,
          });
        }
        break;
      }

      case "RESULT_RELEASED": {
        const { attemptId, quizTitle, studentId, organizationId, score, percentage } = payload as {
          attemptId: string;
          quizTitle: string;
          studentId: string;
          organizationId: string;
          score: number;
          percentage: number;
        };

        await createAuditEvent({
          organizationId,
          actorId: null,
          action: "RESULT_RELEASE",
          entityType: "Attempt",
          entityId: attemptId,
          metadata: { quizTitle, score, percentage },
        });

        await createNotification({
          userId: studentId,
          organizationId,
          type: "RESULT_RELEASED",
          title: `Result Released: ${quizTitle}`,
          message: `Your score for "${quizTitle}" is ${percentage.toFixed(1)}%. Check feedback and ReviewLoop.`,
          linkUrl: `/student/results/${attemptId}`,
        });
        break;
      }

      case "MEMBERSHIP_ROLE_CHANGED": {
        const { userId, targetUserName, newRole, organizationId, actorId } = payload as {
          userId: string;
          targetUserName: string;
          newRole: string;
          organizationId: string;
          actorId: string;
        };

        await createAuditEvent({
          organizationId,
          actorId,
          action: "ROLE_CHANGE",
          entityType: "Membership",
          entityId: userId,
          metadata: { targetUserName, newRole },
        });

        await createNotification({
          userId,
          organizationId,
          type: "ROLE_UPDATED",
          title: `Role Updated`,
          message: `Your membership role was updated to ${newRole}.`,
          linkUrl: `/profile`,
        });
        break;
      }
    }

    // Mark outbox completed
    await prisma.outboxEvent.update({
      where: { id: outbox.id },
      data: { status: "COMPLETED", processedAt: new Date() },
    });
  } catch (error) {
    console.error("Outbox event handler error:", error);
    await prisma.outboxEvent.update({
      where: { id: outbox.id },
      data: { status: "FAILED", retryCount: { increment: 1 } },
    });
  }
}
