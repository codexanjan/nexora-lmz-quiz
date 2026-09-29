"use client";

import React, { useState } from "react";
import { Plus, Search, HelpCircle, Tag, Layers, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateQuestionModal } from "./question-modal";

interface QuestionItem {
  id: string;
  type: string;
  prompt: string;
  points: number;
  difficulty: string;
  tags?: string | null;
  usageCount: number;
  course?: { code: string; title: string } | null;
  author: { name: string };
  versions: { versionNumber: number }[];
}

export function QuestionBankClient({
  initialQuestions,
  courses,
}: {
  initialQuestions: QuestionItem[];
  courses: { id: string; title: string; code: string }[];
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");

  const filtered = questions.filter((q) => {
    if (selectedType !== "ALL" && q.type !== selectedType) return false;
    if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) return false;
    if (search && !q.prompt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-8 pr-3.5 rounded-xl border border-white/10 bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-60"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 px-3 rounded-xl border border-white/10 bg-surface text-text-primary text-xs focus:outline-none"
          >
            <option value="ALL">All Question Types</option>
            <option value="SINGLE_CHOICE">Single Choice</option>
            <option value="MULTIPLE_SELECT">Multiple Select</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short Answer</option>
            <option value="ESSAY">Essay</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl border border-white/10 bg-surface text-text-primary text-xs focus:outline-none"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add New Question
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center text-text-muted text-xs">
            No questions matched your filter criteria.
          </Card>
        ) : (
          filtered.map((q) => {
            let tagsArray: string[] = [];
            if (q.tags) {
              try {
                tagsArray = JSON.parse(q.tags);
              } catch {
                tagsArray = q.tags.split(",").map((t) => t.trim());
              }
            }

            return (
              <Card key={q.id} className="p-5 space-y-3 hover:border-primary/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{q.type.replace("_", " ")}</Badge>
                    <Badge
                      variant={
                        q.difficulty === "EASY" ? "success" : q.difficulty === "HARD" ? "critical" : "warning"
                      }
                      className="text-[10px]"
                    >
                      {q.difficulty}
                    </Badge>
                    {q.course && <Badge variant="outline">{q.course.code}</Badge>}
                  </div>

                  <div className="flex items-center gap-3 font-mono text-text-muted text-[11px]">
                    <span>Points: {q.points}</span>
                    <span>•</span>
                    <span>Version: v{q.versions[0]?.versionNumber || 1}</span>
                    <span>•</span>
                    <span>Usage: {q.usageCount} Quizzes</span>
                  </div>
                </div>

                <p className="text-sm font-medium text-text-primary leading-relaxed">{q.prompt}</p>

                {tagsArray.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="w-3 h-3 text-text-muted mr-1" />
                    {tagsArray.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[10px] text-text-muted font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <CreateQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courses={courses}
      />
    </div>
  );
}
