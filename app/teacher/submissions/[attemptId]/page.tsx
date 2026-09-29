import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { canGradeAttempt } from "@/lib/permissions";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  User,
  GraduationCap,
  History,
  FileCheck2,
} from "lucide-react";
import { TeacherGradingForm } from "./grading-form";

export const dynamic = "force-dynamic";

export default async function TeacherSubmissionDetailPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") redirect("/login");

  const attemptId = params.attemptId;
  const allowed = await canGradeAttempt(user.id, attemptId);
  if (!allowed) notFound();

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      student: true,
      quiz: { include: { course: true } },
      quizVersion: true,
      questionSnapshots: { orderBy: { orderIndex: "asc" } },
      answers: true,
      gradeRevisions: {
        include: { grader: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!attempt) notFound();

  const isReleased = attempt.status === "RELEASED";

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <Link
          href="/teacher/submissions"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Submissions Queue
        </Link>

        {/* Header Summary Card */}
        <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{attempt.quiz.course.code}</Badge>
                <Badge variant={isReleased ? "success" : "warning"}>
                  {attempt.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-text-muted font-mono">Attempt #{attempt.attemptNumber}</span>
              </div>
              <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">
                Evaluating: {attempt.student.name}
              </h1>
              <p className="text-xs text-text-secondary">
                {attempt.quiz.title} • Submitted {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "N/A"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface/80 border border-white/10 font-mono text-right">
              <span className="text-xs text-text-muted uppercase">Current Points</span>
              <div className="text-3xl font-bold text-white">
                {attempt.totalPointsEarned} / {attempt.totalPointsPossible}
              </div>
              <span className="text-[11px] text-text-secondary">{attempt.percentage?.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Questions and Grading Canvas */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-heading text-text-primary">Questions & Student Responses</h2>

          {attempt.questionSnapshots.map((snapshot, idx) => {
            const answer = attempt.answers.find((a) => a.questionVersionId === snapshot.questionVersionId);
            const isEssay = snapshot.type === "ESSAY";
            const isAutoGraded = !isEssay;

            return (
              <Card key={snapshot.id} className={`p-6 space-y-4 ${isEssay ? "border-primary/40 shadow-glow/10" : ""}`}>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-text-muted">Q{idx + 1}</span>
                    <Badge variant={isEssay ? "primary" : "outline"}>
                      {snapshot.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="font-mono font-bold text-text-primary">
                    {answer?.pointsEarned ?? (isEssay ? "Pending" : 0)} / {snapshot.pointsPossible} PTS
                  </span>
                </div>

                <p className="text-sm font-medium text-text-primary leading-relaxed">
                  {snapshot.prompt}
                </p>

                {/* Student Response Display */}
                <div className="p-4 rounded-xl bg-surface/80 border border-white/10 space-y-1 text-xs">
                  <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">
                    Student&apos;s Submitted Answer
                  </span>
                  <p className="text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
                    {answer?.response || "(No answer submitted)"}
                  </p>
                </div>

                {/* If Auto-Graded: show explanation */}
                {isAutoGraded && snapshot.explanation && (
                  <div className="text-xs text-text-muted bg-white/[0.02] p-3 rounded-lg border border-white/5 space-y-1">
                    <span className="font-semibold text-text-secondary block">Auto-grading Rule & Explanation:</span>
                    <p className="leading-relaxed">{snapshot.explanation}</p>
                  </div>
                )}

                {/* If Essay: Teacher Grading Form */}
                {isEssay && answer && (
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    {snapshot.rubric && (
                      <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text-secondary space-y-1">
                        <span className="font-bold text-accent block">Rubric Criteria Guide</span>
                        <p className="whitespace-pre-line leading-relaxed">{snapshot.rubric}</p>
                      </div>
                    )}

                    <TeacherGradingForm
                      attemptId={attempt.id}
                      answerId={answer.id}
                      maxPoints={snapshot.pointsPossible}
                      currentScore={answer.pointsEarned}
                      currentFeedback={answer.feedback}
                      isReleased={isReleased}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Grade Revisions Audit Trail (Section 58) */}
        {attempt.gradeRevisions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold font-heading text-text-primary">Grade Revision Audit History</h2>
            </div>

            <div className="space-y-2">
              {attempt.gradeRevisions.map((rev) => (
                <Card key={rev.id} className="p-4 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="text-text-primary font-bold">
                      Score changed to {rev.newScore} PTS
                    </span>
                    <span className="text-text-muted block">
                      By {rev.grader.name} • {new Date(rev.createdAt).toLocaleString()}
                    </span>
                    {rev.reason && <p className="text-text-secondary italic">&quot;{rev.reason}&quot;</p>}
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
