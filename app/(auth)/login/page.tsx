"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, UserCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect based on role
      const role = data.user.role;
      if (role === "ADMIN") {
        router.push("/admin/overview");
      } else if (role === "TEACHER") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("NexoraPass2026!");
    handleLogin(undefined, demoEmail, "NexoraPass2026!");
  };

  return (
    <div className="min-h-screen bg-deep flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 z-10 space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-white group-hover:text-primary-light transition-colors">
            NEXORA <span className="text-secondary font-medium">LEARN</span>
          </span>
        </Link>
        <p className="text-xs text-text-secondary">Learn smarter. Practice better. Know what to do next.</p>
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        <Card className="p-8 border-white/10 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text-primary">Sign in to your workspace</h1>
            <p className="text-xs text-text-secondary mt-1">Enter your credentials to access your courses & assessments</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="login-email"
              type="email"
              label="Email address"
              placeholder="name@nexora.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="login-password"
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading} loadingText="Authenticating...">
              Sign In to Nexora <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Accounts Switcher (Section 16) */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-mono">
                One-Click Demo Access
              </span>
              <Badge variant="outline" className="text-[10px]">Pre-seeded</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("student@nexora.demo")}
                className="p-2.5 rounded-xl bg-surface hover:bg-white/[0.06] border border-white/10 flex flex-col items-center gap-1.5 transition-all group text-center"
              >
                <GraduationCap className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-primary">Student</span>
                <span className="text-[9px] text-text-muted font-mono">Anjan</span>
              </button>

              <button
                type="button"
                onClick={() => quickLogin("teacher@nexora.demo")}
                className="p-2.5 rounded-xl bg-surface hover:bg-white/[0.06] border border-white/10 flex flex-col items-center gap-1.5 transition-all group text-center"
              >
                <UserCheck className="w-4 h-4 text-primary-light group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-primary">Teacher</span>
                <span className="text-[9px] text-text-muted font-mono">Prof. Ross</span>
              </button>

              <button
                type="button"
                onClick={() => quickLogin("admin@nexora.demo")}
                className="p-2.5 rounded-xl bg-surface hover:bg-white/[0.06] border border-white/10 flex flex-col items-center gap-1.5 transition-all group text-center"
              >
                <ShieldCheck className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-text-primary">Admin</span>
                <span className="text-[9px] text-text-muted font-mono">Dr. Vance</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-text-muted font-mono pt-1">
              Demo Password: <span className="text-text-secondary">NexoraPass2026!</span>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary-light hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
