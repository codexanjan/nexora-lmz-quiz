import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");
  const status = searchParams.get("status");

  // Get courses taught by this teacher
  const taught = await prisma.courseTeacher.findMany({
    where: { teacherId: user.id },
    select: { courseId: true },
  });
  let courseIds = taught.map((t) => t.courseId);

  if (user.activeRole === "ADMIN") {
    const orgCourses = await prisma.course.findMany({
      where: { organizationId: user.activeOrganizationId },
      select: { id: true },
    });
    courseIds = orgCourses.map((c) => c.id);
  }

  if (courseId) {
    courseIds = courseIds.filter((id) => id === courseId);
  }

  const where: any = {
    quiz: { courseId: { in: courseIds } },
  };

  if (status && status !== "ALL") {
    where.status = status;
  }

  const submissions = await prisma.attempt.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    include: {
      student: { select: { id: true, name: true, email: true } },
      quiz: {
        include: {
          course: { select: { id: true, title: true, code: true } },
        },
      },
      answers: {
        where: {
          questionVersion: { type: "ESSAY" },
        },
      },
    },
  });

  return NextResponse.json({ submissions });
}
