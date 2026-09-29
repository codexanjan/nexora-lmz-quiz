import { prisma } from "@/lib/db/prisma";

export async function createSystemAlert({
  organizationId,
  category,
  level,
  title,
  message,
  linkUrl,
}: {
  organizationId: string;
  category: "SYSTEM" | "SECURITY" | "COURSE" | "QUIZ" | "GRADING" | "ENROLLMENT" | "RESOURCE" | "INTEGRATION" | string;
  level: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL" | string;
  title: string;
  message: string;
  linkUrl?: string;
}) {
  try {
    return await prisma.alert.create({
      data: {
        organizationId,
        category,
        level,
        title,
        message,
        linkUrl: linkUrl || null,
      },
    });
  } catch (error) {
    console.error("Failed to create system alert:", error);
  }
}

export async function getSystemAlerts(organizationId: string) {
  return await prisma.alert.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function resolveAlert(alertId: string) {
  return await prisma.alert.update({
    where: { id: alertId },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
    },
  });
}

export async function acknowledgeAlert(alertId: string) {
  return await prisma.alert.update({
    where: { id: alertId },
    data: {
      isAcknowledged: true,
    },
  });
}
