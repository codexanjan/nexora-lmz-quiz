"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
  isSuccess?: boolean;
  successText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      isSuccess = false,
      successText,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0 justify-center",
    };

    const variantStyles = {
      primary:
        "bg-primary hover:bg-primary-hover text-white shadow-glow-sm hover:shadow-glow border border-primary-light/30",
      secondary:
        "bg-secondary hover:bg-secondary-hover text-deep font-semibold shadow-glow-cyan/20 border border-secondary/30",
      outline:
        "border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-text-primary hover:border-white/20",
      ghost: "hover:bg-white/[0.06] text-text-secondary hover:text-text-primary",
      danger:
        "bg-critical/20 hover:bg-critical/30 text-critical border border-critical/30 hover:border-critical/50",
      success:
        "bg-success/20 hover:bg-success/30 text-success border border-success/30 hover:border-success/50",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText || "Processing..."}</span>
          </>
        ) : isSuccess ? (
          <>
            <span>✓</span>
            <span>{successText || "Completed"}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
