"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "mark-only" | "stacked";
  href?: string | null;
  className?: string;
  showTagline?: boolean;
}

export function AppLogo({
  size = "md",
  variant = "full",
  href = "/",
  className,
  showTagline = true,
}: AppLogoProps) {
  const sizeConfig = {
    sm: {
      mark: "w-7 h-7",
      svg: 28,
      title: "text-base tracking-tight",
      badge: "text-[9px] px-1 py-0.2",
      tagline: "text-[9px]",
      gap: "gap-2",
    },
    md: {
      mark: "w-9 h-9",
      svg: 36,
      title: "text-lg tracking-tight",
      badge: "text-[10px] px-1.5 py-0.5",
      tagline: "text-[10px]",
      gap: "gap-2.5",
    },
    lg: {
      mark: "w-12 h-12",
      svg: 48,
      title: "text-2xl tracking-tight",
      badge: "text-xs px-2 py-0.5",
      tagline: "text-xs",
      gap: "gap-3",
    },
    xl: {
      mark: "w-16 h-16",
      svg: 64,
      title: "text-3xl tracking-tight",
      badge: "text-sm px-2.5 py-1",
      tagline: "text-xs",
      gap: "gap-4",
    },
  }[size];

  const content = (
    <div
      className={cn(
        "inline-flex items-center group transition-transform duration-200 select-none",
        sizeConfig.gap,
        className
      )}
    >
      {/* Dynamic Geometric Prism Monogram Logo Mark */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105",
          sizeConfig.mark
        )}
      >
        {/* Glowing Aura Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 opacity-90 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-xl blur-sm opacity-40 group-hover:opacity-75 transition-opacity" />

        {/* Custom SVG Geometric Monogram 'N' with Facets */}
        <svg
          viewBox="0 0 100 100"
          className="relative z-10 w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nexora-left" x1="20" y1="20" x2="45" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A5F3FC" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="nexora-diag" x1="25" y1="30" x2="75" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="nexora-right" x1="55" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="nexora-glow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Left Vertical Crystal Pillar */}
          <path
            d="M22 22 L38 14 L38 68 L22 82 Z"
            fill="url(#nexora-left)"
            stroke="#67E8F9"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Left Pillar Light Facet */}
          <path
            d="M38 14 L44 26 L44 76 L38 68 Z"
            fill="#0284C7"
            opacity="0.85"
          />

          {/* Center Dynamic Dynamic Cross Connector Ribbon */}
          <path
            d="M26 30 L74 68 L68 78 L20 40 Z"
            fill="url(#nexora-diag)"
            stroke="#818CF8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Right Vertical Crystal Pillar */}
          <path
            d="M58 32 L74 18 L74 74 L58 86 Z"
            fill="url(#nexora-right)"
            stroke="#A5B4FC"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right Pillar Highlight */}
          <path
            d="M74 18 L80 28 L80 82 L74 74 Z"
            fill="#312E81"
            opacity="0.9"
          />

          {/* Core Apex Crystal Node */}
          <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="8" stroke="url(#nexora-glow)" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      {/* Wordmark Typography */}
      {variant !== "mark-only" && (
        <div className={cn("flex flex-col", variant === "stacked" && "items-center text-center")}>
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                "font-heading font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-cyan-200 transition-all",
                sizeConfig.title
              )}
            >
              NEXORA
            </span>
            <span
              className={cn(
                "font-mono font-bold uppercase rounded-md bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]",
                sizeConfig.badge
              )}
            >
              LEARN
            </span>
          </div>

          {showTagline && (
            <span
              className={cn(
                "text-slate-400 font-mono tracking-widest uppercase mt-0.5 flex items-center gap-1",
                sizeConfig.tagline
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Intelligence LMS
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
