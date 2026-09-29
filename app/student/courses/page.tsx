import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { calculateCourseProgress } from "@/lib/services/progress-service";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch all published courses in the organization
  const allCourses = await prisma.course.findMany({
    where: {
      organizationId: user.activeOrganizationId,
      state: "PUBLISHED",
    },
    include: {
      courseTeachers: { include: { teacher: true } },
      enrollments: { where: { studentId: user.id } },
      modules: { include: { lessons: true } },
      quizzes: { where: { state: "PUBLISHED" } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const coursesWithProgress = await Promise.all(
    allCourses.map(async (c) => {
      const isEnrolled = c.enrollments.length > 0;
      let progress = null;
      if (isEnrolled) {
        progress = await calculateCourseProgress(user.id, c.id);
      }
      return {
        ...c,
        isEnrolled,
        progress,
      };
    })
  );

  const enrolledCourses = coursesWithProgress.filter((c) => c.isEnrolled);
  const availableCourses = coursesWithProgress.filter((c) => !c.isEnrolled);

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">Courses Catalog</h1>
            <p className="text-xs text-text-secondary mt-1">Explore enrolled courses and open academic curricula</p>
          </div>
        </div>

        {/* My Enrolled Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary">My Courses</h2>
            <Badge variant="primary">{enrolledCourses.length}</Badge>
          </div>

          {enrolledCourses.length === 0 ? (
            <Card className="p-8 text-center text-text-muted text-xs">
              You are not enrolled in any courses yet. Browse the catalog below to join.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((c) => (
                <Card key={c.id} className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary">{c.code}</Badge>
                      <span className="text-[11px] text-text-muted font-mono">
                        {c.courseTeachers[0]?.teacher.name || "Instructor"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-text-primary tracking-tight">{c.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{c.description}</p>

                    {c.progress && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">Progress</span>
                          <span className="font-mono font-bold text-text-primary">{c.progress.percentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-primary rounded-full"
                            style={{ width: `${c.progress.percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-text-muted font-mono">{c.progress.explanation}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <Link href={`/student/courses/${c.id}`}>
                      <Button size="sm" className="w-full">
                        Open Course <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Catalog Section */}
        {availableCourses.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary">Available for Enrollment</h2>
              <Badge variant="outline">{availableCourses.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((c) => (
                <Card key={c.id} className="flex flex-col justify-between hover:border-white/20 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{c.code}</Badge>
                      <span className="text-[11px] text-text-muted">
                        {c._count.enrollments} enrolled
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-text-primary tracking-tight">{c.title}</h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{c.description}</p>

                    <div className="flex items-center gap-4 text-xs text-text-muted pt-2 font-mono">
                      <span>{c.modules.length} Modules</span>
                      <span>•</span>
                      <span>{c.quizzes.length} Assessments</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <Link href={`/student/courses/${c.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Curriculum & Enroll
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
