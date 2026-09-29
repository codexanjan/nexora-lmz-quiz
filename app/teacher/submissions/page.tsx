import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherSubmissionsQueuePage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") redirect("/login");

  const filterStatus = searchParams?.status || "ALL";

  // Find courses assigned to this teacher
  const taught = await prisma.courseTeacher.findMany({
    where: { teacherId: user.id },
    select: { courseId: true },
  });
  let courseIds = taught.map((t) => t.courseId);

  if (user.activeRole === "ADMIN") {
    const orgCourses = await prisma.course.findMany({
      where: { organizationId: user.activeOrganizationId },
      select: { id: true },
    });
    courseIds = orgCourses.map((c) => c.id);
  }

  const where: any = {
    quiz: { courseId: { in: courseIds } },
  };

  if (filterStatus !== "ALL") {
    where.status = filterStatus;
  }

  const submissions = await prisma.attempt.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    include: {
      student: true,
      quiz: { include: { course: true } },
      answers: {
        where: {
          questionVersion: { type: "ESSAY" },
        },
      },
    },
  });

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-16">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">
            Submissions & Grading Queue
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Evaluate essay submissions, record immutable grade revisions, and release results
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 text-xs">
          {[
            { label: "All Submissions", value: "ALL" },
            { label: "Awaiting Grading", value: "AWAITING_GRADING" },
            { label: "Graded", value: "GRADED" },
            { label: "Released", value: "RELEASED" },
          ].map((tab) => (
            <Link key={tab.value} href={`/teacher/submissions?status=${tab.value}`}>
              <Button
                size="sm"
                variant={filterStatus === tab.value ? "primary" : "outline"}
                className="text-xs"
              >
                {tab.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <Card className="p-12 text-center text-text-muted text-xs">
              No submissions found for the selected filter.
            </Card>
          ) : (
            submissions.map((sub) => {
              const hasEssay = sub.answers.length > 0;
              const isAwaiting = sub.status === "AWAITING_GRADING";

              return (
                <Card
                  key={sub.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isAwaiting ? "border-warning/30 bg-warning/[0.02]" : ""
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{sub.student.name}</span>
                      <span className="text-xs text-text-muted font-mono">• {sub.quiz.course.code}</span>
                      <Badge
                        variant={
                          sub.status === "RELEASED"
                            ? "success"
                            : isAwaiting
                            ? "warning"
                            : "outline"
                        }
                      >
                        {sub.status.replace("_", " ")}
                      </Badge>
                      {hasEssay && isAwaiting && (
                        <Badge variant="warning" className="text-[10px]">
                          Essay Needs Grade
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-text-secondary">
                      Quiz: <span className="text-text-primary font-medium">{sub.quiz.title}</span> • Attempt #{sub.attemptNumber}
                    </p>

                    <p className="text-[11px] text-text-muted font-mono">
                      Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-base font-bold text-white block">
                        {sub.totalPointsEarned} / {sub.totalPointsPossible} PTS
                      </span>
                      <span className="text-[11px] text-text-muted">
                        ({sub.percentage?.toFixed(1)}%)
                      </span>
                    </div>

                    <Link href={`/teacher/submissions/${sub.id}`}>
                      <Button size="sm" variant={isAwaiting ? "primary" : "outline"}>
                        {isAwaiting ? "Grade Submission" : "View & Edit"}
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
