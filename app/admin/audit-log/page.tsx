import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { AuditLogClient } from "./audit-log-client";

export default async function AdminAuditLogPage() {
  const admin = await requireRole(["ADMIN"]);

  const logs = await prisma.auditEvent.findMany({
    where: { organizationId: admin.activeOrganizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
  });

  const formattedLogs = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    actorId: log.actorId,
    actorName: log.actor?.name || "System Automated",
    actorEmail: log.actor?.email || "system@nexora.local",
    payload: log.metadata,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <AppShell
      role={admin.role}
      userName={admin.name}
      userEmail={admin.email}
      organizationName={admin.organizationName}
    >
      <AuditLogClient initialLogs={formattedLogs} />
    </AppShell>
  );
}
