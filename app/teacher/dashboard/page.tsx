import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getClassPulse } from "@/lib/services/class-pulse-service";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.activeRole === "STUDENT") redirect("/student/dashboard");

  const pulse = await getClassPulse(user.id);

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-card border border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-accent mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Instructor Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Class Pulse overview and student evaluation queue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/teacher/courses/new">
              <Button size="sm" variant="outline">Create Course</Button>
            </Link>
            <Link href="/teacher/quizzes">
              <Button size="sm">Build Quiz</Button>
            </Link>
          </div>
        </div>

        {/* Real DB Metrics Cards (Section 31) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Active Courses</span>
            <div className="text-2xl font-bold text-white font-mono">{pulse.activeCoursesCount}</div>
            <span className="text-[10px] text-text-muted">Assigned</span>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Total Students</span>
            <div className="text-2xl font-bold text-white font-mono">{pulse.totalStudentsCount}</div>
            <span className="text-[10px] text-text-muted">Enrolled</span>
          </Card>

          <Card className="p-4 space-y-1 border-warning/30 bg-warning/5">
            <span className="text-[11px] font-mono text-warning uppercase font-semibold">Pending Grading</span>
            <div className="text-2xl font-bold text-warning font-mono">{pulse.pendingGradingCount}</div>
            <span className="text-[10px] text-text-muted">Essays Waiting</span>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Average Score</span>
            <div className="text-2xl font-bold text-white font-mono">{pulse.averageFinalizedScore}%</div>
            <span className="text-[10px] text-text-muted">Selected Attempts</span>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Completion Rate</span>
            <div className="text-2xl font-bold text-secondary font-mono">{pulse.overallCompletionRate}%</div>
            <span className="text-[10px] text-text-muted">Required Activities</span>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] font-mono text-text-muted uppercase">Quiz Participation</span>
            <div className="text-2xl font-bold text-accent font-mono">{pulse.quizParticipationRate}%</div>
            <span className="text-[10px] text-text-muted">Class Turnout</span>
          </Card>
        </div>

        {/* Intelligence Split: Class Pulse GapMap & Students Needing Support */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* GapMap™ Concept Analysis (Section 66) */}
          <div className="lg:col-span-7">
            <Card className="h-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/20 text-accent border border-primary/30">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">GapMap™ Concept Gaps</h2>
                    <p className="text-xs text-text-secondary">Aggregated error rates across student assessment questions</p>
                  </div>
                </div>
                <Link href="/teacher/reports" className="text-xs text-primary-light hover:underline font-medium">
                  Detailed Reports
                </Link>
              </div>

              <div className="space-y-3">
                {pulse.gapMap.length === 0 ? (
                  <p className="text-xs text-text-muted py-8 text-center">No concept error telemetry recorded yet.</p>
                ) : (
                  pulse.gapMap.slice(0, 4).map((concept) => (
                    <div key={concept.concept} className="space-y-1.5 p-3 rounded-xl bg-surface/80 border border-white/10">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text-primary">{concept.concept}</span>
                        <span className="font-mono text-critical font-bold">{concept.incorrectPercentage}% Missed</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full bg-critical rounded-full"
                          style={{ width: `${concept.incorrectPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted font-mono">
                        <span>{concept.totalAnswered} Question Attempts</span>
                        <span>{concept.pointsLost} Points Deducted</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Student Support Indicators (Section 33) */}
          <div className="lg:col-span-5">
            <Card className="h-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-warning/20 text-warning border border-warning/30">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Students Requiring Support</h2>
                    <p className="text-xs text-text-secondary">Explicit non-opaque academic indicators</p>
                  </div>
                </div>
                <Badge variant="warning">{pulse.atRiskStudents.length} Students</Badge>
              </div>

              <div className="space-y-3">
                {pulse.atRiskStudents.length === 0 ? (
                  <div className="text-center py-8 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-success mx-auto opacity-70" />
                    <p className="text-xs font-semibold text-text-primary">All students meeting targets</p>
                    <p className="text-[11px] text-text-secondary">No students flagged for overdue lessons or low scores.</p>
                  </div>
                ) : (
                  pulse.atRiskStudents.map((st) => (
                    <div key={st.studentId} className="p-3.5 rounded-xl bg-surface/80 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">{st.studentName}</span>
                        <Badge variant="warning" className="text-[10px]">{st.severity} Priority</Badge>
                      </div>
                      <div className="space-y-1">
                        {st.reasons.map((r, i) => (
                          <div key={i} className="text-[11px] text-critical/90 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-critical shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Submissions Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Recent Submissions Queue</h2>
            <Link href="/teacher/submissions" className="text-xs text-primary-light hover:underline font-medium">
              View Full Grading Queue
            </Link>
          </div>

          <div className="space-y-2">
            {pulse.recentSubmissions.length === 0 ? (
              <Card className="p-8 text-center text-text-muted text-xs">No recent assessment submissions.</Card>
            ) : (
              pulse.recentSubmissions.map((sub) => (
                <Card key={sub.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{sub.studentName}</span>
                      <span className="text-xs text-text-muted">• {sub.quizTitle}</span>
                      <Badge variant={sub.status === "AWAITING_GRADING" ? "warning" : sub.status === "RELEASED" ? "success" : "default"}>
                        {sub.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-text-muted font-mono">
                      Submitted: {new Date(sub.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  <Link href={`/teacher/submissions/${sub.id}`}>
                    <Button size="sm" variant={sub.status === "AWAITING_GRADING" ? "primary" : "outline"}>
                      {sub.status === "AWAITING_GRADING" ? "Grade Essay" : "Review"}
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
