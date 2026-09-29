import { prisma } from "@/lib/db/prisma";

export interface ReviewLoopItem {
  id: string;
  concept: string;
  priority: number;
  missedCount: number;
  totalAttempts: number;
  accuracyRate: number;
  suggestedLessonId?: string;
  suggestedLessonTitle?: string;
  courseId: string;
  courseTitle: string;
  sampleQuestionPrompt: string;
  explanation?: string;
}

export async function getReviewLoopItems(studentId: string): Promise<ReviewLoopItem[]> {
  // Fetch student's answers to questions in finalized/released attempts
  const answers = await prisma.answer.findMany({
    where: {
      attempt: {
        studentId,
        status: { in: ["GRADED", "RELEASED"] },
      },
    },
    include: {
      questionVersion: {
        include: {
          question: {
            include: {
              course: true,
            },
          },
        },
      },
      attempt: {
        include: {
          quiz: {
            include: {
              course: true,
            },
          },
        },
      },
    },
  });

  // Group by question tag/concept
  const conceptMap = new Map<
    string,
    {
      concept: string;
      missedCount: number;
      totalAttempts: number;
      courseId: string;
      courseTitle: string;
      samplePrompt: string;
      explanation?: string;
    }
  >();

  for (const ans of answers) {
    const qv = ans.questionVersion;
    let tags: string[] = ["General Concept"];
    if (qv.tags) {
      try {
        const parsed = JSON.parse(qv.tags);
        if (Array.isArray(parsed) && parsed.length > 0) tags = parsed;
      } catch {
        tags = qv.tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    const courseId = ans.attempt.quiz.courseId;
    const courseTitle = ans.attempt.quiz.course.title;
    const isMissed = ans.isCorrect === false || (ans.pointsEarned !== null && ans.pointsEarned < qv.points * 0.7);

    for (const tag of tags) {
      const existing = conceptMap.get(tag) || {
        concept: tag,
        missedCount: 0,
        totalAttempts: 0,
        courseId,
        courseTitle,
        samplePrompt: qv.prompt,
        explanation: qv.explanation || undefined,
      };

      existing.totalAttempts += 1;
      if (isMissed) {
        existing.missedCount += 1;
        existing.samplePrompt = qv.prompt;
        if (qv.explanation) existing.explanation = qv.explanation;
      }

      conceptMap.set(tag, existing);
    }
  }

  // Filter only concepts where student has missed questions
  const weakConcepts = Array.from(conceptMap.values())
    .filter((c) => c.missedCount > 0)
    .map((c, index): ReviewLoopItem => {
      const accuracyRate = Math.round(((c.totalAttempts - c.missedCount) / c.totalAttempts) * 100);
      return {
        id: `review-${index}-${c.concept.toLowerCase().replace(/\s+/g, "-")}`,
        concept: c.concept,
        priority: index + 1,
        missedCount: c.missedCount,
        totalAttempts: c.totalAttempts,
        accuracyRate,
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        sampleQuestionPrompt: c.samplePrompt,
        explanation: c.explanation,
      };
    })
    .sort((a, b) => b.missedCount - a.missedCount);

  // Link to relevant lessons if titles or content match
  for (const item of weakConcepts) {
    const matchedLesson = await prisma.lesson.findFirst({
      where: {
        module: { courseId: item.courseId },
        OR: [
          { title: { contains: item.concept } },
          { description: { contains: item.concept } },
          { content: { contains: item.concept } },
        ],
      },
      select: { id: true, title: true },
    });

    if (matchedLesson) {
      item.suggestedLessonId = matchedLesson.id;
      item.suggestedLessonTitle = matchedLesson.title;
    }
  }

  return weakConcepts;
}
