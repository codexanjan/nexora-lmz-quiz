import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageCourse } from "@/lib/permissions";
import { lessonSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = params.id;
  const allowed = await canManageCourse(user.id, courseId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { moduleId, title, description, content, durationMinutes, isRequired, videoUrl, takeaways, orderIndex } = parsed.data;

    // Verify module belongs to course
    const mod = await prisma.module.findFirst({
      where: { id: moduleId, courseId },
    });
    if (!mod) {
      return NextResponse.json({ error: "Module not found in this course" }, { status: 404 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        description,
        content,
        durationMinutes,
        isRequired,
        videoUrl: videoUrl || null,
        takeaways,
        orderIndex,
      },
    });

    return NextResponse.json({ success: true, lesson });
  } catch (error: any) {
    console.error("Create lesson error:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
