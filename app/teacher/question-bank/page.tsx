import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { QuestionBankClient } from "./question-bank-client";

export const dynamic = "force-dynamic";

export default async function TeacherQuestionBankPage() {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") redirect("/login");

  const orgId = user.activeOrganizationId;

  const questions = await prisma.question.findMany({
    where: { organizationId: orgId },
    include: {
      course: { select: { id: true, title: true, code: true } },
      author: { select: { name: true } },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const courses = await prisma.course.findMany({
    where: { organizationId: orgId },
    select: { id: true, title: true, code: true },
  });

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-16">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">Question Bank</h1>
          <p className="text-xs text-text-secondary mt-1">
            Author reusable questions across 5 assessment modalities with immutable snapshot versioning
          </p>
        </div>

        <QuestionBankClient
          initialQuestions={questions}
          courses={courses}
        />
      </div>
    </AppShell>
  );
}
