"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/i18n/translations";

export function LanguageSelector({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-surface/60 hover:bg-white/[0.08] text-text-secondary hover:text-white transition-all text-xs font-medium cursor-pointer shadow-sm"
        title="Select Language"
        aria-label="Select Language"
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        {variant !== "compact" && (
          <span className="hidden sm:inline font-mono text-[11px] font-semibold text-text-primary">
            {currentLang.code.toUpperCase()}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-card border border-white/10 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="px-2.5 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-muted">
              Select Language
            </span>
            <Globe className="w-3 h-3 text-cyan-400" />
          </div>

          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-primary/20 text-white font-semibold border border-primary/30"
                      : "text-text-secondary hover:bg-white/[0.06] hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="text-xs">{lang.nativeName}</span>
                    <span className="text-[10px] text-text-muted font-mono">({lang.name})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
