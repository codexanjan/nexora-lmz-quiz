"use client";

import React, { useState } from "react";
import { Download, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GradebookProps {
  initialCourseId: string;
  courses: { id: string; title: string; code: string }[];
  initialData: any;
}

export function GradebookClient({ initialCourseId, courses, initialData }: GradebookProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setLoading(true);
    try {
      const res = await fetch(`/api/gradebook?courseId=${courseId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = `/api/gradebook?courseId=${selectedCourseId}&format=csv`;
  };

  const filteredRows = data?.rows?.filter((r: any) =>
    r.studentName.toLowerCase().includes(search.toLowerCase()) ||
    r.studentEmail.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-white/10 bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface">
                {c.code} — {c.title}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-8 pr-3.5 rounded-xl border border-white/10 bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-60"
            />
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={handleExportCsv}>
          <Download className="w-4 h-4 mr-1.5" /> Export Safe CSV
        </Button>
      </div>

      {/* Gradebook Matrix Table */}
      <Card className="p-0 overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-text-muted font-mono">
                <th className="p-4 font-semibold uppercase tracking-wider min-w-[200px]">Student</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-center min-w-[120px]">
                  Course Average
                </th>
                {data?.quizColumns?.map((q: any) => (
                  <th key={q.id} className="p-4 font-semibold uppercase tracking-wider text-center min-w-[140px]">
                    <div className="line-clamp-1">{q.title}</div>
                    <span className="text-[10px] text-text-muted font-normal">Max: {q.maxPoints} pts</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={(data?.quizColumns?.length || 0) + 2} className="p-8 text-center text-text-muted">
                    No student enrollment records found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row: any) => (
                  <tr key={row.studentId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-semibold text-text-primary block">{row.studentName}</span>
                      <span className="text-[11px] text-text-muted truncate block">{row.studentEmail}</span>
                    </td>

                    <td className="p-4 text-center font-mono font-bold">
                      <span
                        className={
                          row.courseAverage >= 70
                            ? "text-success"
                            : row.courseAverage > 0
                            ? "text-warning"
                            : "text-text-muted"
                        }
                      >
                        {row.courseAverage > 0 ? `${row.courseAverage}%` : "—"}
                      </span>
                    </td>

                    {data?.quizColumns?.map((q: any) => {
                      const cell = row.quizzes[q.id];
                      const isReleased = cell?.status === "Released";
                      const isGraded = cell?.status === "Graded";
                      const isAwaiting = cell?.status === "Awaiting Grading";
                      const isInProgress = cell?.status === "In Progress";

                      return (
                        <td key={q.id} className="p-4 text-center">
                          {isReleased || isGraded ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-text-primary block">
                                {cell.score} / {cell.totalPossible}
                              </span>
                              <span
                                className={`text-[10px] font-mono ${
                                  cell.isPassed ? "text-success" : "text-critical"
                                }`}
                              >
                                {cell.percentage}% {isReleased ? "✓" : "(Graded)"}
                              </span>
                            </div>
                          ) : isAwaiting ? (
                            <Badge variant="warning" className="text-[10px]">
                              Awaiting Grade
                            </Badge>
                          ) : isInProgress ? (
                            <Badge variant="primary" className="text-[10px]">
                              In Progress
                            </Badge>
                          ) : (
                            <span className="text-text-muted font-mono text-[11px]">Not Started</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
