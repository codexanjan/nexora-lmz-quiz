import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "UP",
      responseTimeMs: Date.now() - start,
      database: "SQLite (dev.db)",
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "DOWN",
      error: error.message,
      checkedAt: new Date().toISOString(),
    }, { status: 503 });
  }
}
