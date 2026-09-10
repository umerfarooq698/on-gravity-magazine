import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const titleSizes = {
    sm: "text-lg tracking-tighter font-black",
    md: "text-2xl sm:text-3xl tracking-tighter font-black",
    lg: "text-3xl sm:text-5xl tracking-tighter font-black",
  };

  const badgeSizes = {
    sm: "text-[9px] px-1.5 py-0.5",
    md: "text-[11px] sm:text-xs px-2 py-0.5",
    lg: "text-xs sm:text-sm px-3 py-1",
  };

  return (
    <div className={`flex items-center gap-2 select-none group ${className}`}>
      {/* FOX News style red accent bar */}
      <div className="w-1.5 sm:w-2 h-7 sm:h-9 bg-red-600 rounded-xs shrink-0 group-hover:scale-y-110 transition-transform" />

      <div className="flex items-center gap-2">
        <span className={`font-sans uppercase text-slate-900 dark:text-white leading-none ${titleSizes[size]}`}>
          ON GRAVITY
        </span>
        <span className={`font-sans uppercase font-black bg-red-600 text-white rounded-sm shadow-xs leading-none tracking-widest ${badgeSizes[size]}`}>
          MAGAZINE
        </span>
      </div>
    </div>
  );
}
