"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ShieldAlert,
  User,
  LogOut,
  Check,
  ChevronDown,
  Layers,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/app-logo";

interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    organizationName?: string;
  } | null;
  onOpenAlerts?: () => void;
  onOpenCommandPalette?: () => void;
}

export function GlobalNavbar({ user, onOpenAlerts, onOpenCommandPalette }: NavbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // Polling fallback for real-time notification sync
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string, linkUrl: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
    setShowNotifications(false);
    router.push(linkUrl);
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {}
  };

  return (
    <header className="h-[70px] sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-6 flex items-center justify-between">
      {/* Left: Brand & Workspace */}
      <div className="flex items-center gap-6">
        <AppLogo size="md" href="/" />

        {user?.organizationName && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10 text-xs text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-text-primary">{user.organizationName}</span>
          </div>
        )}
      </div>

      {/* Center: Search & Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-10 px-3.5 rounded-xl border border-white/10 bg-surface/60 hover:bg-surface text-text-muted hover:text-text-secondary flex items-center justify-between text-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search courses, quizzes, questions...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[10px] text-text-muted">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Alerts, Profile */}
      <div className="flex items-center gap-3">
        {/* System Alert Center Trigger */}
        <button
          onClick={onOpenAlerts}
          className="p-2.5 rounded-xl border border-white/10 bg-surface/60 hover:bg-white/[0.06] text-text-secondary hover:text-warning relative transition-colors"
          title="System Alert Center"
          aria-label="Open System Alerts"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-white/10 bg-surface/60 hover:bg-white/[0.06] text-text-secondary hover:text-white relative transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-card border border-white/10 p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  {unreadCount > 0 && <Badge variant="primary">{unreadCount} new</Badge>}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary-light hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-8 text-xs text-text-muted">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.linkUrl)}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer text-left ${
                        !n.isRead
                          ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                          : "bg-surface/50 border-white/5 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-text-primary">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-text-muted mt-2 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-white/10 bg-surface/60 hover:bg-white/[0.06] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-semibold text-xs shadow-glow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-text-primary leading-tight">{user.name}</span>
                <span className="text-[10px] text-text-muted font-mono">{user.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-card border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-text-primary">{user.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                  <Badge variant="primary" className="mt-2 text-[10px]">
                    {user.role} ACCESS
                  </Badge>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.06] rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile & Security</span>
                </Link>

                <div className="pt-1 border-t border-white/10 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-critical hover:bg-critical/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
