import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateLearningPulse } from "@/lib/services/learning-pulse-service";
import { getReviewLoopItems } from "@/lib/services/reviewloop-service";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LearningPulsePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const pulse = await calculateLearningPulse(user.id);
  const reviewItems = await getReviewLoopItems(user.id);

  return (
    <AppShell user={user}>
      <div className="space-y-8 pb-16">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary tracking-tight">
            Learning Pulse™ & ReviewLoop™
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Transparent academic signals and concept-level revision recommendations
          </p>
        </div>

        {/* Pulse Telemetry Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <Card className="p-8 border-primary/30 shadow-glow/15 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                  Overall Index
                </span>
                <Badge variant={pulse.score >= 75 ? "success" : "warning"}>
                  {pulse.label}
                </Badge>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-bold font-heading text-white">{pulse.score}</span>
                <span className="text-xs text-text-muted font-mono">/ 100 PTS</span>
              </div>

              <div className="p-4 rounded-xl bg-surface/80 border border-white/10 text-xs text-text-secondary space-y-2">
                <span className="font-semibold text-text-primary block">Transparent Calculation Rule</span>
                <p className="leading-relaxed">
                  Learning Pulse is computed deterministically from required lesson completions, finalized quiz scores, participation consistency, and overdue penalties. No opaque black-box AI scores.
                </p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="p-8 space-y-6">
              <h2 className="text-base font-bold text-text-primary">Underlying Diagnostic Signals</h2>

              <div className="space-y-3">
                {pulse.signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface/70 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          sig.type === "positive"
                            ? "bg-success/20 text-success"
                            : sig.type === "negative"
                            ? "bg-critical/20 text-critical"
                            : "bg-white/10 text-text-muted"
                        }`}
                      >
                        {sig.type === "positive" ? "+" : sig.type === "negative" ? "-" : "•"}
                      </div>
                      <span className="text-xs font-medium text-text-primary">{sig.text}</span>
                    </div>

                    <span className="text-xs font-mono font-bold text-text-muted">
                      {sig.weight > 0 ? `+${sig.weight}` : sig.weight < 0 ? sig.weight : "0"} pts
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ReviewLoop Concept Review Queue */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-warning" />
                <h2 className="text-xl font-bold font-heading text-text-primary">ReviewLoop™ Queue</h2>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Concepts requiring targeted reinforcement based on questions missed during assessments
              </p>
            </div>
            <Badge variant="warning">{reviewItems.length} Concepts Identified</Badge>
          </div>

          {reviewItems.length === 0 ? (
            <Card className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto opacity-70" />
              <h3 className="text-sm font-bold text-text-primary">Clean Bill of Learning Health</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                You have answered all assessment questions accurately with no outstanding concept deficiencies.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewItems.map((item) => (
                <Card key={item.id} className="p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-warning uppercase">
                        Priority {item.priority}
                      </span>
                      <Badge variant="critical" className="font-mono">
                        {item.missedCount} Missed ({item.accuracyRate}% Accuracy)
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold text-text-primary">{item.concept}</h3>
                    <p className="text-xs text-text-secondary">Course: {item.courseTitle}</p>

                    <div className="p-3 rounded-xl bg-surface/80 border border-white/10 space-y-1.5 text-xs">
                      <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">
                        Sample Question Prompt Missed
                      </span>
                      <p className="text-text-primary italic line-clamp-2">
                        &quot;{item.sampleQuestionPrompt}&quot;
                      </p>
                    </div>

                    {item.explanation && (
                      <div className="text-xs text-text-muted bg-white/[0.02] p-3 rounded-lg border border-white/5 space-y-1">
                        <span className="font-semibold text-text-secondary block">Concept Foundation:</span>
                        <p className="leading-relaxed line-clamp-3">{item.explanation}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    {item.suggestedLessonId ? (
                      <Link href={`/student/courses/${item.courseId}/lessons/${item.suggestedLessonId}`}>
                        <Button size="sm" className="w-full">
                          Study Lesson &quot;{item.suggestedLessonTitle}&quot; <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/student/courses/${item.courseId}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          Review Course Curriculum
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
