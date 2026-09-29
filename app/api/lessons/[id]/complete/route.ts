import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { completeLesson } from "@/lib/services/progress-service";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lessonId = params.id;

  try {
    const result = await completeLesson(user.id, lessonId);
    return NextResponse.json({
      success: true,
      progress: result.progress,
      courseProgress: result.courseProgress,
    });
  } catch (error: any) {
    console.error("Complete lesson error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete lesson" }, { status: 500 });
  }
}
