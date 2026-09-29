import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { dispatchDomainEvent } from "@/lib/services/event-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.activeRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: {
      memberships: {
        some: { organizationId: user.activeOrganizationId },
      },
    },
    include: {
      memberships: {
        where: { organizationId: user.activeOrganizationId },
      },
      _count: {
        select: { enrollments: true, attempts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.activeRole !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { userId, newRole } = await req.json();
    if (!["STUDENT", "TEACHER", "ADMIN"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const membership = await prisma.membership.findFirst({
      where: { userId, organizationId: user.activeOrganizationId },
      include: { user: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: { role: newRole },
    });

    await dispatchDomainEvent("MEMBERSHIP_ROLE_CHANGED", {
      userId,
      targetUserName: membership.user.name,
      newRole,
      organizationId: user.activeOrganizationId!,
      actorId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Change role error:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
