"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Cloud,
  CloudOff,
  Loader2,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatTimeRemaining } from "@/lib/utils";

interface QuestionSnapshot {
  id: string;
  questionVersionId: string;
  orderIndex: number;
  prompt: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | string;
  options?: string | null;
  explanation?: string | null;
  rubric?: string | null;
  pointsPossible: number;
}

interface SavedAnswer {
  questionVersionId: string;
  response: string | null;
  isFlagged: boolean;
  revision: number;
}

type SaveState = "SAVED" | "SAVING" | "OFFLINE" | "ERROR";

export default function LiveQuizAttemptPage({
  params,
}: {
  params: { id: string; attemptId: string };
}) {
  const router = useRouter();
  const { id: quizId, attemptId } = params;

  // Attempt Data State
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { response: string; isFlagged: boolean; revision: number }>>({});
  const [saveState, setSaveState] = useState<SaveState>("SAVED");

  // Timer State
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Submit Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Fetch of Attempt & Snapshots
  useEffect(() => {
    async function loadAttempt() {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        if (!res.ok) {
          router.push(`/student/quizzes/${quizId}`);
          return;
        }

        const data = await res.json();
        const att = data.attempt;

        // If attempt is already submitted/graded, redirect to result
        if (att.status !== "IN_PROGRESS") {
          router.push(`/student/results/${attemptId}`);
          return;
        }

        setAttempt(att);
        setQuestions(att.questionSnapshots || []);

        // Populate existing answers
        const ansMap: Record<string, { response: string; isFlagged: boolean; revision: number }> = {};
        for (const ans of att.answers || []) {
          ansMap[ans.questionVersionId] = {
            response: ans.response || "",
            isFlagged: ans.isFlagged || false,
            revision: ans.revision || 1,
          };
        }
        setAnswers(ansMap);

        // Server authoritative timer calculation
        const serverNow = new Date(data.serverTime).getTime();
        const deadline = new Date(att.deadlineAt).getTime();
        const initialSeconds = Math.max(0, Math.floor((deadline - serverNow) / 1000));
        setSecondsRemaining(initialSeconds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId, quizId, router]);

  // 2. Authoritative Countdown Interval
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  // 3. Handle Auto-Finalization on Expiry
  useEffect(() => {
    if (isExpired && attempt?.status === "IN_PROGRESS") {
      handleSubmit(true);
    }
  }, [isExpired, attempt]);

  // 4. Autosave function
  const triggerAutosave = useCallback(
    async (qvId: string, response: string, isFlagged: boolean, revision: number) => {
      setSaveState("SAVING");
      try {
        const res = await fetch(`/api/attempts/${attemptId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionVersionId: qvId,
            response,
            isFlagged,
            revision,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          if (errData.error?.includes("finalized") || errData.error?.includes("Deadline")) {
            setIsExpired(true);
          }
          setSaveState("ERROR");
          return;
        }

        setSaveState("SAVED");
      } catch (e) {
        setSaveState("OFFLINE");
      }
    },
    [attemptId]
  );

  // 5. Update answer in state and debounce autosave
  const updateAnswer = (response: string) => {
    const qv = questions[currentIndex];
    if (!qv) return;

    const current = answers[qv.questionVersionId] || { response: "", isFlagged: false, revision: 1 };
    const nextRevision = current.revision + 1;

    setAnswers((prev) => ({
      ...prev,
      [qv.questionVersionId]: {
        ...current,
        response,
        revision: nextRevision,
      },
    }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerAutosave(qv.questionVersionId, response, current.isFlagged, nextRevision);
    }, 400);
  };

  // Toggle flag status
  const toggleFlag = () => {
    const qv = questions[currentIndex];
    if (!qv) return;

    const current = answers[qv.questionVersionId] || { response: "", isFlagged: false, revision: 1 };
    const nextFlag = !current.isFlagged;
    const nextRevision = current.revision + 1;

    setAnswers((prev) => ({
      ...prev,
      [qv.questionVersionId]: {
        ...current,
        isFlagged: nextFlag,
        revision: nextRevision,
      },
    }));

    triggerAutosave(qv.questionVersionId, current.response, nextFlag, nextRevision);
  };

  // 6. Submit attempt
  const handleSubmit = async (isAutoExpire = false) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit attempt");
      }

      router.push(`/student/results/${attemptId}`);
    } catch (err: any) {
      setSubmitError(err.message || "Submission failed. Please retry.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Synchronizing assessment with secure server...</span>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAns = currentQ ? answers[currentQ.questionVersionId]?.response || "" : "";
  const isFlagged = currentQ ? answers[currentQ.questionVersionId]?.isFlagged || false : false;

  // Counts for submit modal
  const answeredCount = questions.filter((q) => {
    const a = answers[q.questionVersionId]?.response;
    return a && a.trim().length > 0;
  }).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(answers).filter((a) => a.isFlagged).length;

  const timerColor =
    secondsRemaining !== null && secondsRemaining <= 60
      ? "text-critical animate-pulse font-bold"
      : secondsRemaining !== null && secondsRemaining <= 300
      ? "text-warning font-bold"
      : "text-text-primary";

  return (
    <div className="min-h-screen bg-deep text-text-primary flex flex-col select-none">
      {/* Top Assessment Control Bar */}
      <header className="h-16 glass-panel border-b border-white/10 px-6 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-white tracking-tight">
              {attempt?.quiz?.title || "Assessment"}
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
              Question {currentIndex + 1} of {questions.length}
            </Badge>
          </div>
        </div>

        {/* Center: Autosave Status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {saveState === "SAVING" ? (
            <span className="text-secondary flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          ) : saveState === "SAVED" ? (
            <span className="text-success flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" /> Answers Saved
            </span>
          ) : saveState === "OFFLINE" ? (
            <span className="text-warning flex items-center gap-1.5">
              <CloudOff className="w-3.5 h-3.5" /> Reconnecting...
            </span>
          ) : (
            <span className="text-critical flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Save Conflict
            </span>
          )}
        </div>

        {/* Right: Authoritative Timer & Submit */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-white/10">
            <Clock className="w-4 h-4 text-text-muted" />
            <span className={`font-mono text-sm tracking-wider ${timerColor}`}>
              {secondsRemaining !== null ? formatTimeRemaining(secondsRemaining) : "--:--"}
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowSubmitModal(true)}
            className="hidden sm:inline-flex"
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Main Two-Column Assessment Canvas */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Question Content */}
        <div className="lg:col-span-8 space-y-6">
          {currentQ && (
            <Card className="p-6 sm:p-8 space-y-6">
              {/* Question Header & Points */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-text-muted font-bold">
                    Q{currentIndex + 1}
                  </span>
                  <Badge variant="primary" className="text-[10px]">
                    {currentQ.type.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-text-muted font-mono">
                    {currentQ.pointsPossible} Point{currentQ.pointsPossible > 1 ? "s" : ""}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    isFlagged
                      ? "bg-warning/20 text-warning border-warning/40"
                      : "bg-surface text-text-muted border-white/10 hover:text-text-primary"
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-warning" : ""}`} />
                  <span>{isFlagged ? "Flagged for Review" : "Flag Question"}</span>
                </button>
              </div>

              {/* Question Prompt */}
              <div className="text-base sm:text-lg font-medium text-text-primary leading-relaxed">
                {currentQ.prompt}
              </div>

              {/* Type-Specific Answer Renderers */}
              <div className="pt-2">
                {/* 1. SINGLE_CHOICE */}
                {currentQ.type === "SINGLE_CHOICE" && currentQ.options && (
                  <div className="space-y-3">
                    {JSON.parse(currentQ.options).map((opt: { id: string; text: string }) => {
                      const isSelected = currentAns === opt.id;
                      return (
                        <label
                          key={opt.id}
                          onClick={() => updateAnswer(opt.id)}
                          className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-sm transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/20 border-primary text-white shadow-glow-sm"
                              : "bg-surface/80 border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-primary bg-primary text-white" : "border-white/30"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 2. MULTIPLE_SELECT */}
                {currentQ.type === "MULTIPLE_SELECT" && currentQ.options && (
                  <div className="space-y-3">
                    <p className="text-xs text-text-muted italic mb-2">Select all choices that apply.</p>
                    {JSON.parse(currentQ.options).map((opt: { id: string; text: string }) => {
                      let selectedSet: string[] = [];
                      try {
                        selectedSet = JSON.parse(currentAns || "[]");
                      } catch {}
                      const isChecked = selectedSet.includes(opt.id);

                      const toggleOption = () => {
                        let newSet = [...selectedSet];
                        if (isChecked) {
                          newSet = newSet.filter((id) => id !== opt.id);
                        } else {
                          newSet.push(opt.id);
                        }
                        updateAnswer(JSON.stringify(newSet));
                      };

                      return (
                        <label
                          key={opt.id}
                          onClick={toggleOption}
                          className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-sm transition-all cursor-pointer ${
                            isChecked
                              ? "bg-primary/20 border-primary text-white shadow-glow-sm"
                              : "bg-surface/80 border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked ? "border-primary bg-primary text-white" : "border-white/30"
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* 3. TRUE_FALSE */}
                {currentQ.type === "TRUE_FALSE" && (
                  <div className="grid grid-cols-2 gap-4">
                    {["true", "false"].map((val) => {
                      const isSelected = currentAns.toLowerCase() === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateAnswer(val)}
                          className={`p-5 rounded-2xl border text-sm font-semibold capitalize transition-all ${
                            isSelected
                              ? "bg-primary text-white border-primary-light shadow-glow-sm scale-[1.01]"
                              : "bg-surface/80 border-white/10 text-text-secondary hover:text-white hover:border-white/20"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. SHORT_ANSWER */}
                {currentQ.type === "SHORT_ANSWER" && (
                  <div className="space-y-2">
                    <p className="text-xs text-text-muted">Enter exact term or definition.</p>
                    <input
                      type="text"
                      value={currentAns}
                      onChange={(e) => updateAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-12 rounded-xl bg-surface border border-white/10 px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                )}

                {/* 5. ESSAY */}
                {currentQ.type === "ESSAY" && (
                  <div className="space-y-3">
                    {currentQ.rubric && (
                      <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text-secondary space-y-1">
                        <span className="font-bold text-accent block">Grading Rubric Criteria</span>
                        <p className="whitespace-pre-line leading-relaxed">{currentQ.rubric}</p>
                      </div>
                    )}
                    <textarea
                      rows={8}
                      value={currentAns}
                      onChange={(e) => updateAnswer(e.target.value)}
                      placeholder="Write your comprehensive answer here..."
                      className="w-full rounded-xl bg-surface border border-white/10 p-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-y leading-relaxed"
                    />
                    <div className="flex justify-between text-xs text-text-muted font-mono">
                      <span>{currentAns.trim().split(/\s+/).filter(Boolean).length} words</span>
                      <span>{currentAns.length} characters</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  >
                    Next Question <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" variant="success" onClick={() => setShowSubmitModal(true)}>
                    Review & Submit <Send className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Question Navigator */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-text-primary">Question Navigator</h3>
              <span className="text-xs text-text-muted font-mono">
                {answeredCount}/{questions.length} Answered
              </span>
            </div>

            {/* Grid of Question buttons */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const ans = answers[q.questionVersionId];
                const isAnswered = ans && ans.response && ans.response.trim().length > 0;
                const isCurrent = idx === currentIndex;
                const isFlag = ans?.isFlagged;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl font-mono text-xs font-semibold relative transition-all flex items-center justify-center ${
                      isCurrent
                        ? "bg-primary text-white border-2 border-primary-light shadow-glow-sm scale-105 z-10"
                        : isAnswered
                        ? "bg-surface border border-primary/40 text-text-primary hover:bg-white/[0.06]"
                        : "bg-surface/50 border border-white/10 text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {idx + 1}
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-warning ring-2 ring-deep" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-[11px] text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-primary" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md border border-primary/40 bg-surface" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md border border-white/10 bg-surface/50" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                <span>Flagged for Review</span>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              variant="primary"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Assessment
            </Button>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal (Section 55) */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Assessment?"
        description="Verify your answers before finalizing your attempt."
      >
        <div className="space-y-4 py-2">
          {submitError && (
            <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs">
              {submitError}
            </div>
          )}

          <div className="p-4 rounded-xl bg-surface/80 border border-white/10 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-text-muted">Total Questions:</span>
              <span className="text-text-primary font-bold">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Answered:</span>
              <span className="text-success font-bold">{answeredCount}</span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex justify-between">
                <span className="text-critical">Unanswered:</span>
                <span className="text-critical font-bold">{unansweredCount}</span>
              </div>
            )}
            {flaggedCount > 0 && (
              <div className="flex justify-between">
                <span className="text-warning">Flagged:</span>
                <span className="text-warning font-bold">{flaggedCount}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Upon submitting, your multiple choice and short answer responses will be automatically graded immediately. Any essay responses will be queued for instructor evaluation.
          </p>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" size="sm" onClick={() => setShowSubmitModal(false)}>
              Keep Editing
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleSubmit(false)}
              isLoading={isSubmitting}
              loadingText="Submitting & Grading..."
            >
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
