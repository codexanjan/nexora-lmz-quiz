import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createAuditEvent } from "@/lib/services/audit-service";
import { createNotification } from "@/lib/services/notification-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = params.id;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (course.state !== "PUBLISHED") {
    return NextResponse.json({ error: "Course is not currently open for enrollment" }, { status: 400 });
  }

  // Check enrollment limit
  if (course.enrollmentLimit && course._count.enrollments >= course.enrollmentLimit) {
    return NextResponse.json({ error: "Course enrollment limit has been reached" }, { status: 400 });
  }

  // Optional code check if payload includes code
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  if (course.enrollmentCode && body?.code) {
    if (body.code.trim().toUpperCase() !== course.enrollmentCode.trim().toUpperCase()) {
      return NextResponse.json({ error: "Invalid enrollment code" }, { status: 400 });
    }
  }

  // Check existing enrollment
  const existing = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: user.id },
    },
  });

  if (existing) {
    return NextResponse.json({ message: "Already enrolled", enrollment: existing });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      courseId,
      studentId: user.id,
      status: "ACTIVE",
    },
  });

  await createAuditEvent({
    organizationId: course.organizationId,
    actorId: user.id,
    action: "STUDENT_ENROLL",
    entityType: "Enrollment",
    entityId: enrollment.id,
    metadata: { courseTitle: course.title, studentName: user.name },
  });

  await createNotification({
    userId: user.id,
    organizationId: course.organizationId,
    type: "ENROLLMENT_SUCCESS",
    title: `Enrolled: ${course.title}`,
    message: `You have successfully enrolled in ${course.title}. Start your first lesson now!`,
    linkUrl: `/student/courses/${course.id}`,
  });

  return NextResponse.json({ success: true, enrollment });
}
