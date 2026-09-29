import { prisma } from "@/lib/db/prisma";
import { sanitizeCsvField } from "@/lib/utils";

export interface GradebookCell {
  attemptId?: string;
  status: "Not Started" | "In Progress" | "Submitted" | "Awaiting Grading" | "Graded" | "Released" | "Missing";
  score: number | null;
  percentage: number | null;
  isPassed: boolean | null;
  totalPossible: number;
}

export interface GradebookRow {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseAverage: number;
  quizzes: Record<string, GradebookCell>;
}

export interface GradebookData {
  courseId: string;
  courseTitle: string;
  quizColumns: { id: string; title: string; maxPoints: number }[];
  rows: GradebookRow[];
}

export async function getGradebookData(courseId: string): Promise<GradebookData> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        include: { student: true },
      },
      quizzes: {
        where: { state: { in: ["PUBLISHED", "ARCHIVED"] } },
        orderBy: { createdAt: "asc" },
        include: {
          versions: {
            orderBy: { versionNumber: "desc" },
            take: 1,
            include: {
              questions: {
                include: { questionVersion: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course) throw new Error("Course not found");

  const quizColumns = course.quizzes.map((q) => {
    const latestVersion = q.versions[0];
    let maxPoints = 0;
    if (latestVersion) {
      for (const qv of latestVersion.questions) {
        maxPoints += qv.pointsOverride ?? qv.questionVersion.points;
      }
    }
    return {
      id: q.id,
      title: q.title,
      maxPoints,
    };
  });

  const quizIds = quizColumns.map((qc) => qc.id);
  const studentIds = course.enrollments.map((e) => e.studentId);

  // Fetch all selected attempts for gradebook
  const attempts = await prisma.attempt.findMany({
    where: {
      quizId: { in: quizIds },
      studentId: { in: studentIds },
      isSelectedForGradebook: true,
    },
  });

  const rows: GradebookRow[] = course.enrollments.map((enr) => {
    const student = enr.student;
    const quizMap: Record<string, GradebookCell> = {};
    let totalScore = 0;
    let gradedCount = 0;

    for (const col of quizColumns) {
      const attempt = attempts.find((a) => a.quizId === col.id && a.studentId === student.id);
      if (!attempt) {
        quizMap[col.id] = {
          status: "Not Started",
          score: null,
          percentage: null,
          isPassed: null,
          totalPossible: col.maxPoints,
        };
      } else {
        let cellStatus: GradebookCell["status"] = "Not Started";
        if (attempt.status === "IN_PROGRESS") cellStatus = "In Progress";
        else if (attempt.status === "SUBMITTED") cellStatus = "Submitted";
        else if (attempt.status === "AWAITING_GRADING") cellStatus = "Awaiting Grading";
        else if (attempt.status === "GRADED") cellStatus = "Graded";
        else if (attempt.status === "RELEASED") cellStatus = "Released";

        if (attempt.status === "GRADED" || attempt.status === "RELEASED") {
          totalScore += attempt.percentage || 0;
          gradedCount += 1;
        }

        quizMap[col.id] = {
          attemptId: attempt.id,
          status: cellStatus,
          score: attempt.totalPointsEarned,
          percentage: attempt.percentage,
          isPassed: attempt.isPassed,
          totalPossible: attempt.totalPointsPossible || col.maxPoints,
        };
      }
    }

    const courseAverage = gradedCount > 0 ? Math.round((totalScore / gradedCount) * 10) / 10 : 0;

    return {
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      courseAverage,
      quizzes: quizMap,
    };
  });

  return {
    courseId: course.id,
    courseTitle: course.title,
    quizColumns,
    rows,
  };
}

export function generateGradebookCsv(data: GradebookData): string {
  const header = [
    sanitizeCsvField("Student Name"),
    sanitizeCsvField("Email"),
    sanitizeCsvField("Course Average (%)"),
    ...data.quizColumns.map((q) => sanitizeCsvField(`${q.title} (Max: ${q.maxPoints})`)),
  ].join(",");

  const lines = data.rows.map((r) => {
    const quizCells = data.quizColumns.map((q) => {
      const cell = r.quizzes[q.id];
      if (!cell || cell.score === null) {
        return sanitizeCsvField(cell?.status || "N/A");
      }
      return sanitizeCsvField(`${cell.score}/${cell.totalPossible} (${cell.percentage}%) - ${cell.status}`);
    });

    return [
      sanitizeCsvField(r.studentName),
      sanitizeCsvField(r.studentEmail),
      sanitizeCsvField(r.courseAverage),
      ...quizCells,
    ].join(",");
  });

  return [header, ...lines].join("\n");
}
