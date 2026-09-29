import { prisma } from "@/lib/db/prisma";

export async function createNotification({
  userId,
  organizationId,
  type,
  title,
  message,
  linkUrl,
}: {
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        organizationId,
        type,
        title,
        message,
        linkUrl,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return { notifications, unreadCount };
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}
