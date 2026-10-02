"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function LessonCompleteButton({
  lessonId,
  isAlreadyCompleted,
  nextLessonUrl,
  nextActionLabel,
  isQuizNext,
}: {
  lessonId: string;
  isAlreadyCompleted: boolean;
  nextLessonUrl?: string;
  nextActionLabel?: string;
  isQuizNext?: boolean;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (isCompleted) {
      if (nextLessonUrl) router.push(nextLessonUrl);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        setIsCompleted(true);
        router.refresh();
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={handleComplete}
        variant={isCompleted ? "success" : "primary"}
        isLoading={loading}
        loadingText="Saving Progress..."
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {t("action.lesson_completed", "Lesson Completed")}
          </>
        ) : (
          t("action.complete_lesson", "Mark Lesson as Complete")
        )}
      </Button>

      {nextLessonUrl && (
        <Button
          variant={isQuizNext ? "secondary" : "outline"}
          onClick={() => router.push(nextLessonUrl)}
          className="shadow-sm"
        >
          {isQuizNext ? (
            <>
              <HelpCircle className="w-4 h-4 mr-1.5 text-cyan-400" />
              {nextActionLabel || t("action.start_quiz", "Take Module Quiz")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              {nextActionLabel || t("action.next_lesson", "Next Lesson")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
