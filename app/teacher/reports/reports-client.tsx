"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Download,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  Users,
  Target,
  BookOpen,
  Filter,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface GapMapConcept {
  concept: string;
  totalAnswered: number;
  incorrectCount: number;
  incorrectPercentage: number;
  pointsLost: number;
}

interface StudentSupportItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  reasons: string[];
  severity: "HIGH" | "MEDIUM";
  courseTitle: string;
}

interface CourseOption {
  id: string;
  title: string;
  code: string;
}

interface ReportsClientProps {
  initialPulse: {
    activeCoursesCount: number;
    totalStudentsCount: number;
    pendingGradingCount: number;
    averageFinalizedScore: number;
    overallCompletionRate: number;
    quizParticipationRate: number;
    gapMap: GapMapConcept[];
    atRiskStudents: StudentSupportItem[];
  };
  courses: CourseOption[];
  selectedCourseId?: string;
}

const COLORS = ["#6C63FF", "#35C6FF", "#35D6A2", "#FFC857", "#FF647C"];

export function ReportsClient({
  initialPulse,
  courses,
  selectedCourseId,
}: ReportsClientProps) {
  const [courseFilter, setCourseFilter] = useState<string>(
    selectedCourseId || "ALL"
  );
  const [isExporting, setIsExporting] = useState(false);

  const handleCourseChange = (newCourseId: string) => {
    setCourseFilter(newCourseId);
    if (newCourseId === "ALL") {
      window.location.href = "/teacher/reports";
    } else {
      window.location.href = `/teacher/reports?courseId=${newCourseId}`;
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const url =
        courseFilter !== "ALL"
          ? `/api/gradebook?courseId=${courseFilter}&export=csv`
          : `/api/gradebook?export=csv`;
      window.location.href = url;
    } catch (e) {
      console.error("Export error", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Preparation for Recharts
  const gapMapData = initialPulse.gapMap.map((gm) => ({
    name: gm.concept,
    incorrect: gm.incorrectPercentage,
    correct: 100 - gm.incorrectPercentage,
    pointsLost: gm.pointsLost,
    total: gm.totalAnswered,
  }));

  const participationData = [
    { name: "Participating", value: initialPulse.quizParticipationRate },
    {
      name: "Non-Participating",
      value: Math.max(0, 100 - initialPulse.quizParticipationRate),
    },
  ];

  const completionData = [
    { name: "Completed", value: initialPulse.overallCompletionRate },
    {
      name: "Incomplete",
      value: Math.max(0, 100 - initialPulse.overallCompletionRate),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100">
            Intelligence & Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time cohort performance, mastery signals, and explainable
            diagnostic indicators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface/80 border border-white/10 rounded-xl px-3.5 py-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={courseFilter}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="bg-transparent text-sm text-text-primary outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-surface text-text-primary">
                All Assigned Courses
              </option>
              {courses.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-surface text-text-primary"
                >
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 bg-elevated hover:bg-white/[0.08] text-text-primary border border-white/10 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Primary KPI Metric Cards with Explainability */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Avg Finalized Score
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-100">
              {initialPulse.averageFinalizedScore}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Calculated across all submitted and released student assessments.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Course Completion Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-100">
              {initialPulse.overallCompletionRate}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Based on required published lessons completed across active cohort.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Quiz Participation
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-100">
              {initialPulse.quizParticipationRate}%
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Students who attempted at least one published quiz vs total enrolled.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Pending Grading
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-100">
              {initialPulse.pendingGradingCount}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Submissions requiring manual essay evaluation or rubric scoring.
          </p>
        </GlassCard>
      </div>

      {/* GapMap™ Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-slate-100">
                  GapMap™ Concept Analysis
                </h2>
                <Badge variant="outline" className="text-xs text-primary-light border-primary/40">
                  Topic Diagnostic
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Aggregated student errors mapped to question tags. Higher bars indicate critical knowledge deficits.
              </p>
            </div>
          </div>

          {gapMapData.length > 0 ? (
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gapMapData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C1828",
                      borderColor: "#374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                    formatter={(value: any, name: any) => [
                      `${value}%`,
                      name === "incorrect" ? "Incorrect Rate" : "Mastery Rate",
                    ]}
                  />
                  <Bar
                    dataKey="incorrect"
                    name="Incorrect Rate"
                    fill="#FF647C"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">
                No Concept Gaps Identified
              </p>
              <p className="text-xs mt-1 text-slate-500">
                Student assessment responses indicate strong baseline comprehension across topics.
              </p>
            </div>
          )}

          {/* Accessible Table Fallback */}
          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Concept Breakdown (Accessible Summary)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-elevated/50 text-text-muted">
                  <tr>
                    <th className="p-2 rounded-l">Concept / Tag</th>
                    <th className="p-2">Responses</th>
                    <th className="p-2">Incorrect %</th>
                    <th className="p-2 rounded-r">Points Lost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {initialPulse.gapMap.map((concept, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2 font-medium text-slate-200">
                        {concept.concept}
                      </td>
                      <td className="p-2">{concept.totalAnswered}</td>
                      <td className="p-2 text-rose-400 font-semibold">
                        {concept.incorrectPercentage}%
                      </td>
                      <td className="p-2 text-amber-400">
                        {concept.pointsLost} pts
                      </td>
                    </tr>
                  ))}
                  {initialPulse.gapMap.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No responses logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* Cohort Participation & Progress Pies */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-slate-800">
            <h2 className="text-base font-display font-bold text-slate-100 mb-1">
              Quiz Engagement
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Ratio of students actively attempting published assessments.
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={participationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#35C6FF" />
                    <Cell fill="#1e293b" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C1828",
                      borderColor: "#374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                    formatter={(val: any) => [`${val}%`, "Cohort Share"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-slate-800">
            <h2 className="text-base font-display font-bold text-slate-100 mb-1">
              Curriculum Completion
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Percentage of required published syllabus fulfilled by students.
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#35D6A2" />
                    <Cell fill="#1e293b" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0C1828",
                      borderColor: "#374151",
                      borderRadius: "8px",
                      color: "#F3F4F6",
                    }}
                    formatter={(val: any) => [`${val}%`, "Syllabus Share"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Support Indicators (Students Requiring Intervention) */}
      <GlassCard className="p-6 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold text-slate-100">
                Action Queue: Student Support Indicators
              </h2>
              <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/40">
                Transparent Alerts
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Objective intervention alerts triggered when students fall behind on required lessons or repeated low assessment scores.
            </p>
          </div>
        </div>

        {initialPulse.atRiskStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialPulse.atRiskStudents.map((student, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-elevated/40 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {student.studentName}
                      </h4>
                      <p className="text-xs text-slate-400">{student.studentEmail}</p>
                    </div>
                    <Badge
                      className={
                        student.severity === "HIGH"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                      }
                    >
                      {student.severity} PRIORITY
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Course: <span className="text-slate-300">{student.courseTitle}</span>
                  </p>

                  <div className="space-y-1 mt-3">
                    {student.reasons.map((reason, rIdx) => (
                      <div
                        key={rIdx}
                        className="text-xs text-slate-300 flex items-start gap-1.5"
                      >
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={`/teacher/gradebook?studentId=${student.studentId}`}
                    className="text-xs text-secondary hover:underline flex items-center gap-1"
                  >
                    View in Gradebook →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-elevated/20 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">
              All enrolled students are progressing on track
            </p>
            <p className="text-xs text-slate-500 mt-1">
              No students currently meet the support threshold (2+ overdue activities or repeated low quiz attempts).
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
