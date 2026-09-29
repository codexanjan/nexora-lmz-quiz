import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getGradebookData } from "@/lib/services/gradebook-service";
import { AppShell } from "@/components/layout/app-shell";
import { GradebookClient } from "./gradebook-client";

export const dynamic = "force-dynamic";

export default async function TeacherGradebookPage({
  searchParams,
}: {
  searchParams?: { courseId?: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") redirect("/login");

  // Get courses taught by this teacher
  const taught = await prisma.courseTeacher.findMany({
    where: { teacherId: user.id },
    include: { course: true },
  });
  let courses = taught.map((t) => t.course);

  if (user.activeRole === "ADMIN") {
    courses = await prisma.course.findMany({
      where: { organizationId: user.activeOrganizationId },
    });
  }

  if (courses.length === 0) {
    return (
      <AppShell user={user}>
        <div className="p-8 text-center text-text-muted">No courses found to display gradebook.</div>
      </AppShell>
    );
  }

  const selectedCourseId = searchParams?.courseId || courses[0].id;
  const gradebookData = await getGradebookData(selectedCourseId);

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-16">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">Course Gradebook</h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time assessment results grid, grade selection statuses, and CSV export
          </p>
        </div>

        <GradebookClient
          initialCourseId={selectedCourseId}
          courses={courses.map((c) => ({ id: c.id, title: c.title, code: c.code }))}
          initialData={gradebookData}
        />
      </div>
    </AppShell>
  );
}
