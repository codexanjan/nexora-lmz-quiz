import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { autosaveAnswer } from "@/lib/services/quiz-service";
import { autosaveAnswerSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attemptId = params.id;

  try {
    const body = await req.json();
    const parsed = autosaveAnswerSchema.safeParse({ ...body, attemptId });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { questionVersionId, response, isFlagged, revision } = parsed.data;

    const result = await autosaveAnswer({
      attemptId,
      questionVersionId,
      studentId: user.id,
      response,
      isFlagged,
      revision,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Autosave error:", error);
    return NextResponse.json({ error: error.message || "Failed to save answer" }, { status: 400 });
  }
}
