"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers, Clock, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface QuestionItem {
  id: string;
  type: string;
  prompt: string;
  points: number;
  difficulty: string;
}

interface QuizItem {
  id: string;
  title: string;
  course: { code: string; title: string };
  timeLimitMinutes: number;
  passingPercentage: number;
  maxAttempts: number;
  state: string;
  versions: { versionNumber: number; questions: any[] }[];
  _count: { attempts: number };
}

export function QuizBuilderClient({
  quizzes,
  courses,
  availableQuestions,
}: {
  quizzes: QuizItem[];
  courses: { id: string; title: string; code: string }[];
  availableQuestions: QuestionItem[];
}) {
  const router = useRouter();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  // Form State
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [releasePolicy, setReleasePolicy] = useState<"IMMEDIATE" | "AFTER_CLOSE" | "MANUAL">("IMMEDIATE");
  const [gradeRule, setGradeRule] = useState<"HIGHEST" | "LATEST" | "FIRST">("HIGHEST");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleQuestion = (qId: string) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== qId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  const totalPoints = availableQuestions
    .filter((q) => selectedQuestionIds.includes(q.id))
    .reduce((acc, q) => acc + q.points, 0);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedQuestionIds.length === 0) {
      setError("Please select at least one question for the quiz");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          instructions,
          timeLimitMinutes: Number(timeLimitMinutes),
          maxAttempts: Number(maxAttempts),
          passingPercentage: Number(passingPercentage),
          navigationPolicy: "FREE",
          resultReleasePolicy: releasePolicy,
          showCorrectAnswers: "ALWAYS",
          showExplanations: "ALWAYS",
          gradeSelectionRule: gradeRule,
          isRequired: true,
          questionIds: selectedQuestionIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish quiz");

      setIsBuilderOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to publish quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary font-mono">
          {quizzes.length} Published Quizzes
        </span>
        <Button size="sm" onClick={() => setIsBuilderOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Build New Quiz
        </Button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => {
          const latest = quiz.versions[0];
          return (
            <Card key={quiz.id} className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{quiz.course.code}</Badge>
                  <Badge variant="outline" className="text-[10px]">
                    v{latest?.versionNumber || 1}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-text-primary tracking-tight">{quiz.title}</h3>

                <div className="space-y-1.5 text-xs text-text-muted font-mono pt-2 border-t border-white/5">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="text-text-primary font-bold">{latest?.questions.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Limit:</span>
                    <span className="text-text-primary">{quiz.timeLimitMinutes} Mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempts:</span>
                    <span className="text-text-primary">{quiz._count.attempts} Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="text-text-primary">{quiz.passingPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Badge variant="success">Active</Badge>
                <span className="text-[11px] text-text-muted">Grade Rule: {latest ? "HIGHEST" : "LATEST"}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Create & Publish Assessment"
        description="Configure parameters and select questions from the Question Bank."
        maxWidth="xl"
      >
        <form onSubmit={handlePublish} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                Course
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm Diagnostics Examination"
                className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Instructions
            </label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instructions presented to student on the quiz start page..."
              className="flex w-full rounded-xl border border-white/10 bg-surface/80 p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Timing & Policies */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min="1"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-surface px-3 text-xs text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                min="1"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-surface px-3 text-xs text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-surface px-3 text-xs text-text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
                Grade Selection
              </label>
              <select
                value={gradeRule}
                onChange={(e: any) => setGradeRule(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-white/10 bg-surface px-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="HIGHEST">Highest Score</option>
                <option value="LATEST">Latest Score</option>
                <option value="FIRST">First Score</option>
              </select>
            </div>
          </div>

          {/* Question Bank Selection */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary">
                Select Questions ({selectedQuestionIds.length} Selected • {totalPoints} Total PTS)
              </span>
              <span className="text-[11px] text-text-muted">From Question Bank</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 p-1 border border-white/10 rounded-xl bg-surface/50">
              {availableQuestions.length === 0 ? (
                <p className="text-center py-6 text-xs text-text-muted">No questions available in question bank.</p>
              ) : (
                availableQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      onClick={() => toggleQuestion(q.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-primary/20 border-primary text-white"
                          : "bg-surface border-white/5 text-text-secondary hover:bg-white/[0.04]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mt-0.5 accent-primary"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">{q.type.replace("_", " ")}</Badge>
                          <span className="font-mono text-text-muted text-[10px]">{q.points} PTS</span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed">{q.prompt}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsBuilderOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading} loadingText="Publishing Quiz...">
              Publish Immutable Quiz Version
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
