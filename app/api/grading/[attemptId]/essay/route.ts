import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { canGradeAttempt } from "@/lib/permissions";
import { gradeEssayAnswer } from "@/lib/services/grading-service";
import { gradeRevisionSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: { attemptId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const attemptId = params.attemptId;
  const allowed = await canGradeAttempt(user.id, attemptId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = gradeRevisionSchema.safeParse({ ...body, attemptId });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { answerId, newScore, newFeedback, reason } = parsed.data;
    if (!answerId) {
      return NextResponse.json({ error: "answerId is required" }, { status: 400 });
    }

    const updatedAttempt = await gradeEssayAnswer({
      attemptId,
      answerId,
      graderId: user.id,
      score: newScore,
      feedback: newFeedback,
      reason,
    });

    return NextResponse.json({ success: true, attempt: updatedAttempt });
  } catch (error: any) {
    console.error("Grade essay error:", error);
    return NextResponse.json({ error: error.message || "Failed to grade essay" }, { status: 400 });
  }
}
