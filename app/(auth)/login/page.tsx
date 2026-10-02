"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, GraduationCap, UserCheck, Loader2, Lock, Mail, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/app-logo";

export default function LoginPage() {
  const [email, setEmail] = useState("student@nexora.demo");
  const [password, setPassword] = useState("NexoraPass2026!");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">("STUDENT");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [launchingRole, setLaunchingRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get("email");
      if (urlEmail) {
        setEmail(urlEmail);
        if (urlEmail.includes("admin")) setSelectedRole("ADMIN");
        else if (urlEmail.includes("teacher")) setSelectedRole("TEACHER");
        else setSelectedRole("STUDENT");
      }
    }
  }, []);

  const selectRole = (role: "STUDENT" | "TEACHER" | "ADMIN") => {
    setSelectedRole(role);
    if (role === "STUDENT") {
      setEmail("student@nexora.demo");
    } else if (role === "TEACHER") {
      setEmail("teacher@nexora.demo");
    } else {
      setEmail("admin@nexora.demo");
    }
    setPassword("NexoraPass2026!");
    setError("");
  };

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    const targetEmail = (customEmail || email).trim();
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      setError("Please enter your email and password.");
      setIsLoading(false);
      setLaunchingRole(null);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.user?.role === "ADMIN") {
        window.location.href = "/admin/overview";
      } else if (data.user?.role === "TEACHER") {
        window.location.href = "/teacher/dashboard";
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
      setIsLoading(false);
      setLaunchingRole(null);
    }
  };

  const instantLogin = (role: "STUDENT" | "TEACHER" | "ADMIN") => {
    setLaunchingRole(role);
    setSelectedRole(role);
    const demoEmail =
      role === "STUDENT"
        ? "student@nexora.demo"
        : role === "TEACHER"
        ? "teacher@nexora.demo"
        : "admin@nexora.demo";

    setEmail(demoEmail);
    setPassword("NexoraPass2026!");
    handleLogin(undefined, demoEmail, "NexoraPass2026!");
  };

  return (
    <div className="min-h-screen bg-[#060D17] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Ambient Glow Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-blue-500/10 to-cyan-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Brand Header with AppLogo */}
      <div className="text-center mb-8 z-10 space-y-3">
        <AppLogo size="xl" variant="stacked" showTagline={false} />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Production Vercel Host & API Gateway Ready
        </div>
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="relative rounded-3xl p-8 bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="mb-6">
            <h1 className="text-xl font-bold font-heading text-white tracking-tight">
              Sign in to your portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select a pre-seeded demo profile or enter custom credentials
            </p>
          </div>

          {/* Role Selection Profiles */}
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2.5">
              Select Demo Account Role
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => selectRole("STUDENT")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all relative overflow-hidden group ${
                  selectedRole === "STUDENT"
                    ? "bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border-emerald-500/60 text-white shadow-[0_0_20px_rgba(52,211,153,0.2)]"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Student</span>
                <span className="text-[10px] text-slate-400 font-mono">Anjan S.</span>
                {selectedRole === "STUDENT" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => selectRole("TEACHER")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all relative overflow-hidden group ${
                  selectedRole === "TEACHER"
                    ? "bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 border-cyan-500/60 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Teacher</span>
                <span className="text-[10px] text-slate-400 font-mono">Prof. Ross</span>
                {selectedRole === "TEACHER" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => selectRole("ADMIN")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all relative overflow-hidden group ${
                  selectedRole === "ADMIN"
                    ? "bg-gradient-to-b from-indigo-500/20 to-indigo-500/5 border-indigo-500/60 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Admin</span>
                <span className="text-[10px] text-slate-400 font-mono">Dr. Vance</span>
                {selectedRole === "ADMIN" && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@nexora.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-2 focus:ring-cyan-500/20"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-2 focus:ring-cyan-500/20 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-sm rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 mt-2 transition-transform active:scale-[0.99]"
              disabled={isLoading}
            >
              {isLoading && !launchingRole ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Authenticating Session...
                </>
              ) : (
                <>
                  Enter Nexora Workspace <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Quick 1-Click Launchers */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block text-center font-semibold">
              Instant 1-Click Demo Launcher
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => instantLogin("STUDENT")}
                className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-50 flex items-center justify-center gap-1.5 font-medium shadow-sm"
              >
                {launchingRole === "STUDENT" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Student ↗</>
                )}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => instantLogin("TEACHER")}
                className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/50 disabled:opacity-50 flex items-center justify-center gap-1.5 font-medium shadow-sm"
              >
                {launchingRole === "TEACHER" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Teacher ↗</>
                )}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => instantLogin("ADMIN")}
                className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/25 transition-all hover:bg-indigo-500/20 hover:border-indigo-500/50 disabled:opacity-50 flex items-center justify-center gap-1.5 font-medium shadow-sm"
              >
                {launchingRole === "ADMIN" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Admin ↗</>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          New to the platform?{" "}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium">
            Register academic account
          </Link>
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            ← Home
          </Link>
          <span>•</span>
          <a
            href="https://nexora-learn-gold.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-cyan-500"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Vercel Live
          </a>
          <span>•</span>
          <a
            href="https://github.com/codexanjan/nexora-lmz-quiz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
