import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, Key, ArrowRight } from "lucide-react";
import { PublishCourseButton } from "./publish-button";

export const dynamic = "force-dynamic";

export default async function TeacherCoursesPage() {
  const user = await getCurrentUser();
  if (!user || user.activeRole === "STUDENT") redirect("/login");

  const orgId = user.activeOrganizationId;

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { courseTeachers: { some: { teacherId: user.id } } },
        { organizationId: orgId },
      ],
    },
    include: {
      courseTeachers: { include: { teacher: true } },
      modules: { include: { lessons: true } },
      quizzes: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">Courses Management</h1>
            <p className="text-xs text-text-secondary mt-1">
              Curriculum planning, module authoring, enrollment codes, and publishing controls
            </p>
          </div>

          <Link href="/teacher/courses/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Create New Course
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isDraft = course.state === "DRAFT";
            const isPublished = course.state === "PUBLISHED";
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

            return (
              <Card key={course.id} className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary">{course.code}</Badge>
                    <Badge variant={isPublished ? "success" : "warning"}>{course.state}</Badge>
                  </div>

                  <h3 className="text-base font-bold text-text-primary tracking-tight">{course.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{course.description}</p>

                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-text-muted font-mono">
                    <div className="flex justify-between">
                      <span>Curriculum:</span>
                      <span className="text-text-primary">
                        {course.modules.length} Modules ({totalLessons} Lessons)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assessments:</span>
                      <span className="text-text-primary">{course.quizzes.length} Quizzes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Students:</span>
                      <span className="text-text-primary">{course._count.enrollments} Enrolled</span>
                    </div>
                    {course.enrollmentCode && (
                      <div className="flex justify-between items-center pt-1 text-accent">
                        <span>Code:</span>
                        <span className="font-bold bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                          {course.enrollmentCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <Link href={`/student/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Preview
                    </Button>
                  </Link>

                  {isDraft ? (
                    <div className="flex-1">
                      <PublishCourseButton courseId={course.id} />
                    </div>
                  ) : (
                    <Link href={`/teacher/gradebook?courseId=${course.id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs">
                        Gradebook
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
