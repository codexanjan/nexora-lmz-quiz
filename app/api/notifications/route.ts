import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserNotifications } from "@/lib/services/notification-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getUserNotifications(user.id);
  return NextResponse.json(data);
}
