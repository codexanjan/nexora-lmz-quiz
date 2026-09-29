import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { quizSchema } from "@/lib/validation";
import { canManageCourse } from "@/lib/permissions";
import { dispatchDomainEvent } from "@/lib/services/event-service";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const searchParams = req.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  const where: any = {};
  if (courseId) where.courseId = courseId;

  if (user?.activeRole === "STUDENT") {
    where.state = "PUBLISHED";
  }

  const quizzes = await prisma.quiz.findMany({
    where,
    include: {
      course: { select: { id: true, title: true, code: true } },
      module: { select: { id: true, title: true } },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        include: {
          questions: {
            include: { questionVersion: true },
          },
        },
      },
      attempts: user
        ? {
            where: { studentId: user.id },
            orderBy: { attemptNumber: "desc" },
          }
        : false,
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ quizzes });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.activeRole !== "TEACHER" && user.activeRole !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = quizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const {
      courseId,
      moduleId,
      title,
      instructions,
      timeLimitMinutes,
      maxAttempts,
      passingPercentage,
      randomizeQuestions,
      randomizeAnswers,
      navigationPolicy,
      resultReleasePolicy,
      showCorrectAnswers,
      showExplanations,
      gradeSelectionRule,
      isRequired,
      questionIds,
    } = parsed.data;

    const allowed = await canManageCourse(user.id, courseId);
    if (!allowed) {
      return NextResponse.json({ error: "You cannot create quizzes for this course" }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    // Fetch latest question versions for the provided question IDs
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: "At least one valid question is required" }, { status: 400 });
    }

    // Create Quiz and immutable QuizVersion in transaction
    const quiz = await prisma.$transaction(async (tx) => {
      const q = await tx.quiz.create({
        data: {
          organizationId: course.organizationId,
          courseId,
          moduleId: moduleId || null,
          title,
          instructions,
          state: "PUBLISHED", // Published upon creation in MVP builder
          timeLimitMinutes,
          maxAttempts,
          passingPercentage,
          randomizeQuestions,
          randomizeAnswers,
          navigationPolicy,
          resultReleasePolicy,
          showCorrectAnswers,
          showExplanations,
          gradeSelectionRule,
          isRequired,
        },
      });

      const qVersion = await tx.quizVersion.create({
        data: {
          quizId: q.id,
          versionNumber: 1,
          title: `${title} (v1)`,
          instructions,
          timeLimitMinutes,
          maxAttempts,
          passingPercentage,
          navigationPolicy,
          resultReleasePolicy,
          showCorrectAnswers,
          showExplanations,
          gradeSelectionRule,
          publishedById: user.id,
          questions: {
            create: questions.map((qItem, idx) => ({
              questionVersionId: qItem.versions[0].id,
              orderIndex: idx + 1,
              pointsOverride: qItem.versions[0].points,
            })),
          },
        },
      });

      return q;
    });

    // Dispatch event
    await dispatchDomainEvent("QUIZ_PUBLISHED", {
      quizId: quiz.id,
      quizTitle: quiz.title,
      courseId: quiz.courseId,
      organizationId: course.organizationId,
      actorId: user.id,
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    console.error("Create quiz error:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
