import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "HEALTHY";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "DEGRADED";
  }

  const outboxPending = await prisma.outboxEvent.count({
    where: { status: "PENDING" },
  });

  return NextResponse.json({
    status: dbStatus === "HEALTHY" ? "HEALTHY" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    latencyMs: Date.now() - startTime,
    version: "1.0.0",
    services: {
      database: dbStatus,
      outboxQueue: outboxPending === 0 ? "IDLE" : `${outboxPending} PENDING`,
      storage: process.env.STORAGE_MODE === "s3" ? "S3_REMOTE" : "LOCAL_ADAPTER",
      email: process.env.EMAIL_PROVIDER || "DEVELOPMENT_MOCK",
    },
  });
}
