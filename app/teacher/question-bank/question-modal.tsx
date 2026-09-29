"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export function CreateQuestionModal({
  isOpen,
  onClose,
  courses,
}: {
  isOpen: boolean;
  onClose: () => void;
  courses: { id: string; title: string; code: string }[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [type, setType] = useState<"SINGLE_CHOICE" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY">("SINGLE_CHOICE");
  const [prompt, setPrompt] = useState("");
  const [points, setPoints] = useState("2.0");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [tags, setTags] = useState("");
  const [explanation, setExplanation] = useState("");
  const [rubric, setRubric] = useState("");

  // Options for Single/Multiple Choice
  const [options, setOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([
    { id: "opt_1", text: "", isCorrect: true },
    { id: "opt_2", text: "", isCorrect: false },
  ]);

  // True/False correct choice
  const [tfCorrect, setTfCorrect] = useState("true");

  // Short Answer accepted answers
  const [shortAnswers, setShortAnswers] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddOption = () => {
    const nextId = `opt_${options.length + 1}`;
    setOptions([...options, { id: nextId, text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let optionsPayload: any = null;
      let correctAnswersPayload: any = null;
      let acceptedAnswersPayload: any = null;

      if (type === "SINGLE_CHOICE") {
        const validOpts = options.filter((o) => o.text.trim().length > 0);
        if (validOpts.length < 2) throw new Error("At least two valid options are required");
        const correctOpt = validOpts.find((o) => o.isCorrect) || validOpts[0];
        optionsPayload = JSON.stringify(validOpts.map((o) => ({ id: o.id, text: o.text })));
        correctAnswersPayload = JSON.stringify([correctOpt.id]);
      } else if (type === "MULTIPLE_SELECT") {
        const validOpts = options.filter((o) => o.text.trim().length > 0);
        if (validOpts.length < 2) throw new Error("At least two valid options are required");
        const correctOpts = validOpts.filter((o) => o.isCorrect).map((o) => o.id);
        if (correctOpts.length === 0) throw new Error("Select at least one correct option");
        optionsPayload = JSON.stringify(validOpts.map((o) => ({ id: o.id, text: o.text })));
        correctAnswersPayload = JSON.stringify(correctOpts);
      } else if (type === "TRUE_FALSE") {
        optionsPayload = JSON.stringify([
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ]);
        correctAnswersPayload = JSON.stringify([tfCorrect]);
      } else if (type === "SHORT_ANSWER") {
        const accepted = shortAnswers
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter(Boolean);
        if (accepted.length === 0) throw new Error("Provide at least one accepted answer");
        acceptedAnswersPayload = JSON.stringify(accepted);
      } else if (type === "ESSAY") {
        if (!rubric.trim()) throw new Error("Grading rubric criteria is required for essays");
      }

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId || null,
          type,
          prompt,
          options: optionsPayload,
          correctAnswers: correctAnswersPayload,
          acceptedAnswers: acceptedAnswersPayload,
          explanation: explanation || null,
          rubric: rubric || null,
          points: parseFloat(points) || 1.0,
          difficulty,
          tags: tags ? JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create question");

      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Question" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Question Type
            </label>
            <select
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="SINGLE_CHOICE">Single Choice (One correct)</option>
              <option value="MULTIPLE_SELECT">Multiple Select (Exact set)</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="SHORT_ANSWER">Short Answer (Normalized match)</option>
              <option value="ESSAY">Essay (Manual rubric grading)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Course Association
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
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
            Question Prompt
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write question statement clearly..."
            className="flex w-full rounded-xl border border-white/10 bg-surface/80 p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
            required
          />
        </div>

        {/* Options for SINGLE_CHOICE / MULTIPLE_SELECT */}
        {(type === "SINGLE_CHOICE" || type === "MULTIPLE_SELECT") && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Options ({type === "SINGLE_CHOICE" ? "Mark 1 correct" : "Mark all correct"})
              </span>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs text-primary-light hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>

            {options.map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type={type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                  name="correct_option"
                  checked={opt.isCorrect}
                  onChange={(e) => {
                    if (type === "SINGLE_CHOICE") {
                      setOptions(options.map((o, idx) => ({ ...o, isCorrect: idx === i })));
                    } else {
                      setOptions(options.map((o, idx) => (idx === i ? { ...o, isCorrect: e.target.checked } : o)));
                    }
                  }}
                  className="w-4 h-4 text-primary accent-primary"
                />
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt.text}
                  onChange={(e) => {
                    const text = e.target.value;
                    setOptions(options.map((o, idx) => (idx === i ? { ...o, text } : o)));
                  }}
                  className="flex-1 h-10 rounded-xl border border-white/10 bg-surface px-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="p-2 text-text-muted hover:text-critical"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TRUE_FALSE correct choice */}
        {type === "TRUE_FALSE" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
              Correct Evaluation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTfCorrect("true")}
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  tfCorrect === "true" ? "bg-primary text-white border-primary" : "bg-surface text-text-secondary"
                }`}
              >
                True
              </button>
              <button
                type="button"
                onClick={() => setTfCorrect("false")}
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  tfCorrect === "false" ? "bg-primary text-white border-primary" : "bg-surface text-text-secondary"
                }`}
              >
                False
              </button>
            </div>
          </div>
        )}

        {/* SHORT_ANSWER accepted variants */}
        {type === "SHORT_ANSWER" && (
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Accepted Answers (comma separated)
            </label>
            <input
              type="text"
              value={shortAnswers}
              onChange={(e) => setShortAnswers(e.target.value)}
              placeholder="e.g. gradient descent, sgd, stochastic gradient descent"
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        )}

        {/* ESSAY rubric */}
        {type === "ESSAY" && (
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Grading Rubric Criteria
            </label>
            <textarea
              rows={3}
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              placeholder="1. Definition clarity (3 pts)&#10;2. Example accuracy (4 pts)&#10;3. Critical reasoning (3 pts)"
              className="flex w-full rounded-xl border border-white/10 bg-surface/80 p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Points
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e: any) => setDifficulty(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
              Concept Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Bayes, Probability"
              className="flex h-11 w-full rounded-xl border border-white/10 bg-surface/80 px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
            Explanation / Learning Note
          </label>
          <textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why the answer is correct for student post-assessment review..."
            className="flex w-full rounded-xl border border-white/10 bg-surface/80 p-3.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading} loadingText="Saving...">
            Save Question
          </Button>
        </div>
      </form>
    </Modal>
  );
}
