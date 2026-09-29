import { prisma } from "@/lib/db/prisma";

export async function canViewCourse(userId: string, courseId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      courseTeachers: true,
      enrollments: { where: { studentId: userId } },
      organization: {
        include: {
          memberships: { where: { userId } },
        },
      },
    },
  });

  if (!course) return false;

  const membership = course.organization.memberships[0];
  if (!membership) return false;

  if (membership.role === "ADMIN") return true;

  const isTeacher = course.courseTeachers.some((ct) => ct.teacherId === userId);
  if (isTeacher) return true;

  // Student can view if course is PUBLISHED
  if (course.state === "PUBLISHED") {
    return true;
  }

  return false;
}

export async function canManageCourse(userId: string, courseId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      courseTeachers: true,
      organization: {
        include: {
          memberships: { where: { userId } },
        },
      },
    },
  });

  if (!course) return false;

  const membership = course.organization.memberships[0];
  if (!membership) return false;

  if (membership.role === "ADMIN") return true;

  const isTeacher = course.courseTeachers.some((ct) => ct.teacherId === userId);
  return isTeacher;
}

export async function canGradeAttempt(userId: string, attemptId: string): Promise<boolean> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          course: {
            include: {
              courseTeachers: true,
              organization: {
                include: {
                  memberships: { where: { userId } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return false;

  const org = attempt.quiz.course.organization;
  const membership = org.memberships[0];
  if (membership?.role === "ADMIN") return true;

  const isTeacher = attempt.quiz.course.courseTeachers.some((ct) => ct.teacherId === userId);
  return isTeacher;
}

export async function canViewAttempt(userId: string, attemptId: string): Promise<boolean> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          course: {
            include: {
              courseTeachers: true,
              organization: {
                include: {
                  memberships: { where: { userId } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return false;

  // Student owner can view their own attempt
  if (attempt.studentId === userId) return true;

  // Teacher or Admin of the course
  const org = attempt.quiz.course.organization;
  const membership = org.memberships[0];
  if (membership?.role === "ADMIN") return true;

  const isTeacher = attempt.quiz.course.courseTeachers.some((ct) => ct.teacherId === userId);
  return isTeacher;
}
