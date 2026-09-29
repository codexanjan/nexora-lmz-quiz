import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSystemAlerts, resolveAlert, acknowledgeAlert } from "@/lib/services/alert-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = user.activeOrganizationId || user.memberships[0]?.organizationId;
  if (!orgId) return NextResponse.json({ alerts: [] });

  const alerts = await getSystemAlerts(orgId);
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { alertId, action } = await req.json();
    if (action === "resolve") {
      await resolveAlert(alertId);
    } else {
      await acknowledgeAlert(alertId);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
