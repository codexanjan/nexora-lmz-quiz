import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const quizId = params.id;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: {
          questions: {
            include: { questionVersion: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      accommodations: user ? { where: { studentId: user.id } } : false,
      attempts: user
        ? {
            where: { studentId: user.id },
            orderBy: { attemptNumber: "desc" },
          }
        : false,
    },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const latestVersion = quiz.versions[0];
  const accommodation = user && quiz.accommodations ? quiz.accommodations[0] : null;

  const effectiveTimeLimit = (latestVersion?.timeLimitMinutes || 30) + (accommodation?.extraTimeMinutes || 0);
  const effectiveMaxAttempts = (latestVersion?.maxAttempts || 1) + (accommodation?.extraAttempts || 0);

  const completedAttemptsCount = user && quiz.attempts ? quiz.attempts.filter((a) => a.status !== "IN_PROGRESS").length : 0;
  const attemptsRemaining = Math.max(0, effectiveMaxAttempts - completedAttemptsCount);

  // Active in-progress attempt if any
  const activeAttempt = user && quiz.attempts ? quiz.attempts.find((a) => a.status === "IN_PROGRESS") : null;

  return NextResponse.json({
    quiz,
    latestVersion,
    effectiveTimeLimit,
    effectiveMaxAttempts,
    attemptsRemaining,
    activeAttemptId: activeAttempt ? activeAttempt.id : null,
    previousAttempts: quiz.attempts || [],
  });
}
