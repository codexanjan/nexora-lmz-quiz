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
  Clock,
  BookOpen,
  ChevronLeft,
  Lightbulb,
  FileCheck2,
  HelpCircle,
  ArrowRight,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { LessonCompleteButton } from "./lesson-complete-button";

export const dynamic = "force-dynamic";

export default async function LessonDetailPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id: courseId, lessonId } = params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              enrollments: { where: { studentId: user.id } },
            },
          },
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, orderIndex: true },
          },
        },
      },
      progress: {
        where: { studentId: user.id },
      },
    },
  });

  if (!lesson) notFound();

  const isEnrolled = lesson.module.course.enrollments.length > 0;
  if (!isEnrolled && user.activeRole === "STUDENT") {
    redirect(`/student/courses/${courseId}`);
  }

  // 1. Next lesson in current module
  const currentIdx = lesson.module.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = lesson.module.lessons[currentIdx + 1];

  // 2. Published quiz associated with this module or course
  const moduleQuiz = await prisma.quiz.findFirst({
    where: {
      OR: [
        { moduleId: lesson.moduleId, state: "PUBLISHED" },
        { courseId: courseId, moduleId: null, state: "PUBLISHED" },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      attempts: {
        where: { studentId: user.id },
        orderBy: { attemptNumber: "desc" },
        take: 1,
      },
    },
  });

  // 3. Next module if this is the last lesson of current module
  let nextModuleFirstLesson: { id: string; title: string; moduleTitle: string } | null = null;
  if (!nextLesson) {
    const nextModule = await prisma.module.findFirst({
      where: {
        courseId,
        orderIndex: { gt: lesson.module.orderIndex },
      },
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: { orderBy: { orderIndex: "asc" }, take: 1 },
      },
    });
    if (nextModule?.lessons[0]) {
      nextModuleFirstLesson = {
        id: nextModule.lessons[0].id,
        title: nextModule.lessons[0].title,
        moduleTitle: nextModule.title,
      };
    }
  }

  // Determine next action URL and label
  let nextActionUrl: string | undefined = undefined;
  let nextActionLabel: string | undefined = undefined;
  let isQuizNext = false;

  if (nextLesson) {
    nextActionUrl = `/student/courses/${courseId}/lessons/${nextLesson.id}`;
    nextActionLabel = `Next Lesson: ${nextLesson.title}`;
  } else if (moduleQuiz) {
    nextActionUrl = `/student/quizzes/${moduleQuiz.id}`;
    nextActionLabel = `Take Assessment: ${moduleQuiz.title}`;
    isQuizNext = true;
  } else if (nextModuleFirstLesson) {
    nextActionUrl = `/student/courses/${courseId}/lessons/${nextModuleFirstLesson.id}`;
    nextActionLabel = `Next Module: ${nextModuleFirstLesson.title}`;
  }

  const isCompleted = lesson.progress[0]?.isCompleted || false;

  // Fetch sibling lessons in module with progress to show quick navigation bar
  const siblingLessons = await prisma.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: { orderIndex: "asc" },
    include: {
      progress: { where: { studentId: user.id } },
    },
  });

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/student/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Course Syllabus
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{lesson.module.course.code}</Badge>
            <span className="text-xs text-text-muted font-mono">{lesson.module.title}</span>
          </div>
        </div>

        {/* Lesson Hero */}
        <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-secondary font-mono tracking-wider uppercase font-semibold">
              Module {lesson.module.orderIndex} • Lesson {lesson.orderIndex}
            </span>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.durationMinutes} Minutes read</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
            {lesson.title}
          </h1>

          {lesson.description && (
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              {lesson.description}
            </p>
          )}

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <LessonCompleteButton
              lessonId={lesson.id}
              isAlreadyCompleted={isCompleted}
              nextLessonUrl={nextActionUrl}
              nextActionLabel={nextActionLabel}
              isQuizNext={isQuizNext}
            />
          </div>
        </div>

        {/* Lesson Content Area */}
        <Card className="p-8 prose prose-invert max-w-none space-y-4">
          <div className="whitespace-pre-line text-sm text-text-primary leading-relaxed space-y-4 font-sans">
            {lesson.content}
          </div>
        </Card>

        {/* Key Takeaways Section */}
        {lesson.takeaways && (
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-accent font-mono uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" /> Key Concept Takeaways
            </div>
            <div className="text-xs text-text-secondary whitespace-pre-line leading-relaxed pl-6 border-l-2 border-primary/40">
              {lesson.takeaways}
            </div>
          </div>
        )}

        {/* Next Step / Module Assessment Callout */}
        {moduleQuiz && !nextLesson && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30 space-y-3 shadow-glow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-accent font-mono uppercase">
                <HelpCircle className="w-4 h-4 text-cyan-400" /> Module Complete — Assessment Ready
              </div>
              <Badge variant="primary">Graded Assessment</Badge>
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Ready to test your understanding of {lesson.module.title}?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Take the &quot;{moduleQuiz.title}&quot; quiz now to earn points towards your course grade and update your Learning Pulse™.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link href={`/student/quizzes/${moduleQuiz.id}`}>
                <Button size="sm" variant="primary">
                  Take Assessment Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link href={`/student/courses/${courseId}`}>
                <Button size="sm" variant="outline">
                  Review Syllabus First
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Module Quick Jump Navigator */}
        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span className="uppercase font-semibold tracking-wider">Lessons in this Module:</span>
            <span>{siblingLessons.filter((l) => l.progress[0]?.isCompleted).length} / {siblingLessons.length} Completed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {siblingLessons.map((sib) => {
              const isCurrent = sib.id === lesson.id;
              const sibCompleted = sib.progress[0]?.isCompleted;
              return (
                <Link
                  key={sib.id}
                  href={`/student/courses/${courseId}/lessons/${sib.id}`}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                    isCurrent
                      ? "bg-primary/20 border-primary text-white font-medium shadow-sm"
                      : "bg-surface/60 border-white/5 text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {sibCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
                    )}
                    <span className="truncate">{sib.title}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-accent shrink-0">Current</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Completion Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" /> Return to Syllabus
            </Button>
          </Link>

          <LessonCompleteButton
            lessonId={lesson.id}
            isAlreadyCompleted={isCompleted}
            nextLessonUrl={nextActionUrl}
            nextActionLabel={nextActionLabel}
            isQuizNext={isQuizNext}
          />
        </div>
      </div>
    </AppShell>
  );
}
