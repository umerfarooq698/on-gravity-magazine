import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-10 h-10 sm:w-11 sm:h-11",
    lg: "w-14 h-14 sm:w-16 sm:h-16",
  };

  const titleSizes = {
    sm: "text-base tracking-tight",
    md: "text-2xl sm:text-3xl tracking-tight",
    lg: "text-3xl sm:text-5xl tracking-tight",
  };

  const subtitleSizes = {
    sm: "text-[8px] tracking-[0.3em]",
    md: "text-[10px] sm:text-[11px] tracking-[0.4em]",
    lg: "text-xs sm:text-sm tracking-[0.45em]",
  };

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Editorial Gravitational Emblem */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 filter drop-shadow-sm"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="30%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id="coreLight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#7C2D12" />
            </radialGradient>
          </defs>

          <circle cx="60" cy="60" r="54" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
          <ellipse cx="60" cy="60" rx="50" ry="18" stroke="url(#orbitGlow)" strokeWidth="4" strokeLinecap="round" transform="rotate(-30 60 60)" />
          <ellipse cx="60" cy="60" rx="50" ry="18" stroke="url(#goldGrad)" strokeWidth="3" strokeDasharray="14 10" strokeLinecap="round" transform="rotate(40 60 60)" />
          <circle cx="60" cy="60" r="22" fill="url(#coreLight)" />
          <path d="M68 49C65 44 59.5 42 53 45C44.5 49 42 60 46 68C50 76 60.5 77 68 72C73 68.5 75 62 74.5 56.5H54" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M86 34 L88 26 L90 34 L98 36 L90 38 L88 46 L86 38 L78 36 Z" fill="url(#goldGrad)" />
        </svg>
      </div>

      {/* Publication Masthead Title */}
      <div className="flex flex-col text-left">
        <span className={`font-serif font-black text-zinc-900 dark:text-white leading-none ${titleSizes[size]}`}>
          ON GRAVITY
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="h-[1px] w-3 bg-amber-500/80" />
          <span className={`font-sans uppercase font-extrabold text-amber-600 dark:text-amber-400 leading-none ${subtitleSizes[size]}`}>
            MAGAZINE
          </span>
          <span className="h-[1px] w-3 bg-amber-500/80" />
        </div>
      </div>
    </div>
  );
}
