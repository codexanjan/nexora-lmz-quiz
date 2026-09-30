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

  // Find next lesson
  const currentIdx = lesson.module.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = lesson.module.lessons[currentIdx + 1];
  const nextLessonUrl = nextLesson ? `/student/courses/${courseId}/lessons/${nextLesson.id}` : undefined;

  const isCompleted = lesson.progress[0]?.isCompleted || false;

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

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <LessonCompleteButton
              lessonId={lesson.id}
              isAlreadyCompleted={isCompleted}
              nextLessonUrl={nextLessonUrl}
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

        {/* Bottom Completion Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" /> Return to Syllabus
            </Button>
          </Link>

          <LessonCompleteButton
            lessonId={lesson.id}
            isAlreadyCompleted={isCompleted}
            nextLessonUrl={nextLessonUrl}
          />
        </div>
      </div>
    </AppShell>
  );
}
