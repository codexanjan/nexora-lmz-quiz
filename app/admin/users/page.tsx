import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const admin = await requireRole(["ADMIN"]);

  const usersData = await prisma.user.findMany({
    where: {
      memberships: {
        some: { organizationId: admin.activeOrganizationId },
      },
    },
    include: {
      memberships: {
        where: { organizationId: admin.activeOrganizationId },
      },
      _count: {
        select: {
          enrollments: true,
          attempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedUsers = usersData.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt.toISOString(),
    role: (u.memberships[0]?.role || "STUDENT") as "STUDENT" | "TEACHER" | "ADMIN",
    membershipId: u.memberships[0]?.id || "",
    enrollmentsCount: u._count.enrollments,
    attemptsCount: u._count.attempts,
  }));

  return (
    <AppShell
      role={admin.role}
      userName={admin.name}
      userEmail={admin.email}
      organizationName={admin.organizationName}
    >
      <UsersClient initialUsers={formattedUsers} currentAdminId={admin.id} />
    </AppShell>
  );
}
