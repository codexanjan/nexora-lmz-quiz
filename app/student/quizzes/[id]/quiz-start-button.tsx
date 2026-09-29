"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, RotateCcw } from "lucide-react";

export function QuizStartButton({
  quizId,
  activeAttemptId,
  attemptsRemaining,
}: {
  quizId: string;
  activeAttemptId?: string | null;
  attemptsRemaining: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartOrResume = async () => {
    if (activeAttemptId) {
      router.push(`/student/quizzes/${quizId}/attempt/${activeAttemptId}`);
      return;
    }

    if (attemptsRemaining <= 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/quizzes/${quizId}/start`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start quiz attempt");
      }
      router.push(`/student/quizzes/${quizId}/attempt/${data.attemptId}`);
    } catch (err: any) {
      setError(err.message || "Failed to start attempt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs">
          {error}
        </div>
      )}

      <Button
        onClick={handleStartOrResume}
        size="lg"
        variant={activeAttemptId ? "secondary" : "primary"}
        isLoading={loading}
        loadingText="Initializing Attempt..."
        disabled={!activeAttemptId && attemptsRemaining <= 0}
        className="w-full sm:w-auto min-w-[200px]"
      >
        {activeAttemptId ? (
          <>
            Resume Attempt <ArrowRight className="w-4 h-4 ml-1.5" />
          </>
        ) : attemptsRemaining > 0 ? (
          <>
            <Play className="w-4 h-4 mr-1.5 fill-current" /> Start Assessment
          </>
        ) : (
          "No Attempts Remaining"
        )}
      </Button>
    </div>
  );
}
