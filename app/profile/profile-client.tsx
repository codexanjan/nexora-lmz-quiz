"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Shield,
  Bell,
  Clock,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  LogOut,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SessionItem {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    timezone: string;
    activeRole: string;
    organizationName: string;
    createdAt: string;
  };
  sessions: SessionItem[];
}

export function ProfileClient({ user, sessions }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "security">("account");
  const [name, setName] = useState(user.name);
  const [timezone, setTimezone] = useState(user.timezone || "UTC");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Notification toggles state
  const [quizReminders, setQuizReminders] = useState(true);
  const [resultReleases, setResultReleases] = useState(true);
  const [feedbackAlerts, setFeedbackAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage(null);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          timezone,
          preferences: [
            { type: "QUIZ_DEADLINE", inApp: quizReminders, email: emailDigest },
            { type: "RESULT_RELEASED", inApp: resultReleases, email: emailDigest },
            { type: "FEEDBACK_ADDED", inApp: feedbackAlerts, email: emailDigest },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setMessage({ type: "success", text: "Profile settings saved successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    try {
      setIsChangingPass(true);
      setMessage(null);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-100">
          Account Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal details, local timezone, notification preferences, and active authentication sessions.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "account"
              ? "bg-primary/15 text-primary-light border border-primary/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <User className="w-4 h-4" /> Account Details
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "notifications"
              ? "bg-primary/15 text-primary-light border border-primary/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "security"
              ? "bg-primary/15 text-primary-light border border-primary/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
          }`}
        >
          <Shield className="w-4 h-4" /> Security & Sessions
        </button>
      </div>

      {/* Tab: Account Details */}
      {activeTab === "account" && (
        <GlassCard className="p-6 border-white/10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-2xl border border-primary/40">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary-light border-primary/30">
                  {user.activeRole}
                </Badge>
                <Badge variant="outline" className="text-slate-400 border-white/10">
                  {user.organizationName}
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-elevated border-white/10 text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address (Primary Identity)
              </label>
              <Input
                value={user.email}
                disabled
                className="bg-elevated/40 border-white/5 text-text-muted cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Email address is verified and tied to your institutional organization account.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-elevated border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Quiz deadlines and timestamps will be displayed relative to this timezone.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Tab: Notifications */}
      {activeTab === "notifications" && (
        <GlassCard className="p-6 border-white/10 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Notification Preferences
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select which events generate persistent in-app notifications and email summaries.
            </p>
          </div>

          <div className="space-y-4 divide-y divide-white/5">
            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Assessment Deadlines & Reminders
                </h4>
                <p className="text-xs text-slate-400">
                  Get notified when a quiz deadline is 24h and 1h away.
                </p>
              </div>
              <input
                type="checkbox"
                checked={quizReminders}
                onChange={(e) => setQuizReminders(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Result Releases & Grades
                </h4>
                <p className="text-xs text-slate-400">
                  Receive instant alerts when assessment scores and answers are released.
                </p>
              </div>
              <input
                type="checkbox"
                checked={resultReleases}
                onChange={(e) => setResultReleases(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Instructor Feedback & Rubrics
                </h4>
                <p className="text-xs text-slate-400">
                  Notifications when teachers grade essay responses with written comments.
                </p>
              </div>
              <input
                type="checkbox"
                checked={feedbackAlerts}
                onChange={(e) => setFeedbackAlerts(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Email Notifications
                </h4>
                <p className="text-xs text-slate-400">
                  Dispatch email notifications for high-priority alerts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={handleUpdateProfile}
              disabled={isSaving}
              className="bg-primary hover:bg-primary-hover text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Tab: Security & Sessions */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Password Change */}
          <GlassCard className="p-6 border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 mb-1">
              Change Password
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Ensure your account uses a strong password with at least 8 characters.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-elevated border-white/10 text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-elevated border-white/10 text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-elevated border-white/10 text-text-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isChangingPass}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                {isChangingPass ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </GlassCard>

          {/* Active Sessions */}
          <GlassCard className="p-6 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Active Sessions
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active device sessions authenticated against your account.
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Terminate Session
              </Button>
            </div>

            <div className="space-y-3">
              {sessions.map((sess, idx) => (
                <div
                  key={sess.id}
                  className="p-3.5 rounded-xl bg-elevated/40 border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary-light">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">
                          {sess.userAgent || "Web Browser (Desktop)"}
                        </span>
                        {idx === 0 && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        IP: {sess.ipAddress || "127.0.0.1"} • Created: {formatDate(sess.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Expires: {formatDate(sess.expiresAt)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
