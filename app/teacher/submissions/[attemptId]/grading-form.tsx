"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { CheckCircle2, Send, Save, AlertCircle } from "lucide-react";

export function TeacherGradingForm({
  attemptId,
  answerId,
  maxPoints,
  currentScore,
  currentFeedback,
  isReleased,
}: {
  attemptId: string;
  answerId: string;
  maxPoints: number;
  currentScore?: number | null;
  currentFeedback?: string | null;
  isReleased: boolean;
}) {
  const router = useRouter();
  const [score, setScore] = useState<string>(currentScore !== null && currentScore !== undefined ? String(currentScore) : "");
  const [feedback, setFeedback] = useState<string>(currentFeedback || "");
  const [reason, setReason] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > maxPoints) {
      setError(`Score must be a number between 0 and ${maxPoints}`);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/grading/${attemptId}/essay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId,
          newScore: numScore,
          newFeedback: feedback,
          reason: reason || "Instructor rubric assessment",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save grade");

      setSuccessMsg("Grade revision recorded successfully!");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save grade");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRelease = async () => {
    setError("");
    setSuccessMsg("");
    setIsReleasing(true);

    try {
      const res = await fetch(`/api/grading/${attemptId}/release`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to release result");

      setSuccessMsg("Result released! Student has been notified.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to release result");
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-xs">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSaveGrade} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Score (0 to {maxPoints} PTS)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={maxPoints}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={`e.g. ${maxPoints * 0.8}`}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Revision Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Initial essay review"
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
            Rubric & Instructor Feedback
          </label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide qualitative feedback justifying the score according to rubric guidelines..."
            className="flex w-full rounded-xl border border-white/10 bg-surface/80 p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-y leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button type="submit" isLoading={isSaving} loadingText="Recording Revision...">
            <Save className="w-4 h-4 mr-1.5" /> Save Grade Revision
          </Button>

          {!isReleased && (
            <Button
              type="button"
              variant="success"
              onClick={handleRelease}
              isLoading={isReleasing}
              loadingText="Releasing..."
            >
              <Send className="w-4 h-4 mr-1.5" /> Release Result to Student
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
