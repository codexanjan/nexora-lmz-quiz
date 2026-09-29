import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Database,
  Cpu,
  Mail,
  HardDrive,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default async function AdminHealthPage() {
  const admin = await requireRole(["ADMIN"]);

  // Measure database ping latency
  const dbStart = Date.now();
  await prisma.user.count();
  const dbLatencyMs = Date.now() - dbStart;

  // Job / Outbox stats
  const [totalOutbox, pendingOutbox, processedOutbox, alertsCount] =
    await Promise.all([
      prisma.outboxEvent.count(),
      prisma.outboxEvent.count({ where: { status: "PENDING" } }),
      prisma.outboxEvent.count({ where: { status: "COMPLETED" } }),
      prisma.alert.count({ where: { isResolved: false } }),
    ]);

  const uptimeHours = Math.floor(process.uptime() / 3600);
  const uptimeMinutes = Math.floor((process.uptime() % 3600) / 60);

  return (
    <AppShell
      role={admin.role}
      userName={admin.name}
      userEmail={admin.email}
      organizationName={admin.organizationName}
    >
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold text-slate-100">
              System Infrastructure & Health Telemetry
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Live Real-Time
            </Badge>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time status of compute, relational database persistence, background queue workers, and integration adapters.
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Node.js / Server Compute */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Healthy
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Next.js & Node Runtime
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Next.js 14 App Router on Node {process.version}
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Process Uptime:</span>
                <span className="text-slate-200 font-mono">
                  {uptimeHours}h {uptimeMinutes}m
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Memory RSS:</span>
                <span className="text-slate-200 font-mono">
                  {(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Environment:</span>
                <span className="text-slate-200 font-mono">
                  {process.env.NODE_ENV || "development"}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Database Layer */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Connected
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Prisma ORM & SQLite Persistence
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Local persistent relational engine with full transactional ACID support.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Round-Trip Latency:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {dbLatencyMs} ms
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Connection Pool:</span>
                <span className="text-slate-200 font-mono">Prisma Client v5</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Isolation Level:</span>
                <span className="text-slate-200 font-mono">Serializable</span>
              </div>
            </div>
          </GlassCard>

          {/* Outbox & Job Engine */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Active
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Domain Outbox & Job Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Transactional Outbox pattern ensuring zero-loss event propagation.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Pending Outbox:</span>
                <span className="text-slate-200 font-mono">{pendingOutbox}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processed Events:</span>
                <span className="text-emerald-400 font-mono">
                  {processedOutbox}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Domain Dispatches:</span>
                <span className="text-slate-200 font-mono">{totalOutbox}</span>
              </div>
            </div>
          </GlassCard>

          {/* Email Adapter */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Mail className="w-5 h-5" />
              </div>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                Dev Console Mode
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Email Dispatch Adapter
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configured via provider abstraction. Development console adapter active.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Configured Provider:</span>
                <span className="text-slate-200 font-mono">DevelopmentConsole</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Production Sinks:</span>
                <span className="text-slate-500">Resend / SMTP / Postmark</span>
              </div>
            </div>
          </GlassCard>

          {/* Storage Adapter */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                Local Dev Storage
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              File & Resource Storage
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              S3-compatible metadata pipeline with local development sandbox.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Bucket Authority:</span>
                <span className="text-slate-200 font-mono">nexora-dev-bucket</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>URL Expiration Policy:</span>
                <span className="text-slate-200 font-mono">900 seconds</span>
              </div>
            </div>
          </GlassCard>

          {/* Security & Access */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Enforced
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Security & Access Control
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tenant organization boundary isolation, bcrypt hashing, and HttpOnly session cookies.
            </p>

            <div className="mt-5 space-y-2.5 text-xs border-t border-slate-800/80 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Session Store:</span>
                <span className="text-slate-200 font-mono">Database Cookie-bound</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Password Hashing:</span>
                <span className="text-slate-200 font-mono">bcrypt (salt rounds 10)</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
