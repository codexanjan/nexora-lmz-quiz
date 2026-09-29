import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassPulse } from "@/lib/services/class-pulse-service";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const courseId = req.nextUrl.searchParams.get("courseId") || undefined;

  try {
    const pulse = await getClassPulse(user.id, courseId);
    return NextResponse.json({ pulse });
  } catch (error: any) {
    console.error("Class Pulse error:", error);
    return NextResponse.json({ error: "Failed to generate Class Pulse" }, { status: 500 });
  }
}
