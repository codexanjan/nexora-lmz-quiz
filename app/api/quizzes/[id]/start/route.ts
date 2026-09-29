import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { startQuizAttempt } from "@/lib/services/quiz-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quizId = params.id;

  try {
    const attempt = await startQuizAttempt(user.id, quizId);
    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error: any) {
    console.error("Start quiz error:", error);
    return NextResponse.json({ error: error.message || "Failed to start quiz" }, { status: 400 });
  }
}
