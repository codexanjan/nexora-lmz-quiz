"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  Zap,
  RotateCcw,
  BarChart3,
  Layers,
} from "lucide-react";

export function HeroPreviewStudio() {
  const [activeTab, setActiveTab] = useState<"student" | "quiz" | "teacher">("student");

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-cyan-500/20 via-indigo-500/10 to-transparent border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      {/* Studio Header & Tab Switcher */}
      <div className="p-4 sm:p-5 rounded-[22px] bg-slate-950/80 border-b border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-slate-400 pl-2 border-l border-white/10 hidden sm:inline">
            nexora-runtime://live-assessment-intelligence
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab("student")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === "student"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Student Pulse</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === "quiz"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Quiz Runtime</span>
          </button>

          <button
            onClick={() => setActiveTab("teacher")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === "teacher"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Teacher Radar</span>
          </button>
        </div>
      </div>

      {/* Studio Screen Display */}
      <div className="p-6 sm:p-8 bg-slate-950/60 rounded-b-[22px] min-h-[380px]">
        {/* TAB 1: STUDENT VIEW */}
        {activeTab === "student" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Academic Session
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Student Dashboard • Anjan Sharma
                </h3>
              </div>
              <Link href="/login?email=student@nexora.demo">
                <span className="text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1 transition-colors">
                  Open Student Portal <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Learning Pulse Dial */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" /> Learning Pulse™
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                    Good Standing
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-4xl font-extrabold text-white tracking-tight font-heading">
                    78<span className="text-slate-500 text-lg font-normal">/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Calculated from 100% syllabus progress & 78% quiz accuracy.
                  </p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-[78%]" />
                </div>
              </div>

              {/* NextStep Engine Recommendation */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" /> NextStep™ Recommendation
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                    High Leverage
                  </span>
                </div>
                <div className="my-1">
                  <h4 className="text-sm font-semibold text-white">
                    Foundations of Machine Learning
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    Sitting your pending assessment will elevate your cohort percentile by +14%.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-cyan-300/80 mt-2 flex items-center gap-1">
                  Estimated time: 30 minutes • 5 questions
                </div>
              </div>

              {/* ReviewLoop Queue */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-amber-400" /> ReviewLoop™ Queue
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                    2 Retentions
                  </span>
                </div>
                <div className="my-1">
                  <div className="text-sm font-medium text-slate-200">
                    Targeted Topic Remediations
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      #LossFunctions
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      #CrossEntropy
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Linked directly to Module 2 Lesson notes.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUIZ RUNTIME */}
        {activeTab === "quiz" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Authoritative Timer Active
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Interactive Quiz Runtime • Question 2 of 5
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Time Left: <span className="font-bold text-cyan-300">28:45</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  ✓ Autosaved rev #4
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-300 font-mono font-semibold">QUESTION 2 • MULTIPLE CHOICE</span>
                <span className="text-cyan-400 font-mono">1.0 Points</span>
              </div>
              <p className="text-base text-slate-100 font-medium leading-relaxed">
                Which optimization algorithm adapts the learning rate for each parameter using an exponentially decaying average of past squared gradients?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { key: "A", text: "Standard Batch Gradient Descent", selected: false },
                  { key: "B", text: "RMSProp Optimization", selected: true },
                  { key: "C", text: "Vanilla Stochastic Gradient Descent", selected: false },
                  { key: "D", text: "Fixed Step Momentum Gradient", selected: false },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs transition-all ${
                      opt.selected
                        ? "bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                        : "bg-slate-950/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        opt.selected
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="font-medium">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEACHER RADAR */}
        {activeTab === "teacher" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-mono mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Cohort Analytics Engine
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Instructor Intelligence • Prof. Alexander Ross
                </h3>
              </div>
              <Link href="/login?email=teacher@nexora.demo">
                <span className="text-xs bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1 transition-colors">
                  Open Teacher Portal <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-200">Cohort Participation</span>
                  <span className="text-emerald-400 font-mono text-[10px]">88.4%</span>
                </div>
                <div className="text-3xl font-extrabold text-white font-heading my-1">
                  24 <span className="text-slate-500 text-sm font-normal">Active Students</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  4 assessments pending final submission, 1 in essay evaluation queue.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-200">Evaluation Queue</span>
                  <span className="text-amber-400 font-mono text-[10px]">Pending</span>
                </div>
                <div className="text-3xl font-extrabold text-amber-300 font-heading my-1">
                  1 Essay
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Rubric grading revisions ready with instant score recalculation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-200">Class GapMap™ Alert</span>
                  <span className="text-rose-400 font-mono text-[10px]">Attention</span>
                </div>
                <div className="text-sm font-bold text-white my-1">
                  Tag: #LossFunctions
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Cohort accuracy at 42%. ReviewLoop™ automated targeted remediation active.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
