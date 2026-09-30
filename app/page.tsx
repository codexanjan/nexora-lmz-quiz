import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AppLogo } from "@/components/ui/app-logo";
import { HeroPreviewStudio } from "@/components/landing/hero-preview-studio";
import {
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
  Zap,
  Lock,
  UserCheck,
  Flame,
  Award,
  BookOpen,
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
    <div className="min-h-screen bg-[#060D17] text-slate-100 selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      {/* Background Radial Glow & Gradient Meshes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-indigo-600/20 via-cyan-500/10 to-transparent blur-[140px] opacity-80" />
        <div className="absolute top-[35%] left-[-15%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-[65%] right-[-15%] w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Subtle Blueprint Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top Navigation */}
      <nav className="relative z-30 border-b border-white/[0.08] bg-[#060D17]/85 backdrop-blur-xl sticky top-0 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <AppLogo size="md" href="/" />

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-300 transition-colors">
              Platform Features
            </a>
            <a href="#demo-roles" className="hover:text-cyan-300 transition-colors">
              Role Personas
            </a>
            <a href="#workflow" className="hover:text-cyan-300 transition-colors">
              System Architecture
            </a>
            <a href="#brand" className="hover:text-cyan-300 transition-colors">
              Brand Identity
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 text-xs font-medium transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center gap-1.5"
            >
              <span>Interactive Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-28 space-y-32">
        {/* HERO SECTION */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-4">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-300 tracking-wide">
              Nexora Pulse™ Engine v1.0 • Live Assessment Intelligence
            </span>
          </div>

          {/* Punchy Hero Typography */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[1.08] text-white">
            Learn smarter. Practice better.{" "}
            <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              Know what to do next.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            Traditional LMS platforms isolate course material, quiz attempts, and analytics.
            Nexora Learn unifies them into an interconnected, closed-loop intelligence engine with server-authoritative assessments.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="h-12 px-8 bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-sm rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.35)] inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Launch Live Assessment Demo <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <a
              href="#demo-roles"
              className="h-12 px-6 rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white text-sm font-medium transition-all inline-flex items-center justify-center"
            >
              Select Preloaded Persona ↓
            </a>
          </div>

          {/* Interactive Studio Preview Mockup */}
          <div className="pt-10">
            <HeroPreviewStudio />
          </div>
        </section>

        {/* 1-CLICK DEMO ROLE PERSONAS */}
        <section id="demo-roles" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Instant Access
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Explore Nexora in Action
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Three pre-seeded persona accounts ready for immediate 1-click test drives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Role Card */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)] flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Student
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Anjan Sharma
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enrolled in Machine Learning and Computer Science courses. Has active attempts and targeted ReviewLoop remediations.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Email: <span className="text-emerald-400">student@nexora.demo</span></div>
                  <div>Password: <span className="text-slate-400">NexoraPass2026!</span></div>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  href="/login?email=student@nexora.demo"
                  className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  Launch Student Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Teacher Role Card */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Lead Instructor
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Prof. Alexander Ross
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Author of question bank and course modules. Oversees grading queues, rubric revisions, and cohort GapMap analytics.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Email: <span className="text-cyan-400">teacher@nexora.demo</span></div>
                  <div>Password: <span className="text-slate-400">NexoraPass2026!</span></div>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  href="/login?email=teacher@nexora.demo"
                  className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  Launch Instructor Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Admin Role Card */}
            <div className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    System Admin
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Dr. Elena Vance
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Organization administrator. Manages user access, institution security audit trails, and system health diagnostics.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Email: <span className="text-indigo-400">admin@nexora.demo</span></div>
                  <div>Password: <span className="text-slate-400">NexoraPass2026!</span></div>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  href="/login?email=admin@nexora.demo"
                  className="w-full py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  Launch Admin Console <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CORE ARCHITECTURAL PILLARS */}
        <section id="features" className="space-y-12 scroll-mt-24">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              The Connected Learning Ecosystem
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Every lesson viewed, question completed, and essay revised updates student guidance and cohort diagnostics in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl p-7 bg-slate-900/50 border border-white/10 hover:border-indigo-500/40 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Learning Pulse™
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                A fully explainable, transparent learning health score built from required syllabus progress, quiz participation, recent scores, and overdue activities. Never an opaque number.
              </p>
            </div>

            <div className="rounded-3xl p-7 bg-slate-900/50 border border-white/10 hover:border-cyan-500/40 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 border border-cyan-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                NextStep™ Engine
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Dynamically computes the highest-leverage next action for each learner: whether reading an unread core module, taking a newly published quiz, or reviewing teacher essay feedback.
              </p>
            </div>

            <div className="rounded-3xl p-7 bg-slate-900/50 border border-white/10 hover:border-amber-500/40 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                ReviewLoop™
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Post-assessment cognitive retention system. Automatically aggregates student mistakes by question tags and links them back to specific lesson notes for targeted remediation.
              </p>
            </div>

            <div className="rounded-3xl p-7 bg-slate-900/50 border border-white/10 hover:border-emerald-500/40 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Class Pulse & GapMap™
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Empowers instructors with real-time cohort visibility: overall syllabus completion, participation rates, and a tag-level GapMap identifying topics where students struggle.
              </p>
            </div>

            <div className="rounded-3xl p-7 bg-slate-900/50 border border-white/10 hover:border-purple-500/40 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Authoritative Timing & Autosave
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Server-enforced deadlines calculated from opening dates and individual accommodations. Incremental debounced autosave with revision tracking guarantees zero answer loss.
              </p>
            </div>

            <div className="rounded-3xl p-7 bg-slate-900/50 border border-white/10 hover:border-rose-500/40 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5 border border-rose-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Gradebook & Secure Auditing
              </h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Multi-tenancy isolation with strict role-based access control, manual essay grading with rubric revisions, and CSV exports sanitized against formula injection vulnerabilities.
              </p>
            </div>
          </div>
        </section>

        {/* WORKFLOW PIPELINE */}
        <section id="workflow" className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-white/10 space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-heading font-bold text-white">
              The Closed-Loop Assessment Workflow
            </h3>
            <p className="text-xs text-slate-400">
              How events traverse Nexora&apos;s event dispatcher, transactional outbox, and real-time state machines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
            {[
              { step: "01", title: "Teacher Publishes", desc: "Course or assessment", color: "text-indigo-400" },
              { step: "02", title: "Outbox Dispatches", desc: "Notification to student", color: "text-cyan-400" },
              { step: "03", title: "Student Learns", desc: "Completes lesson modules", color: "text-emerald-400" },
              { step: "04", title: "Progress Recalcs", desc: "Req / Tot formula", color: "text-amber-400" },
              { step: "05", title: "Authoritative Quiz", desc: "Server sync timer", color: "text-purple-400" },
              { step: "06", title: "Instant Auto-Grading", desc: "MCQ + short answer", color: "text-rose-400" },
              { step: "07", title: "Instructor Evaluation", desc: "Essay rubric grading", color: "text-cyan-400" },
              { step: "08", title: "ReviewLoop Engine", desc: "Targeted remediation", color: "text-emerald-400" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col justify-between hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <span className={`text-[10px] font-mono font-bold ${item.color}`}>
                    STEP {item.step}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1.5">
                    {item.title}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 mt-2.5 font-mono">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BRAND LOGO IDENTITY SHOWCASE */}
        <section id="brand" className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-white/10 flex flex-col md:flex-row items-center gap-8 justify-between scroll-mt-24">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs">
              <Award className="w-3.5 h-3.5 text-indigo-400" /> Official Brand Identity
            </div>
            <h3 className="text-3xl font-heading font-black text-white tracking-tight">
              Nexora: The Luminous Knowledge Prism
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed as an interconnected geometric crystal, the Nexora &quot;N&quot; emblem embodies structured learning paths, transparent assessment integrity, and illuminated cognitive growth.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2"
              >
                Launch Nexora LMS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative group shrink-0">
            <div className="w-56 h-56 rounded-3xl p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_0_50px_rgba(99,102,241,0.3)]">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 flex items-center justify-center p-3 relative">
                <AppLogo size="xl" variant="mark-only" />
              </div>
            </div>
          </div>
        </section>

        {/* Minimalist Tech Footer */}
        <footer className="border-t border-white/[0.08] pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" showTagline={false} />
            <span>•</span>
            <span>Learn smarter. Practice better. Know what to do next.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>WCAG 2.2 AA</span>
            <span>•</span>
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Vercel Serverless Ready</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
