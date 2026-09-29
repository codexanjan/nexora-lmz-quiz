"use client";

import React, { useState, useEffect } from "react";
import { GlobalNavbar } from "./global-navbar";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";
import { AlertDrawer } from "@/components/ui/alert-drawer";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    organizationName?: string;
  } | null;
  role?: string;
  userName?: string;
  userEmail?: string;
  organizationName?: string;
}

export function AppShell({
  children,
  user,
  role,
  userName,
  userEmail,
  organizationName,
}: AppShellProps) {
  const effectiveUser = user ?? (userName || role ? {
    id: "",
    name: userName || "User",
    email: userEmail || "",
    role: role || "STUDENT",
    organizationName: organizationName,
  } : null);

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleOpenPalette = () => setIsCommandPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpenPalette);
    return () => window.removeEventListener("open-command-palette", handleOpenPalette);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <GlobalNavbar
        user={effectiveUser as any}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar role={effectiveUser?.role} className="hidden md:flex min-h-[calc(100vh-70px)]" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        role={user?.role}
      />

      <AlertDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        canManageAlerts={user?.role === "TEACHER" || user?.role === "ADMIN"}
      />
    </div>
  );
}
