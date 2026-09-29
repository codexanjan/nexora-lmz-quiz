"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function LessonCompleteButton({
  lessonId,
  isAlreadyCompleted,
  nextLessonUrl,
}: {
  lessonId: string;
  isAlreadyCompleted: boolean;
  nextLessonUrl?: string;
}) {
  const router = useRouter();
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
    <div className="flex items-center gap-3">
      <Button
        onClick={handleComplete}
        variant={isCompleted ? "success" : "primary"}
        isLoading={loading}
        loadingText="Saving Progress..."
      >
        {isCompleted ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Lesson Completed
          </>
        ) : (
          "Mark Lesson as Complete"
        )}
      </Button>

      {nextLessonUrl && (
        <Button variant="outline" onClick={() => router.push(nextLessonUrl)}>
          Next Lesson <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
