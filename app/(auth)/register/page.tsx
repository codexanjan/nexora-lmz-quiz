"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="text-center mb-8 z-10 space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-white group-hover:text-primary-light transition-colors">
            NEXORA <span className="text-secondary font-medium">LEARN</span>
          </span>
        </Link>
        <p className="text-xs text-text-secondary">Create your academic account</p>
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        <Card className="p-8 border-white/10 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-text-primary">Create an account</h1>
            <p className="text-xs text-text-secondary mt-1">Join Nexora Demo University workspace</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-critical/15 border border-critical/30 text-critical text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              id="register-name"
              label="Full Name"
              placeholder="Dr. Jordan Hayes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              id="register-email"
              type="email"
              label="Email address"
              placeholder="jordan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="register-password"
              type="password"
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    role === "STUDENT"
                      ? "bg-primary text-white border-primary-light shadow-glow-sm"
                      : "bg-surface border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole("TEACHER")}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    role === "TEACHER"
                      ? "bg-primary text-white border-primary-light shadow-glow-sm"
                      : "bg-surface border-white/10 text-text-secondary hover:text-white"
                  }`}
                >
                  Teacher / Instructor
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading} loadingText="Creating account...">
              Create Account <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-light hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
