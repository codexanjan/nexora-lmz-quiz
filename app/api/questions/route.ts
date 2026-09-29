import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { questionSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");
  const type = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");

  const where: any = {
    organizationId: user.activeOrganizationId,
  };

  if (courseId) where.courseId = courseId;
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.prompt = { contains: search };
  }

  const questions = await prisma.question.findMany({
    where,
    include: {
      course: { select: { id: true, title: true, code: true } },
      author: { select: { id: true, name: true } },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.activeRole !== "TEACHER" && user.activeRole !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = questionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { courseId, type, prompt, options, correctAnswers, acceptedAnswers, explanation, rubric, points, difficulty, tags } = parsed.data;

    const orgId = user.activeOrganizationId || user.memberships[0]?.organizationId;

    const question = await prisma.question.create({
      data: {
        organizationId: orgId,
        courseId: courseId || null,
        authorId: user.id,
        type,
        prompt,
        options,
        correctAnswers,
        acceptedAnswers,
        explanation,
        rubric,
        points,
        difficulty,
        tags,
        versions: {
          create: {
            versionNumber: 1,
            type,
            prompt,
            options,
            correctAnswers,
            acceptedAnswers,
            explanation,
            rubric,
            points,
            difficulty,
            tags,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    console.error("Create question error:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
