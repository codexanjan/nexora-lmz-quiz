"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Shield, UserCheck, AlertCircle, CheckCircle2, MoreVertical, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  membershipId: string;
  enrollmentsCount: number;
  attemptsCount: number;
}

interface UsersClientProps {
  initialUsers: UserItem[];
  currentAdminId: string;
}

export function UsersClient({ initialUsers, currentAdminId }: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setLoadingUserId(userId);
      setMessage(null);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      setMessage({
        type: "success",
        text: `Role successfully updated to ${newRole}. Audit event dispatched.`,
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-100">
            User Directory & Access Control
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage organization memberships, authorization privileges, and account roles.
          </p>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/80 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-elevated/90 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-text-secondary font-medium">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-elevated border border-white/10 rounded-xl px-3.5 py-2 text-xs text-text-primary outline-none cursor-pointer focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="ADMIN">Admins</option>
            <option value="TEACHER">Teachers</option>
            <option value="STUDENT">Students</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <GlassCard className="p-0 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-elevated text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-6 text-right">Actions / Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentAdminId;
                const isLoading = loadingUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-sm border border-primary/30">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-100">{user.name}</span>
                            {isSelf && (
                              <Badge className="bg-slate-700 text-slate-300 text-[10px] py-0 px-1.5">
                                You
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        className={
                          user.role === "ADMIN"
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                            : user.role === "TEACHER"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400">
                      <div>
                        <span>{user.enrollmentsCount} enrollments</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {user.attemptsCount} quiz attempts
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {isSelf ? (
                        <span className="text-xs text-slate-500 italic">Protected (Self)</span>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <select
                            disabled={isLoading}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-elevated border border-white/10 rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          {isLoading && <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
