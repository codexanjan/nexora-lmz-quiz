import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { submitQuizAttempt } from "@/lib/services/quiz-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attemptId = params.id;

  try {
    const attempt = await submitQuizAttempt(attemptId, user.id);
    return NextResponse.json({
      success: true,
      status: attempt.status,
      percentage: attempt.percentage,
      isPassed: attempt.isPassed,
      totalPointsEarned: attempt.totalPointsEarned,
      totalPointsPossible: attempt.totalPointsPossible,
    });
  } catch (error: any) {
    console.error("Submit quiz error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit attempt" }, { status: 400 });
  }
}
