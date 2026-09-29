import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck2, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentResultsListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const attempts = await prisma.attempt.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      quiz: { include: { course: true } },
    },
  });

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">Assessment History & Results</h1>
          <p className="text-xs text-text-secondary mt-1">Review finalized grades, performance metrics, and teacher feedback</p>
        </div>

        <div className="space-y-3">
          {attempts.length === 0 ? (
            <Card className="p-8 text-center text-text-muted text-xs">
              No quiz attempts recorded yet.
            </Card>
          ) : (
            attempts.map((att) => (
              <Card key={att.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{att.quiz.course.code}</Badge>
                    <span className="text-xs font-bold text-text-primary">{att.quiz.title}</span>
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
                  </div>
                  <p className="text-[11px] text-text-muted font-mono">
                    Attempt #{att.attemptNumber} • Submitted: {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : "In Progress"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {att.status === "RELEASED" && (
                    <div className="text-right font-mono">
                      <span className="text-base font-bold text-white block">
                        {att.percentage?.toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {att.totalPointsEarned} / {att.totalPointsPossible} PTS
                      </span>
                    </div>
                  )}

                  {att.status === "IN_PROGRESS" ? (
                    <Link href={`/student/quizzes/${att.quizId}/attempt/${att.id}`}>
                      <Button size="sm" variant="secondary">Resume Attempt</Button>
                    </Link>
                  ) : (
                    <Link href={`/student/results/${att.id}`}>
                      <Button size="sm" variant="outline">
                        View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
