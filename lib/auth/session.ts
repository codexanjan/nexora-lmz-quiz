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

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  "nexora-lms-learning-intelligence-production-hmac-secret-2026-key";

function signToken(userId: string, exp: number): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp })).toString("base64url");
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

function verifyToken(token: string): { userId: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, hmac] = parts;
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
    if (hmac.length !== expectedHmac.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
  const sessionToken = signToken(userId, expiresAt.getTime());

  try {
    await prisma.session.create({
      data: {
        sessionToken,
        userId,
        expiresAt,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (e) {
    // Graceful fallback for read-only or ephemeral serverless filesystems
  }

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

  let targetUserId: string | null = null;

  // 1. Verify stateless HMAC cryptographic token (works across all serverless containers)
  const verified = verifyToken(token);
  if (verified) {
    targetUserId = verified.userId;
  } else {
    // 2. Fallback to database session table lookup
    try {
      const dbSession = await prisma.session.findUnique({
        where: { sessionToken: token },
      });
      if (dbSession && dbSession.expiresAt >= new Date()) {
        targetUserId = dbSession.userId;
      }
    } catch {}
  }

  if (!targetUserId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) return null;

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
  } catch (err) {
    console.error("getCurrentUser database query error:", err);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { sessionToken: token } });
    } catch {}
  }
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

import { redirect } from "next/navigation";

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: ("STUDENT" | "TEACHER" | "ADMIN" | string)[]): Promise<SessionUser> {
  const user = await requireAuth();
  const hasRole = user.memberships.some((m) => allowedRoles.includes(m.role));
  if (!hasRole) {
    if (user.role === "TEACHER") redirect("/teacher/dashboard");
    else if (user.role === "ADMIN") redirect("/admin/overview");
    else redirect("/student/dashboard");
  }
  return user;
}
