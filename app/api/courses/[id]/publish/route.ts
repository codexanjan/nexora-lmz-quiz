import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageCourse } from "@/lib/permissions";
import { dispatchDomainEvent } from "@/lib/services/event-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = params.id;
  const allowed = await canManageCourse(user.id, courseId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { include: { lessons: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Validate at least one module and lesson exists before publishing
  const hasLessons = course.modules.some((m) => m.lessons.length > 0);
  if (!hasLessons) {
    return NextResponse.json({ error: "Cannot publish course without at least one lesson" }, { status: 400 });
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: { state: "PUBLISHED" },
  });

  await dispatchDomainEvent("COURSE_PUBLISHED", {
    courseId,
    title: course.title,
    organizationId: course.organizationId,
    actorId: user.id,
  });

  return NextResponse.json({ success: true, course: updatedCourse });
}
