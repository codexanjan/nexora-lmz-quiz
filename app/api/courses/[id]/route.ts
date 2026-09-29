import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewCourse, canManageCourse } from "@/lib/permissions";
import { calculateCourseProgress } from "@/lib/services/progress-service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const courseId = params.id;

  if (user) {
    const allowed = await canViewCourse(user.id, courseId);
    if (!allowed) {
      return NextResponse.json({ error: "Access denied or course does not exist" }, { status: 403 });
    }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      courseTeachers: { include: { teacher: true } },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            include: {
              progress: user ? { where: { studentId: user.id } } : false,
            },
          },
        },
      },
      quizzes: {
        where: { state: "PUBLISHED" },
        orderBy: { createdAt: "asc" },
        include: {
          attempts: user
            ? {
                where: { studentId: user.id },
                orderBy: { attemptNumber: "desc" },
              }
            : false,
        },
      },
      enrollments: user ? { where: { studentId: user.id } } : false,
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  let progress = null;
  if (user && course.enrollments && course.enrollments.length > 0) {
    progress = await calculateCourseProgress(user.id, courseId);
  }

  const isTeacher = user ? course.courseTeachers.some((ct) => ct.teacherId === user.id) : false;
  const isAdmin = user?.activeRole === "ADMIN";

  return NextResponse.json({
    course,
    progress,
    isEnrolled: user ? course.enrollments && course.enrollments.length > 0 : false,
    canManage: isTeacher || isAdmin,
  });
}
