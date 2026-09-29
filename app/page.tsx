import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Layers,
  GraduationCap,
  Activity,
  Compass,
  Repeat,
  Cpu,
  Lock,
} from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.activeRole === "ADMIN") {
      redirect("/admin/overview");
    } else if (user.activeRole === "TEACHER") {
      redirect("/teacher/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-nexora-primary selection:text-white">
      {/* Background Glow Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-nexora-primary/15 via-nexora-secondary/10 to-transparent blur-3xl opacity-80" />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-nexora-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-[60%] right-[-10%] w-[500px] h-[500px] bg-nexora-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-[#07111F]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-nexora-primary to-nexora-secondary flex items-center justify-center shadow-lg shadow-nexora-primary/20">
              <span className="font-display font-extrabold text-white text-xl">
                N
              </span>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                NEXORA LEARN
              </span>
              <span className="block text-[10px] text-nexora-secondary font-mono tracking-wider uppercase">
                Learning Intelligence LMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-sm"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-nexora-primary to-nexora-secondary text-white font-medium text-sm shadow-md shadow-nexora-primary/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 space-y-24">
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-nexora-surface border border-slate-700/80 shadow-inner">
            <Sparkles className="w-4 h-4 text-nexora-secondary animate-pulse" />
            <span className="text-xs font-medium text-slate-300">
              Next-Generation Academic Assessment & Learning Intelligence
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.1] text-slate-100">
            Learn smarter. Practice better.{" "}
            <span className="bg-gradient-to-r from-nexora-primary via-indigo-400 to-nexora-secondary bg-clip-text text-transparent">
              Know what to do next.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            Traditional LMS platforms isolate courses, quizzes, and analytics.
            Nexora Learn unifies them into an interconnected, closed-loop intelligence engine.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button className="h-12 px-8 bg-gradient-to-r from-nexora-primary to-nexora-secondary hover:opacity-90 text-white font-semibold text-base rounded-xl shadow-lg shadow-nexora-primary/30 flex items-center gap-2">
                Launch Interactive Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors py-3 px-6"
            >
              Explore Architecture ↓
            </a>
          </div>

          {/* Quick Demo Account Launchers */}
          <div className="pt-8">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
              One-Click Role Demonstration Accounts (Pre-Seeded)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?email=student@nexora.demo">
                <Badge className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700 cursor-pointer py-1.5 px-3 text-xs transition-colors">
                  🎓 Student Experience: <span className="text-emerald-400 ml-1">student@nexora.demo</span>
                </Badge>
              </Link>
              <Link href="/login?email=teacher@nexora.demo">
                <Badge className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700 cursor-pointer py-1.5 px-3 text-xs transition-colors">
                  👨‍🏫 Instructor Portal: <span className="text-cyan-400 ml-1">teacher@nexora.demo</span>
                </Badge>
              </Link>
              <Link href="/login?email=admin@nexora.demo">
                <Badge className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700 cursor-pointer py-1.5 px-3 text-xs transition-colors">
                  🛡️ Administrator Console: <span className="text-indigo-400 ml-1">admin@nexora.demo</span>
                </Badge>
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Universal Demo Password: <span className="text-slate-300">NexoraPass2026!</span>
            </p>
          </div>
        </section>

        {/* Core Value Pillars / Novelty Systems */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-100">
              The Connected Learning Ecosystem
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Every lesson completed, question answered, and essay graded immediately updates student recommendations and cohort diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard className="p-6 border-slate-800 hover:border-nexora-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-nexora-primary flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Learning Pulse™
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                A fully explainable, transparent learning health score built from required syllabus progress, quiz participation, recent finalized scores, and overdue activities. Never an opaque score.
              </p>
            </GlassCard>

            <GlassCard className="p-6 border-slate-800 hover:border-nexora-secondary/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                NextStep™ Engine
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Dynamically computes the highest-leverage next activity for each student: whether completing an unread lesson, sitting an eligible quiz, or revisiting teacher feedback.
              </p>
            </GlassCard>

            <GlassCard className="p-6 border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                ReviewLoop™
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Post-assessment cognitive retention system. Automatically aggregates student mistakes by question tags and links them directly back to source lessons for targeted remediation.
              </p>
            </GlassCard>

            <GlassCard className="p-6 border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Class Pulse & GapMap™
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Gives instructors real-time cohort visibility: overall syllabus completion, participation rates, and a tag-level GapMap identifying exactly which topics students struggle with.
              </p>
            </GlassCard>

            <GlassCard className="p-6 border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Authoritative Timing & Autosave
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Server-enforced deadlines calculated from opening dates and individual student accommodations. Incremental debounced autosave with revision tracking guarantees zero answer loss.
              </p>
            </GlassCard>

            <GlassCard className="p-6 border-slate-800 hover:border-rose-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Gradebook & Secure Auditing
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Multi-tenancy isolation with strict role-based access control, manual essay grading with rubric revisions, and CSV exports sanitized against formula injection.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Architectural Flow Diagram */}
        <section className="p-8 rounded-2xl bg-nexora-surface/60 border border-slate-800/80">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-100">
              The Closed-Loop Progression Workflow
            </h3>
            <p className="text-xs text-slate-400">
              How actions flow through Nexora's event and outbox architecture
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
            {[
              { step: "1", title: "Teacher Publishes", desc: "Course or quiz", color: "text-indigo-400" },
              { step: "2", title: "Outbox Dispatches", desc: "Notification to student", color: "text-cyan-400" },
              { step: "3", title: "Student Learns", desc: "Completes lesson", color: "text-emerald-400" },
              { step: "4", title: "Progress Recalcs", desc: "Formula: Req / Tot", color: "text-amber-400" },
              { step: "5", title: "Takes Quiz", desc: "Authoritative timer", color: "text-purple-400" },
              { step: "6", title: "Auto-Grades", desc: "4 types + essay queue", color: "text-rose-400" },
              { step: "7", title: "Teacher Grades", desc: "Rubric revision", color: "text-cyan-400" },
              { step: "8", title: "ReviewLoop", desc: "Remediates gaps", color: "text-emerald-400" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-nexora-elevated/40 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className={`text-xs font-mono font-bold ${item.color}`}>
                    Step {item.step}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1">
                    {item.title}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">
              NEXORA LEARN
            </span>
            <span>•</span>
            <span>Learn smarter. Understand deeper. Progress with purpose.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>WCAG 2.2 AA Compliant</span>
            <span>•</span>
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Prisma ORM</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
