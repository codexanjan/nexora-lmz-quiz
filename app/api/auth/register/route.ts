import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation";
import { createAuditEvent } from "@/lib/services/audit-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Default to main demo organization or first organization
    let org = await prisma.organization.findFirst({
      where: { slug: "nexora-demo" },
    });

    if (!org) {
      org = await prisma.organization.create({
        data: { name: "Nexora Demo University", slug: "nexora-demo" },
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        memberships: {
          create: {
            organizationId: org.id,
            role: role || "STUDENT",
          },
        },
      },
      include: {
        memberships: { include: { organization: true } },
      },
    });

    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;

    await createSession(user.id, userAgent, ipAddress);

    await createAuditEvent({
      organizationId: org.id,
      actorId: user.id,
      action: "USER_REGISTER",
      entityType: "User",
      entityId: user.id,
      metadata: { role: role || "STUDENT" },
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role || "STUDENT",
        organizationName: org.name,
      },
    });
  } catch (error: any) {
    console.error("Register route error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
