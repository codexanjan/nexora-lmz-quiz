import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { canGradeAttempt } from "@/lib/permissions";
import { releaseAttemptResult } from "@/lib/services/grading-service";

export async function POST(req: NextRequest, { params }: { params: { attemptId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const attemptId = params.attemptId;
  const allowed = await canGradeAttempt(user.id, attemptId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const updatedAttempt = await releaseAttemptResult(attemptId, user.id);
    return NextResponse.json({ success: true, attempt: updatedAttempt });
  } catch (error: any) {
    console.error("Release result error:", error);
    return NextResponse.json({ error: error.message || "Failed to release result" }, { status: 400 });
  }
}
