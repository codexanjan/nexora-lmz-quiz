"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  HelpCircle,
  FileCheck2,
  GraduationCap,
  Activity,
  TrendingUp,
  Layers,
  BarChart3,
  Users,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  role?: string;
}

export function CommandPalette({ isOpen, onClose, role = "STUDENT" }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent("open-command-palette"));
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const allItems = [
    // General
    { label: "Go to Dashboard", href: role === "STUDENT" ? "/student/dashboard" : role === "TEACHER" ? "/teacher/dashboard" : "/admin/overview", icon: Layers, roles: ["STUDENT", "TEACHER", "ADMIN"] },
    { label: "My Profile & Sessions", href: "/profile", icon: Users, roles: ["STUDENT", "TEACHER", "ADMIN"] },
    
    // Student
    { label: "Browse Enrolled Courses", href: "/student/courses", icon: BookOpen, roles: ["STUDENT"] },
    { label: "Upcoming & Active Quizzes", href: "/student/quizzes", icon: HelpCircle, roles: ["STUDENT"] },
    { label: "Assessment Results & Feedback", href: "/student/results", icon: FileCheck2, roles: ["STUDENT"] },
    { label: "Learning Pulse™ & ReviewLoop™", href: "/student/learning-pulse", icon: Activity, roles: ["STUDENT"] },

    // Teacher
    { label: "Manage Courses", href: "/teacher/courses", icon: BookOpen, roles: ["TEACHER", "ADMIN"] },
    { label: "Create New Course", href: "/teacher/courses/new", icon: BookOpen, roles: ["TEACHER", "ADMIN"] },
    { label: "Question Bank & Tags", href: "/teacher/question-bank", icon: HelpCircle, roles: ["TEACHER", "ADMIN"] },
    { label: "Quiz Builder & Versions", href: "/teacher/quizzes", icon: FileCheck2, roles: ["TEACHER", "ADMIN"] },
    { label: "Submissions & Grading Queue", href: "/teacher/submissions", icon: GraduationCap, roles: ["TEACHER", "ADMIN"] },
    { label: "Course Gradebook & CSV Export", href: "/teacher/gradebook", icon: BarChart3, roles: ["TEACHER", "ADMIN"] },
    { label: "Class Pulse & GapMap™ Analytics", href: "/teacher/reports", icon: TrendingUp, roles: ["TEACHER", "ADMIN"] },

    // Admin
    { label: "User Management & Role Assignment", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
    { label: "System Health & Diagnostics", href: "/admin/health", icon: ShieldAlert, roles: ["ADMIN"] },
    { label: "Audit Log & Security Trail", href: "/admin/audit-log", icon: Layers, roles: ["ADMIN"] },
  ];

  const filteredItems = allItems
    .filter((item) => item.roles.includes(role))
    .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-deep/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 w-full max-w-xl rounded-2xl glass-card border border-white/10 p-4 shadow-2xl overflow-hidden"
          >
            <div className="relative flex items-center border-b border-white/10 pb-3 mb-3">
              <Search className="w-5 h-5 text-text-muted mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search actions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <span className="text-[10px] text-text-muted bg-white/[0.06] px-2 py-0.5 rounded border border-white/10">
                ESC to close
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-text-muted">No commands found for &quot;{query}&quot;</div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-surface border border-white/10 text-primary-light group-hover:text-primary transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-text-primary group-hover:text-white">
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
