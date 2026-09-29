import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getReviewLoopItems } from "@/lib/services/reviewloop-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await getReviewLoopItems(user.id);
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("ReviewLoop error:", error);
    return NextResponse.json({ error: "Failed to generate ReviewLoop items" }, { status: 500 });
  }
}
