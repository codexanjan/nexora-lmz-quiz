import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentQuizzesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    select: { courseId: true },
  });
  const courseIds = enrollments.map((e) => e.courseId);

  const quizzes = await prisma.quiz.findMany({
    where: {
      courseId: { in: courseIds },
      state: "PUBLISHED",
    },
    include: {
      course: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: {
          questions: true,
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
    orderBy: { closingDate: "asc" },
  });

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">Assessments & Quizzes</h1>
          <p className="text-xs text-text-secondary mt-1">
            Server-authoritative timed quizzes, concept checks, and diagnostic exams
          </p>
        </div>

        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <Card className="p-8 text-center text-text-muted text-xs">
              No published assessments available in your enrolled courses.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const latestVersion = quiz.versions[0];
                const accommodation = quiz.accommodations[0];
                const maxAttempts = (latestVersion?.maxAttempts || 1) + (accommodation?.extraAttempts || 0);
                const attemptsTaken = quiz.attempts.filter((a) => a.status !== "IN_PROGRESS").length;
                const activeAttempt = quiz.attempts.find((a) => a.status === "IN_PROGRESS");
                const latestFinished = quiz.attempts.find((a) => a.status !== "IN_PROGRESS");

                return (
                  <Card key={quiz.id} className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{quiz.course.code}</Badge>
                        <span className="text-[11px] text-text-muted font-mono">
                          {latestVersion?.questions.length || 0} Questions
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary tracking-tight">{quiz.title}</h3>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {quiz.instructions || "Comprehensive course evaluation."}
                      </p>

                      <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-text-muted font-mono">
                        <div className="flex justify-between">
                          <span>Time Limit:</span>
                          <span className="text-text-primary">{latestVersion?.timeLimitMinutes} Mins</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attempts Allowed:</span>
                          <span className="text-text-primary">
                            {attemptsTaken} / {maxAttempts}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Passing Score:</span>
                          <span className="text-text-primary">{quiz.passingPercentage}%</span>
                        </div>
                        {latestFinished && (
                          <div className="flex justify-between pt-1 text-accent font-semibold">
                            <span>Best / Selected:</span>
                            <span>{latestFinished.percentage?.toFixed(0)}% ({latestFinished.isPassed ? "Passed" : "Needs Review"})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10">
                      <Link href={`/student/quizzes/${quiz.id}`}>
                        <Button size="sm" className="w-full" variant={activeAttempt ? "secondary" : "primary"}>
                          {activeAttempt ? "Resume In-Progress Attempt" : attemptsTaken >= maxAttempts ? "View Submissions" : "Start Assessment"}
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
