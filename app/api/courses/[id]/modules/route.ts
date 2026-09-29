import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageCourse } from "@/lib/permissions";
import { moduleSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courseId = params.id;
  const allowed = await canManageCourse(user.id, courseId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = moduleSchema.safeParse({ ...body, courseId });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { title, description, orderIndex } = parsed.data;

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        description,
        orderIndex,
      },
    });

    return NextResponse.json({ success: true, module });
  } catch (error: any) {
    console.error("Create module error:", error);
    return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
  }
}
