import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateCourseProgress } from "@/lib/services/progress-service";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  HelpCircle,
  ArrowRight,
  Clock,
  Users,
  FileCheck2,
} from "lucide-react";
import { EnrollButton } from "./enroll-button";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const courseId = params.id;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      courseTeachers: { include: { teacher: true } },
      enrollments: { where: { studentId: user.id } },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            include: {
              progress: { where: { studentId: user.id } },
            },
          },
          quizzes: {
            where: { state: "PUBLISHED" },
            include: {
              attempts: {
                where: { studentId: user.id },
                orderBy: { attemptNumber: "desc" },
              },
            },
          },
        },
      },
      quizzes: {
        where: { state: "PUBLISHED", moduleId: null },
        include: {
          attempts: {
            where: { studentId: user.id },
            orderBy: { attemptNumber: "desc" },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const isEnrolled = course.enrollments.length > 0;
  const progress = isEnrolled ? await calculateCourseProgress(user.id, course.id) : null;

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-12">
        {/* Course Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 relative overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="text-xs">{course.code}</Badge>
              <span className="text-xs text-text-muted font-mono">
                Instructor: {course.courseTeachers.map((ct) => ct.teacher.name).join(", ")}
              </span>
            </div>

            {!isEnrolled ? (
              <EnrollButton courseId={course.id} />
            ) : (
              <Badge variant="success">Enrolled Student</Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
            {course.title}
          </h1>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
            {course.description}
          </p>

          {/* If enrolled, show progress */}
          {progress && (
            <div className="pt-4 border-t border-white/10 space-y-2 max-w-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">Curriculum Progress</span>
                <span className="font-mono font-bold text-text-primary">{progress.percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-text-muted font-mono">{progress.explanation}</p>
            </div>
          )}
        </div>

        {/* Modules & Lessons Curriculum Tree */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-heading text-text-primary">Curriculum Modules</h2>

          <div className="space-y-6">
            {course.modules.map((mod, idx) => (
              <Card key={mod.id} className="p-6">
                <div className="mb-4 pb-3 border-b border-white/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-mono">
                    Module {idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-text-primary tracking-tight mt-0.5">
                    {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="text-xs text-text-secondary mt-1">{mod.description}</p>
                  )}
                </div>

                {/* Lessons in this module */}
                <div className="space-y-2">
                  {mod.lessons.map((lesson) => {
                    const isCompleted = lesson.progress[0]?.isCompleted;
                    return (
                      <div
                        key={lesson.id}
                        className="p-3.5 rounded-xl bg-surface/70 hover:bg-surface border border-white/5 hover:border-white/20 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-text-muted shrink-0" />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-text-primary block">
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{lesson.durationMinutes} mins</span>
                              {lesson.isRequired && <span>• Required</span>}
                            </div>
                          </div>
                        </div>

                        {isEnrolled ? (
                          <Link href={`/student/courses/${course.id}/lessons/${lesson.id}`}>
                            <Button size="sm" variant={isCompleted ? "outline" : "primary"}>
                              {isCompleted ? "Review" : "Start"}
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-text-muted">Enroll to access</span>
                        )}
                      </div>
                    );
                  })}

                  {/* Quizzes in this module */}
                  {mod.quizzes.map((quiz) => {
                    const latestAttempt = quiz.attempts[0];
                    const isPassed = latestAttempt?.isPassed;

                    return (
                      <div
                        key={quiz.id}
                        className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-accent shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-text-primary block">
                                {quiz.title}
                              </span>
                              <Badge variant="primary" className="text-[10px]">Assessment</Badge>
                            </div>
                            <span className="text-[11px] text-text-muted mt-0.5 block">
                              Time limit: {quiz.timeLimitMinutes} mins • Passing: {quiz.passingPercentage}%
                            </span>
                          </div>
                        </div>

                        {isEnrolled ? (
                          <div className="flex items-center gap-2">
                            {latestAttempt && (
                              <span className="text-xs font-mono text-text-secondary mr-2">
                                Last: {latestAttempt.percentage?.toFixed(0)}%
                              </span>
                            )}
                            <Link href={`/student/quizzes/${quiz.id}`}>
                              <Button size="sm" variant="secondary">
                                {latestAttempt ? "Retake / Review" : "Take Quiz"}
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">Enroll to access</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
