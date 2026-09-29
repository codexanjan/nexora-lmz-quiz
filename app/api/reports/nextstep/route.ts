import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getNextStepRecommendations } from "@/lib/services/nextstep-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const recommendations = await getNextStepRecommendations(user.id);
    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("NextStep error:", error);
    return NextResponse.json({ error: "Failed to generate NextStep actions" }, { status: 500 });
  }
}
