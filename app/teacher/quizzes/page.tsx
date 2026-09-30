import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { QuizBuilderClient } from "./quiz-builder-client";

export const dynamic = "force-dynamic";

export default async function TeacherQuizzesPage() {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") redirect("/login");

  const orgId = user.activeOrganizationId;

  // Taught courses
  const taught = await prisma.courseTeacher.findMany({
    where: { teacherId: user.id },
    select: { courseId: true },
  });
  let courseIds = taught.map((t) => t.courseId);

  if (user.activeRole === "ADMIN") {
    const orgCourses = await prisma.course.findMany({
      where: { organizationId: orgId },
      select: { id: true },
    });
    courseIds = orgCourses.map((c) => c.id);
  }

  const quizzes = await prisma.quiz.findMany({
    where: { courseId: { in: courseIds } },
    include: {
      course: { select: { code: true, title: true } },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: { questions: true },
      },
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, title: true, code: true },
  });

  const availableQuestions = await prisma.question.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      type: true,
      prompt: true,
      points: true,
      difficulty: true,
      courseId: true,
      course: { select: { code: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-16">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">Quiz Builder</h1>
          <p className="text-xs text-text-secondary mt-1">
            Construct server-authoritative assessments, configure timing policies, and generate immutable versions
          </p>
        </div>

        <QuizBuilderClient
          quizzes={quizzes}
          courses={courses}
          availableQuestions={availableQuestions}
        />
      </div>
    </AppShell>
  );
}
