import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  FileCheck2,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { QuizStartButton } from "./quiz-start-button";

export const dynamic = "force-dynamic";

export default async function QuizStartPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const quizId = params.id;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: {
          questions: {
            include: { questionVersion: true },
          },
        },
      },
      accommodations: {
        where: { studentId: user.id },
      },
      attempts: {
        where: { studentId: user.id },
        orderBy: { attemptNumber: "desc" },
      },
    },
  });

  if (!quiz) notFound();

  const latestVersion = quiz.versions[0];
  const accommodation = quiz.accommodations[0];

  const effectiveDuration = (latestVersion?.timeLimitMinutes || 30) + (accommodation?.extraTimeMinutes || 0);
  const effectiveMaxAttempts = (latestVersion?.maxAttempts || 1) + (accommodation?.extraAttempts || 0);
  const completedAttempts = quiz.attempts.filter((a) => a.status !== "IN_PROGRESS");
  const attemptsRemaining = Math.max(0, effectiveMaxAttempts - completedAttempts.length);
  const activeAttempt = quiz.attempts.find((a) => a.status === "IN_PROGRESS");

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <Link
          href={`/student/courses/${quiz.courseId}`}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {quiz.course.title}
        </Link>

        {/* Hero Card */}
        <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{quiz.course.code}</Badge>
              <Badge variant="outline">Assessment v{latestVersion?.versionNumber || 1}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
              {quiz.title}
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              {quiz.instructions || "Please review the assessment parameters and rules below before starting."}
            </p>
          </div>

          {/* Assessment Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-surface/80 border border-white/10 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-text-muted text-[10px] uppercase tracking-wider block">Time Limit</span>
              <span className="text-text-primary font-bold text-sm">{effectiveDuration} Mins</span>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted text-[10px] uppercase tracking-wider block">Questions</span>
              <span className="text-text-primary font-bold text-sm">{latestVersion?.questions.length || 0}</span>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted text-[10px] uppercase tracking-wider block">Passing Threshold</span>
              <span className="text-text-primary font-bold text-sm">{quiz.passingPercentage}%</span>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted text-[10px] uppercase tracking-wider block">Attempts Remaining</span>
              <span className="text-accent font-bold text-sm">{attemptsRemaining} of {effectiveMaxAttempts}</span>
            </div>
          </div>

          {/* Authoritative Warning Notice (Section 44) */}
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-text-primary block">Server-Authoritative Timing Enforced</span>
              <p className="text-text-secondary leading-relaxed">
                Your attempt is strictly governed by the server deadline. Answers are autosaved continually. Any answers reaching the server after the deadline will be rejected, and the assessment will be automatically finalized.
              </p>
            </div>
          </div>

          {/* Start / Resume Action */}
          <div className="pt-2">
            <QuizStartButton
              quizId={quiz.id}
              activeAttemptId={activeAttempt?.id}
              attemptsRemaining={attemptsRemaining}
            />
          </div>
        </div>

        {/* Previous Attempts Section */}
        {quiz.attempts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary">Attempt History</h2>

            <div className="space-y-3">
              {quiz.attempts.map((att) => (
                <Card key={att.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">
                        Attempt #{att.attemptNumber}
                      </span>
                      <Badge
                        variant={
                          att.status === "RELEASED"
                            ? att.isPassed
                              ? "success"
                              : "warning"
                            : att.status === "IN_PROGRESS"
                            ? "primary"
                            : "outline"
                        }
                      >
                        {att.status.replace("_", " ")}
                      </Badge>
                      {att.isSelectedForGradebook && (
                        <Badge variant="outline" className="text-[10px] text-accent border-primary/30">
                          Gradebook Choice
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted font-mono">
                      Started: {new Date(att.startedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {att.status === "RELEASED" && (
                      <span className="text-sm font-bold font-mono text-text-primary">
                        {att.totalPointsEarned} / {att.totalPointsPossible} ({att.percentage?.toFixed(1)}%)
                      </span>
                    )}

                    {att.status === "IN_PROGRESS" ? (
                      <Link href={`/student/quizzes/${quiz.id}/attempt/${att.id}`}>
                        <Button size="sm" variant="secondary">Resume</Button>
                      </Link>
                    ) : (
                      <Link href={`/student/results/${att.id}`}>
                        <Button size="sm" variant="outline">View Result</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
