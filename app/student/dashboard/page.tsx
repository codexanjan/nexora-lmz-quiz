import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateLearningPulse } from "@/lib/services/learning-pulse-service";
import { getNextStepRecommendations } from "@/lib/services/nextstep-service";
import { getReviewLoopItems } from "@/lib/services/reviewloop-service";
import { calculateCourseProgress } from "@/lib/services/progress-service";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  BookOpen,
  HelpCircle,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.activeRole === "TEACHER") redirect("/teacher/dashboard");
  if (user.activeRole === "ADMIN") redirect("/admin/overview");

  // Fetch real database state
  const pulse = await calculateLearningPulse(user.id);
  const nextSteps = await getNextStepRecommendations(user.id);
  const reviewItems = await getReviewLoopItems(user.id);

  // Enrolled courses with progress calculation
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      course: {
        include: {
          courseTeachers: { include: { teacher: true } },
          modules: { include: { lessons: true } },
        },
      },
    },
  });

  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enr) => {
      const progress = await calculateCourseProgress(user.id, enr.courseId);
      // Find first incomplete lesson to continue
      const nextLesson = await prisma.lesson.findFirst({
        where: {
          module: { courseId: enr.courseId },
          isRequired: true,
          progress: { none: { studentId: user.id, isCompleted: true } },
        },
        orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
      });

      return {
        ...enr.course,
        progress,
        nextLessonId: nextLesson?.id,
      };
    })
  );

  // Upcoming published quizzes
  const courseIds = enrollments.map((e) => e.courseId);
  const upcomingQuizzes = await prisma.quiz.findMany({
    where: {
      courseId: { in: courseIds },
      state: "PUBLISHED",
    },
    include: {
      course: true,
      attempts: {
        where: { studentId: user.id },
        orderBy: { attemptNumber: "desc" },
      },
    },
    take: 3,
  });

  // Recent results
  const recentResults = await prisma.attempt.findMany({
    where: {
      studentId: user.id,
      status: { in: ["GRADED", "RELEASED"] },
    },
    orderBy: { submittedAt: "desc" },
    include: {
      quiz: { include: { course: true } },
      answers: {
        where: { feedback: { not: null } },
        select: { feedback: true },
      },
    },
    take: 3,
  });

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-12">
        {/* Personalized Hero Header (Section 27) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-card border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-accent mb-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Academic Pulse Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
              Good evening, {user.name.split(" ")[0]}.
            </h1>
            <p className="text-sm text-text-secondary max-w-xl">
              Let&apos;s keep your learning momentum going. Review your transparent signals and next recommended study actions below.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <Link href="/student/courses">
              <Button variant="outline" size="sm">Browse Courses</Button>
            </Link>
            <Link href="/student/learning-pulse">
              <Button size="sm">View Full Pulse</Button>
            </Link>
          </div>
        </div>

        {/* Top Intelligence Grid: Learning Pulse & NextStep */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Learning Pulse™ Widget (Section 28) */}
          <div className="lg:col-span-5">
            <Card className="h-full border-primary/20 shadow-glow/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/20 text-accent border border-primary/30">
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-text-primary">Learning Pulse™</h2>
                      <p className="text-xs text-text-secondary">Transparent Health Score</p>
                    </div>
                  </div>
                  <Badge variant={pulse.score >= 75 ? "success" : pulse.score >= 50 ? "warning" : "critical"}>
                    {pulse.label}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-3 my-4">
                  <span className="text-5xl font-bold font-heading tracking-tight text-white">
                    {pulse.score}
                  </span>
                  <span className="text-xs text-text-muted font-mono">/ 100 PTS</span>
                </div>

                {/* Signals breakdown */}
                <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-mono">
                    Underlying Telemetry Signals
                  </p>
                  {pulse.signals.map((sig, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {sig.type === "positive" ? (
                        <span className="text-success font-bold font-mono">+</span>
                      ) : sig.type === "negative" ? (
                        <span className="text-critical font-bold font-mono">-</span>
                      ) : (
                        <span className="text-text-muted font-bold font-mono">•</span>
                      )}
                      <span className={sig.type === "negative" ? "text-critical/90" : "text-text-secondary"}>
                        {sig.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10">
                <Link href="/student/learning-pulse" className="text-xs text-primary-light hover:underline flex items-center justify-between">
                  <span>How is this score computed?</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </div>

          {/* NextStep™ Widget (Section 29) */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-secondary/20 text-secondary border border-secondary/30">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">NextStep™ Engine</h2>
                    <p className="text-xs text-text-secondary">Prioritized learning actions derived from actual state</p>
                  </div>
                </div>
                <Badge variant="secondary">Data-Driven</Badge>
              </div>

              <div className="space-y-3">
                {nextSteps.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">All recommended activities completed!</p>
                ) : (
                  nextSteps.slice(0, 3).map((step) => (
                    <div
                      key={step.id}
                      className="p-3.5 rounded-2xl bg-surface/80 border border-white/10 hover:border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-primary">{step.title}</span>
                          {step.badge && <Badge variant="outline" className="text-[10px]">{step.badge}</Badge>}
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-1">{step.description}</p>
                      </div>
                      <Link href={step.actionUrl} className="shrink-0">
                        <Button size="sm" variant={step.priority === "HIGH" ? "primary" : "outline"}>
                          {step.actionText} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Active Courses & Continue Learning Section (Section 26, 95) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Enrolled Courses</h2>
              <p className="text-xs text-text-secondary">Real-time completion percentage based on published required activities</p>
            </div>
            <Link href="/student/courses" className="text-xs text-primary-light hover:underline font-medium">
              View All Courses
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesWithProgress.map((course) => (
              <Card key={course.id} className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.code}</Badge>
                    <span className="text-xs text-text-muted font-mono">{course.modules.length} Modules</span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary tracking-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Progress Bar & Explainable Formula */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary font-medium">Progress</span>
                      <span className="font-mono font-bold text-text-primary">{course.progress.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                        style={{ width: `${course.progress.percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-text-muted font-mono">
                      {course.progress.explanation}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <Link href={`/student/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Course Tree
                    </Button>
                  </Link>
                  {course.nextLessonId ? (
                    <Link
                      href={`/student/courses/${course.id}/lessons/${course.nextLessonId}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full">
                        Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/student/courses/${course.id}`} className="flex-1">
                      <Button size="sm" variant="success" className="w-full">
                        Completed ✓
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Lower Split: ReviewLoop™ Queue and Upcoming Quizzes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ReviewLoop™ Queue (Section 30) */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-warning/20 text-warning border border-warning/30">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">ReviewLoop™ Queue</h2>
                    <p className="text-xs text-text-secondary">Weak concepts grouped from incorrect quiz responses</p>
                  </div>
                </div>
                <Badge variant="warning">Revision Items</Badge>
              </div>

              <div className="space-y-3">
                {reviewItems.length === 0 ? (
                  <div className="text-center py-8 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-success mx-auto opacity-70" />
                    <p className="text-xs font-semibold text-text-primary">No concept gaps detected</p>
                    <p className="text-[11px] text-text-secondary">You haven&apos;t missed any core question concepts recently.</p>
                  </div>
                ) : (
                  reviewItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-surface/80 border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">
                            Priority {item.priority}: {item.concept}
                          </span>
                          <span className="text-[10px] text-critical bg-critical/10 px-2 py-0.5 rounded font-mono">
                            {item.missedCount} missed
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary line-clamp-1">
                          In &quot;{item.courseTitle}&quot; • Accuracy rate: {item.accuracyRate}%
                        </p>
                      </div>

                      {item.suggestedLessonId ? (
                        <Link href={`/student/courses/${item.courseId}/lessons/${item.suggestedLessonId}`}>
                          <Button size="sm" variant="outline" className="shrink-0 text-xs">
                            Study Lesson
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/student/learning-pulse">
                          <Button size="sm" variant="outline" className="shrink-0 text-xs">
                            Review Concept
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Recent Results & Feedback */}
          <div className="lg:col-span-5">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/20 text-accent border border-primary/30">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Recent Results</h2>
                    <p className="text-xs text-text-secondary">Finalized scores & teacher feedback</p>
                  </div>
                </div>
                <Link href="/student/results" className="text-xs text-primary-light hover:underline font-medium">
                  All
                </Link>
              </div>

              <div className="space-y-3">
                {recentResults.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">No completed assessments yet</p>
                ) : (
                  recentResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 rounded-xl bg-surface/80 border border-white/10 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-text-primary block line-clamp-1">
                          {result.quiz.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-text-muted">
                          <span>{result.quiz.course.code}</span>
                          <span>•</span>
                          <span className={result.isPassed ? "text-success font-medium" : "text-critical font-medium"}>
                            {result.percentage?.toFixed(0)}% ({result.isPassed ? "Passed" : "Needs Review"})
                          </span>
                        </div>
                      </div>

                      <Link href={`/student/results/${result.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
