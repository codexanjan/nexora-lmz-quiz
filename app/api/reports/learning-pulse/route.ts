import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateLearningPulse } from "@/lib/services/learning-pulse-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pulse = await calculateLearningPulse(user.id);
    return NextResponse.json({ pulse });
  } catch (error: any) {
    console.error("Learning pulse error:", error);
    return NextResponse.json({ error: "Failed to calculate Learning Pulse" }, { status: 500 });
  }
}
