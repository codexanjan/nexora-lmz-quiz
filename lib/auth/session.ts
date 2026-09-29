import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

const SESSION_COOKIE_NAME = "nexora_session";
const SESSION_DURATION_DAYS = 7;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  timezone: string;
  memberships: {
    id: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: "STUDENT" | "TEACHER" | "ADMIN" | string;
  }[];
  activeOrganizationId?: string;
  activeRole?: "STUDENT" | "TEACHER" | "ADMIN" | string;
  role?: string;
  organizationName?: string;
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
    },
  });

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionToken;
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  const user = session.user;
  const memberships = user.memberships.map((m) => ({
    id: m.id,
    organizationId: m.organizationId,
    organizationName: m.organization.name,
    organizationSlug: m.organization.slug,
    role: m.role,
  }));

  const activeMembership = memberships[0];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    timezone: user.timezone,
    memberships,
    activeOrganizationId: activeMembership?.organizationId,
    activeRole: activeMembership?.role,
    role: activeMembership?.role,
    organizationName: activeMembership?.organizationName,
  };
}

export async function destroySession(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await prisma.session.deleteMany({ where: { sessionToken: token } }).catch(() => {});
  }
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: ("STUDENT" | "TEACHER" | "ADMIN" | string)[]): Promise<SessionUser> {
  const user = await requireAuth();
  const hasRole = user.memberships.some((m) => allowedRoles.includes(m.role));
  if (!hasRole) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
