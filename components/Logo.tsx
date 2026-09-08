import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const titleSizes = {
    sm: "text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-5xl",
  };

  const subtitleSizes = {
    sm: "text-[9px] tracking-[0.25em]",
    md: "text-[10px] sm:text-xs tracking-[0.35em]",
    lg: "text-xs sm:text-sm tracking-[0.4em]",
  };

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Gravitational Emblem Icon SVG */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300"
        >
          <defs>
            <linearGradient id="gravityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" /> {/* Amber */}
              <stop offset="50%" stopColor="#EF4444" /> {/* Red */}
              <stop offset="100%" stopColor="#8B5CF6" /> {/* Purple */}
            </linearGradient>
            <linearGradient id="ringGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Central Gravity Core Sphere */}
          <circle cx="50" cy="50" r="22" fill="url(#gravityGradient)" />
          
          {/* Gravitational Orbital Rings */}
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="16"
            stroke="url(#ringGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            transform="rotate(-25 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="16"
            stroke="url(#gravityGradient)"
            strokeWidth="3"
            strokeDasharray="12 8"
            strokeLinecap="round"
            transform="rotate(35 50 50)"
            opacity="0.85"
          />

          {/* Center Stylized 'G' Node */}
          <path
            d="M57 42C54.5 39 50 38 45 41C39 44.5 37 52 40.5 58C44 64 51 65 57 61.5C61 59 62 55 62 51H50"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span
          className={`font-serif font-black tracking-tight text-zinc-900 dark:text-white leading-none ${titleSizes[size]}`}
        >
          ON GRAVITY
        </span>
        <span
          className={`font-sans uppercase font-bold text-amber-600 dark:text-amber-400 mt-1.5 leading-none ${subtitleSizes[size]}`}
        >
          MAGAZINE
        </span>
      </div>
    </div>
  );
}
