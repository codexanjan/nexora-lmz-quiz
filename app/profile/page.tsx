import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await requireAuth();

  const [dbUser, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        createdAt: true,
      },
    }),
    prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!dbUser) {
    throw new Error("User record not found");
  }

  const formattedSessions = sessions.map((s) => ({
    id: s.id,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    createdAt: s.createdAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
  }));

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      organizationName={user.organizationName}
    >
      <ProfileClient
        user={{
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          timezone: dbUser.timezone,
          activeRole: user.role || "STUDENT",
          organizationName: user.organizationName || "Nexora Demo University",
          createdAt: dbUser.createdAt.toISOString(),
        }}
        sessions={formattedSessions}
      />
    </AppShell>
  );
}
