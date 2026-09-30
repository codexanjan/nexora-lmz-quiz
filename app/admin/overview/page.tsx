import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/db/prisma";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  ShieldAlert,
  Server,
  Activity,
  BookOpen,
  FileCheck2,
  FileText,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const user = await requireRole(["ADMIN"]);

  const [
    totalUsers,
    totalTeachers,
    totalStudents,
    totalCourses,
    totalQuizzes,
    totalAttempts,
    recentAlerts,
    recentAuditLogs,
    pendingOutboxCount,
  ] = await Promise.all([
    prisma.membership.count({
      where: { organizationId: user.activeOrganizationId },
    }),
    prisma.membership.count({
      where: {
        organizationId: user.activeOrganizationId,
        role: "TEACHER",
      },
    }),
    prisma.membership.count({
      where: {
        organizationId: user.activeOrganizationId,
        role: "STUDENT",
      },
    }),
    prisma.course.count({
      where: { organizationId: user.activeOrganizationId },
    }),
    prisma.quiz.count({
      where: { organizationId: user.activeOrganizationId },
    }),
    prisma.attempt.count(),
    prisma.alert.findMany({
      where: {
        isResolved: false,
        organizationId: user.activeOrganizationId,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.auditEvent.findMany({
      where: { organizationId: user.activeOrganizationId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        actor: { select: { name: true, email: true } },
      },
    }),
    prisma.outboxEvent.count({
      where: { status: "PENDING" },
    }),
  ]);

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      organizationName={user.organizationName}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold text-slate-100">
                System Administration
              </h1>
              <Badge className="bg-primary/10 text-primary-light border-primary/30">
                Platform Root
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Multi-tenant telemetry, user memberships, audit governance, and operational health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/users">
              <Button className="bg-primary hover:bg-primary-hover text-white text-sm">
                <Users className="w-4 h-4 mr-2" /> Manage Users
              </Button>
            </Link>
            <Link href="/admin/health">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-sm"
              >
                <Server className="w-4 h-4 mr-2" /> Health Telemetry
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Total Members
              </span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-slate-100">
                {totalUsers}
              </span>
              <span className="text-xs text-slate-400">
                ({totalTeachers} teachers, {totalStudents} students)
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Active within {user.organizationName}
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Active Courses
              </span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-slate-100">
                {totalCourses}
              </span>
              <span className="text-xs text-slate-400">
                ({totalQuizzes} quizzes created)
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Managed academic curricula
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Total Submissions
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-slate-100">
                {totalAttempts}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                Persisted
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Validated assessment attempts
            </p>
          </GlassCard>

          <GlassCard className="p-5 border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                System Status
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xl font-display font-bold text-emerald-400">
                Operational
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {pendingOutboxCount} pending outbox events
            </p>
          </GlassCard>
        </div>

        {/* Alerts & Audit Logs Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active System Alerts */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-display font-bold text-slate-100">
                  System Alerts
                </h2>
              </div>
              <Badge variant="outline" className="text-xs text-slate-400">
                {recentAlerts.length} Active
              </Badge>
            </div>

            {recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-elevated/40 border border-white/10 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={
                            alert.level === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]"
                              : alert.level === "WARNING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]"
                          }
                        >
                          {alert.level}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {alert.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No active system alerts</p>
                <p className="text-xs mt-1 text-slate-500">
                  All subsystems and background processors running cleanly.
                </p>
              </div>
            )}
          </GlassCard>

          {/* Recent Audit Trail */}
          <GlassCard className="p-6 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold text-slate-100">
                  Security & Audit Trail
                </h2>
              </div>
              <Link
                href="/admin/audit-log"
                className="text-xs text-primary-light hover:underline flex items-center gap-1"
              >
                View all logs →
              </Link>
            </div>

            <div className="space-y-3">
              {recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-elevated/40 border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-200">
                          {log.action}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">
                          {log.actor?.name || "System"}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Target: {log.entityType} ({log.entityId.slice(0, 10)}...)
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
