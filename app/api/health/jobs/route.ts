import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const pending = await prisma.outboxEvent.count({ where: { status: "PENDING" } });
  const failed = await prisma.outboxEvent.count({ where: { status: "FAILED" } });
  const completed = await prisma.outboxEvent.count({ where: { status: "COMPLETED" } });

  return NextResponse.json({
    status: failed > 10 ? "WARNING" : "HEALTHY",
    queueType: "Transactional Outbox Engine",
    metrics: {
      pending,
      failed,
      completed,
    },
    checkedAt: new Date().toISOString(),
  });
}
