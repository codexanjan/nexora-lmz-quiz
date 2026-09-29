import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let vercelDbUrl: string | undefined = undefined;

if (process.env.VERCEL) {
  try {
    const tmpDb = path.join("/tmp", "dev.db");
    const sourceDb = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(tmpDb) && fs.existsSync(sourceDb)) {
      fs.copyFileSync(sourceDb, tmpDb);
    }
    vercelDbUrl = "file:" + tmpDb;
  } catch (e) {
    console.error("Vercel /tmp SQLite initialization error:", e);
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: vercelDbUrl
      ? {
          db: {
            url: vercelDbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
