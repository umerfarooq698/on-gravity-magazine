import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "auto";
  className?: string;
  showIcon?: boolean;
}

export default function Logo({
  size = "md",
  variant = "auto",
  className = "",
  showIcon = true,
}: LogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8 sm:w-9 sm:h-9",
    lg: "w-11 h-11 sm:w-14 sm:h-14",
  };

  const titleSizes = {
    sm: "text-base tracking-tighter font-black",
    md: "text-xl sm:text-2xl lg:text-3xl tracking-tighter font-black",
    lg: "text-3xl sm:text-4xl lg:text-5xl tracking-tighter font-black",
  };

  const badgeSizes = {
    sm: "text-[9px] px-1.5 py-0.5 font-extrabold tracking-widest",
    md: "text-[10px] sm:text-[11px] px-2 py-0.5 font-black tracking-widest",
    lg: "text-xs sm:text-sm px-3 py-1 font-black tracking-widest",
  };

  const textColors = {
    auto: "text-slate-900 dark:text-white",
    light: "text-white",
    dark: "text-slate-900",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none group ${className}`}>
      {showIcon && (
        <div className={`relative shrink-0 ${iconSizes[size]} group-hover:scale-105 transition-transform duration-300`}>
          {/* Emblem Badge Icon */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Outer Red Border Shield */}
            <rect width="100" height="100" rx="18" fill="#DC2626" />
            
            {/* Dark Navy Inner Box */}
            <rect x="7" y="7" width="86" height="86" rx="13" fill="#001933" />
            
            {/* Red Gravity Orbital Ring */}
            <path
              d="M 22 50 C 22 30, 78 30, 78 50 C 78 70, 22 70, 22 50 Z"
              stroke="#DC2626"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Bold White 'G' Monogram */}
            <path
              d="M 68 38 C 62 30, 42 30, 36 42 C 28 54, 34 70, 52 70 C 65 70, 68 60, 68 52 L 50 52 L 50 44 L 76 44 L 76 56 C 76 72, 58 78, 44 78 C 24 78, 18 58, 26 40 C 34 22, 60 22, 74 32 Z"
              fill="#FFFFFF"
            />

            {/* Gold Star Accent */}
            <polygon points="76,22 79,29 86,29 80,33 82,40 76,35 70,40 72,33 66,29 73,29" fill="#F59E0B" />
          </svg>
        </div>
      )}

      {/* Typography Section */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`font-sans uppercase leading-none ${titleSizes[size]} ${textColors[variant]} group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors`}
        >
          ON GRAVITY
        </span>
        <span
          className={`font-sans uppercase bg-red-600 text-white rounded-xs shadow-md leading-none ${badgeSizes[size]}`}
        >
          MAGAZINE
        </span>
      </div>
    </div>
  );
}
