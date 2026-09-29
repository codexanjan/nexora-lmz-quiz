import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canViewAttempt } from "@/lib/permissions";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attemptId = params.id;
  const allowed = await canViewAttempt(user.id, attemptId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      quiz: {
        include: {
          course: { select: { id: true, title: true, code: true } },
        },
      },
      quizVersion: true,
      questionSnapshots: {
        orderBy: { orderIndex: "asc" },
      },
      answers: true,
      gradeRevisions: {
        orderBy: { createdAt: "desc" },
        include: {
          grader: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

  const isOwner = attempt.studentId === user.id;
  const isTeacherOrAdmin = user.activeRole === "TEACHER" || user.activeRole === "ADMIN";

  return NextResponse.json({
    attempt,
    serverTime: new Date().toISOString(),
    isOwner,
    isTeacherOrAdmin,
  });
}
