"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FileCheck2,
  Activity,
  TrendingUp,
  Users,
  GraduationCap,
  BarChart3,
  ShieldAlert,
  Layers,
  Settings,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

interface SidebarProps {
  role?: string;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export function Sidebar({ role = "STUDENT", className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const studentNav: NavItem[] = [
    { label: t("nav.dashboard", "Dashboard"), href: "/student/dashboard", icon: LayoutDashboard },
    { label: t("nav.courses", "Courses"), href: "/student/courses", icon: BookOpen },
    { label: t("nav.quizzes", "Quizzes"), href: "/student/quizzes", icon: HelpCircle },
    { label: t("nav.results", "Results & Feedback"), href: "/student/results", icon: FileCheck2 },
    { label: t("nav.learning_pulse", "Learning Pulse™"), href: "/student/learning-pulse", icon: Activity, badge: "Pulse" },
    { label: t("nav.profile", "Profile & Security"), href: "/profile", icon: Settings },
  ];

  const teacherNav: NavItem[] = [
    { label: t("nav.dashboard", "Dashboard"), href: "/teacher/dashboard", icon: LayoutDashboard },
    { label: t("nav.courses", "Courses"), href: "/teacher/courses", icon: BookOpen },
    { label: t("nav.question_bank", "Question Bank"), href: "/teacher/question-bank", icon: HelpCircle },
    { label: t("action.build_quiz", "Quiz Builder"), href: "/teacher/quizzes", icon: Layers },
    { label: t("nav.submissions", "Grading Queue"), href: "/teacher/submissions", icon: GraduationCap, badge: "Queue" },
    { label: t("nav.gradebook", "Gradebook"), href: "/teacher/gradebook", icon: BarChart3 },
    { label: t("nav.reports", "Class Pulse & GapMap"), href: "/teacher/reports", icon: TrendingUp },
    { label: t("nav.profile", "Profile & Security"), href: "/profile", icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { label: t("nav.dashboard", "Overview"), href: "/admin/overview", icon: LayoutDashboard },
    { label: t("nav.users", "Users & Roles"), href: "/admin/users", icon: Users },
    { label: t("nav.health", "System Health"), href: "/admin/health", icon: ShieldAlert },
    { label: t("nav.audit_log", "Audit Log"), href: "/admin/audit-log", icon: Layers },
    { label: t("nav.profile", "Profile & Security"), href: "/profile", icon: Settings },
  ];

  const navItems = role === "ADMIN" ? adminNav : role === "TEACHER" ? teacherNav : studentNav;

  return (
    <aside className={cn("w-64 shrink-0 glass-panel border-r border-white/10 flex flex-col justify-between p-4", className)}>
      <div className="space-y-6">
        {/* Navigation Category Label */}
        <div className="px-3 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted font-mono">
            {role === "ADMIN" ? "Platform Administration" : role === "TEACHER" ? "Instructor Portal" : "Student Workspace"}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/student/dashboard" && item.href !== "/teacher/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-glow-sm border border-primary-light/40"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-white" : "text-text-muted group-hover:text-primary-light"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-mono",
                      isActive ? "bg-white/20 text-white" : "bg-primary/20 text-primary-light"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo / Indicator */}
      <div className="p-3 rounded-xl bg-surface/80 border border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-warning" />
          <span className="text-xs font-semibold text-text-primary">Nexora Pulse Engine</span>
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Real-time learning analytics and server-authoritative assessment integrity active.
        </p>
      </div>
    </aside>
  );
}
