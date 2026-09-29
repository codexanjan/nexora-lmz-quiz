import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { courseSchema } from "@/lib/validation";
import { createAuditEvent } from "@/lib/services/audit-service";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const searchParams = req.nextUrl.searchParams;
  const filter = searchParams.get("filter"); // "enrolled", "teaching", "all"

  if (!user) {
    // Public published courses
    const courses = await prisma.course.findMany({
      where: { state: "PUBLISHED" },
      include: {
        courseTeachers: { include: { teacher: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
    });
    return NextResponse.json({ courses });
  }

  const role = user.activeRole;

  if (role === "STUDENT") {
    let whereCondition: any = { state: "PUBLISHED" };
    if (filter === "enrolled") {
      whereCondition = {
        state: "PUBLISHED",
        enrollments: { some: { studentId: user.id } },
      };
    }

    const courses = await prisma.course.findMany({
      where: whereCondition,
      include: {
        courseTeachers: { include: { teacher: true } },
        enrollments: { where: { studentId: user.id } },
        modules: {
          include: {
            lessons: {
              where: { isRequired: true },
              select: { id: true },
            },
          },
        },
        quizzes: {
          where: { state: "PUBLISHED", isRequired: true },
          select: { id: true },
        },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } else if (role === "TEACHER") {
    // Teachers see courses they teach or organization courses
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { courseTeachers: { some: { teacherId: user.id } } },
          { organizationId: user.activeOrganizationId },
        ],
      },
      include: {
        courseTeachers: { include: { teacher: true } },
        _count: { select: { enrollments: true, modules: true, quizzes: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ courses });
  } else {
    // Admin sees all in organization
    const courses = await prisma.course.findMany({
      where: { organizationId: user.activeOrganizationId },
      include: {
        courseTeachers: { include: { teacher: true } },
        _count: { select: { enrollments: true, modules: true, quizzes: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ courses });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.activeRole !== "TEACHER" && user.activeRole !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const orgId = user.activeOrganizationId || user.memberships[0]?.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    const { title, code, description, slug, enrollmentCode, enrollmentLimit } = parsed.data;

    const course = await prisma.course.create({
      data: {
        organizationId: orgId,
        title,
        code,
        description,
        slug,
        enrollmentCode: enrollmentCode || `NX-${code.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        enrollmentLimit: enrollmentLimit || 100,
        state: "DRAFT",
        courseTeachers: {
          create: [{ teacherId: user.id, role: "PRIMARY" }],
        },
      },
    });

    await createAuditEvent({
      organizationId: orgId,
      actorId: user.id,
      action: "COURSE_CREATE",
      entityType: "Course",
      entityId: course.id,
      metadata: { title, code },
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Failed to create course. Ensure slug is unique." }, { status: 500 });
  }
}
