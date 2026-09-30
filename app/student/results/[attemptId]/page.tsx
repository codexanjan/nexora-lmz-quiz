import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { canViewAttempt } from "@/lib/permissions";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ArrowRight,
  MessageSquare,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentResultDetailPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const attemptId = params.attemptId;
  const allowed = await canViewAttempt(user.id, attemptId);
  if (!allowed) notFound();

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          course: true,
        },
      },
      quizVersion: true,
      questionSnapshots: {
        orderBy: { orderIndex: "asc" },
      },
      answers: true,
      gradeRevisions: {
        include: { grader: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!attempt) notFound();

  const isReleased = attempt.status === "RELEASED";
  const isAwaitingGrading = attempt.status === "AWAITING_GRADING";

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <Link
          href="/student/results"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> All Assessment Results
        </Link>

        {/* Results Hero Card */}
        <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{attempt.quiz.course.code}</Badge>
                <Badge variant="outline">Attempt #{attempt.attemptNumber}</Badge>
                <Badge variant={isReleased ? (attempt.isPassed ? "success" : "warning") : "primary"}>
                  {attempt.status.replace("_", " ")}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
                {attempt.quiz.title}
              </h1>
            </div>

            {/* Score Ring / Block */}
            {isReleased && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface/80 border border-white/10">
                <div className="space-y-0.5 text-right font-mono">
                  <span className="text-xs text-text-muted uppercase">Final Score</span>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {attempt.percentage?.toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-text-secondary">
                    {attempt.totalPointsEarned} / {attempt.totalPointsPossible} PTS
                  </span>
                </div>
                {attempt.isPassed ? (
                  <CheckCircle2 className="w-10 h-10 text-success" />
                ) : (
                  <XCircle className="w-10 h-10 text-warning" />
                )}
              </div>
            )}
          </div>

          {/* Status Callout if awaiting grading */}
          {isAwaitingGrading && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-start gap-3 text-xs">
              <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-text-primary block">Evaluation in Progress</span>
                <p className="text-text-secondary leading-relaxed">
                  Your multiple choice and short answer questions were automatically scored. An essay question is currently in the instructor grading queue. You will receive an instant notification when your final result is released.
                </p>
              </div>
            </div>
          )}

          {/* Quick ReviewLoop action */}
          {isReleased && (
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-text-secondary">
                Missed questions have been automatically organized into your ReviewLoop™ queue.
              </span>
              <Link href="/student/learning-pulse">
                <Button size="sm" variant="secondary">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Open ReviewLoop™
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Question-by-Question Breakdown (if released) */}
        {isReleased && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-heading text-text-primary">Question Analysis & Feedback</h2>

            <div className="space-y-4">
              {attempt.questionSnapshots.map((snapshot, idx) => {
                const answer = attempt.answers.find((a) => a.questionVersionId === snapshot.questionVersionId);
                const isCorrect = answer?.isCorrect;
                const pointsEarned = answer?.pointsEarned ?? 0;

                return (
                  <Card key={snapshot.id} className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text-muted">Q{idx + 1}</span>
                        <Badge variant="outline">{snapshot.type.replace("_", " ")}</Badge>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <Badge variant={isCorrect ? "success" : pointsEarned > 0 ? "warning" : "critical"}>
                          {pointsEarned} / {snapshot.pointsPossible} PTS
                        </Badge>
                      </div>
                    </div>

                    {/* Prompt */}
                    <p className="text-sm font-medium text-text-primary leading-relaxed">
                      {snapshot.prompt}
                    </p>

                    {/* Student Response */}
                    <div className="p-3.5 rounded-xl bg-surface/80 border border-white/10 space-y-1 text-xs">
                      <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">
                        Your Submitted Response
                      </span>
                      <p className="text-text-primary font-mono whitespace-pre-wrap">
                        {answer?.response || "(No answer submitted)"}
                      </p>
                    </div>

                    {/* Teacher Rubric Feedback if essay */}
                    {answer?.feedback && (
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-accent">
                          <MessageSquare className="w-3.5 h-3.5" /> Instructor Evaluation & Rubric Feedback
                        </div>
                        <p className="text-text-secondary leading-relaxed pl-5 border-l-2 border-primary/40">
                          {answer.feedback}
                        </p>
                      </div>
                    )}

                    {/* Explanation */}
                    {snapshot.explanation && (
                      <div className="text-xs text-text-muted bg-white/[0.02] p-3 rounded-lg border border-white/5 space-y-1">
                        <span className="font-semibold text-text-secondary block">Explanation:</span>
                        <p className="leading-relaxed">{snapshot.explanation}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
