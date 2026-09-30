"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, User, Mail, Lock, GraduationCap, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/app-logo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (role === "TEACHER") {
        window.location.href = "/teacher/dashboard";
      } else {
        window.location.href = "/student/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Failed to register account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D17] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-blue-500/10 to-cyan-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="text-center mb-8 z-10 space-y-3">
        <AppLogo size="xl" variant="stacked" showTagline={false} />
        <p className="text-xs text-slate-400">Create your academic account on Nexora Learn</p>
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="relative rounded-3xl p-8 bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

          <div className="mb-6">
            <h1 className="text-xl font-bold font-heading text-white tracking-tight">Create an account</h1>
            <p className="text-xs text-slate-400 mt-1">Join the Nexora Demo University workspace</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    role === "STUDENT"
                      ? "bg-emerald-500/20 border-emerald-500/60 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" /> Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("TEACHER")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    role === "TEACHER"
                      ? "bg-cyan-500/20 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-cyan-400" /> Instructor
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-name" className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-2 focus:ring-cyan-500/20"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-2 focus:ring-cyan-500/20"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="Min. 8 characters"
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
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
