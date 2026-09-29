import { requireRole } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { getClassPulse } from "@/lib/services/class-pulse-service";
import { prisma } from "@/lib/db/prisma";
import { ReportsClient } from "./reports-client";

interface PageProps {
  searchParams: Promise<{ courseId?: string }>;
}

export default async function TeacherReportsPage({ searchParams }: PageProps) {
  const user = await requireRole(["TEACHER", "ADMIN"]);
  const { courseId } = await searchParams;

  // Fetch teacher's assigned courses
  const courseTeachers = await prisma.courseTeacher.findMany({
    where: { teacherId: user.id },
    include: { course: true },
  });

  const courses = courseTeachers.map((ct) => ({
    id: ct.course.id,
    title: ct.course.title,
    code: ct.course.code,
  }));

  // Fetch Class Pulse metrics (and GapMap)
  const pulseData = await getClassPulse(user.id, courseId);

  return (
    <AppShell
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      organizationName={user.organizationName}
    >
      <ReportsClient
        initialPulse={pulseData}
        courses={courses}
        selectedCourseId={courseId}
      />
    </AppShell>
  );
}
