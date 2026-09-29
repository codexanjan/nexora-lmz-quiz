"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, UserCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "student@nexora.demo";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("NexoraPass2026!");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | "ADMIN">(
    initialEmail.includes("admin")
      ? "ADMIN"
      : initialEmail.includes("teacher")
      ? "TEACHER"
      : "STUDENT"
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      setEmail(urlEmail);
      if (urlEmail.includes("admin")) setSelectedRole("ADMIN");
      else if (urlEmail.includes("teacher")) setSelectedRole("TEACHER");
      else setSelectedRole("STUDENT");
    }
  }, [searchParams]);

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

    if (!targetEmail) {
      setError("Please enter your email address.");
      setIsLoading(false);
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
        throw new Error(data.error || "Login failed. Please verify credentials.");
      }

      // Hard navigation to ensure server components and session cookies are fresh
      const role = data.user.role;
      if (role === "ADMIN") {
        window.location.href = "/admin/overview";
      } else if (role === "TEACHER") {
        window.location.href = "/teacher/dashboard";
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setIsLoading(false);
    }
  };

  const instantLogin = (role: "STUDENT" | "TEACHER" | "ADMIN") => {
    let demoEmail = "student@nexora.demo";
    if (role === "TEACHER") demoEmail = "teacher@nexora.demo";
    if (role === "ADMIN") demoEmail = "admin@nexora.demo";

    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword("NexoraPass2026!");
    handleLogin(undefined, demoEmail, "NexoraPass2026!");
  };

  return (
    <Card className="p-8 border-white/10 shadow-2xl bg-nexora-surface/90 backdrop-blur-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Sign in to your workspace</h1>
        <p className="text-xs text-text-secondary mt-1">Select an account below or enter your credentials</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
          Select Role / Demo Profile
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => selectRole("STUDENT")}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              selectedRole === "STUDENT"
                ? "bg-nexora-primary/20 border-nexora-primary text-white shadow-glow-sm"
                : "bg-nexora-elevated/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold">Student</span>
            <span className="text-[9px] opacity-70">Anjan</span>
          </button>

          <button
            type="button"
            onClick={() => selectRole("TEACHER")}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              selectedRole === "TEACHER"
                ? "bg-nexora-primary/20 border-nexora-primary text-white shadow-glow-sm"
                : "bg-nexora-elevated/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold">Teacher</span>
            <span className="text-[9px] opacity-70">Prof. Ross</span>
          </button>

          <button
            type="button"
            onClick={() => selectRole("ADMIN")}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
              selectedRole === "ADMIN"
                ? "bg-nexora-primary/20 border-nexora-primary text-white shadow-glow-sm"
                : "bg-nexora-elevated/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold">Admin</span>
            <span className="text-[9px] opacity-70">Dr. Vance</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="name@nexora.demo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-nexora-elevated/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-nexora-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-nexora-elevated/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-nexora-primary transition-colors font-mono"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-nexora-primary to-nexora-secondary hover:opacity-90 text-white font-semibold text-sm rounded-xl shadow-lg shadow-nexora-primary/20 flex items-center justify-center gap-2 mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            "Authenticating..."
          ) : (
            <>
              Sign In to Nexora <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </form>

      {/* Instant Demo Launchers */}
      <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block text-center">
          Instant 1-Click Launchers (Bypasses Typing)
        </span>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => instantLogin("STUDENT")}
            className="text-xs text-emerald-400 hover:underline px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20"
          >
            Launch Student ↗
          </button>
          <button
            type="button"
            onClick={() => instantLogin("TEACHER")}
            className="text-xs text-cyan-400 hover:underline px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20"
          >
            Launch Teacher ↗
          </button>
          <button
            type="button"
            onClick={() => instantLogin("ADMIN")}
            className="text-xs text-indigo-400 hover:underline px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20"
          >
            Launch Admin ↗
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07111F] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nexora-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-nexora-secondary/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6 z-10 space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-1 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-nexora-primary to-nexora-secondary flex items-center justify-center shadow-lg shadow-nexora-primary/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            NEXORA <span className="text-nexora-secondary font-medium">LEARN</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400">Learn smarter. Practice better. Know what to do next.</p>
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading workspace...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-nexora-primary hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
