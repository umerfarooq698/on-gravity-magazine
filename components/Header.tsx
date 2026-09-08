"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { CATEGORIES } from "@/data/categories";
import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  BookOpen,
  ChevronDown
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayDate = "Tuesday, Sept 8, 2026";

  return (
    <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200 sticky top-0 z-50 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-zinc-900 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-medium text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              {todayDate}
            </span>
            <span className="hidden sm:inline text-zinc-700 dark:text-zinc-700">|</span>
            <div className="flex items-center gap-2 text-rose-400 font-semibold tracking-wide uppercase text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Breaking News:
            </div>
            <Link
              href="/article/ai-generative-revolution-2026"
              className="hover:underline text-zinc-200 truncate max-w-xs sm:max-w-md transition-colors"
            >
              The Next Frontier of AI: Autonomous Agents Reshaping Workflows
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline">Search</span>
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
                title="Toggle Light/Dark Theme"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Logo Branding Area */}
      <div className="py-6 px-4 sm:px-8 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex flex-col items-center mx-auto lg:mx-0 text-center group">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500 transform group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                ON GRAVITY
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-sans tracking-[0.35em] text-zinc-500 dark:text-zinc-400 uppercase font-bold mt-1">
              INDEPENDENT GENERAL MAGAZINE & JOURNAL
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-full text-xs font-semibold transition-all"
            >
              <Search className="w-4 h-4 text-zinc-500" />
              Search Articles...
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Categories Navigation Desktop */}
      <nav className="hidden lg:block bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-1 font-sans text-sm font-semibold tracking-wide">
            <Link
              href="/"
              className={`py-3.5 px-4 border-b-2 transition-colors ${
                pathname === "/"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Home
            </Link>

            {CATEGORIES.map((cat) => {
              const isActive = pathname === `/category/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`py-3.5 px-3.5 border-b-2 transition-colors ${
                    isActive
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Pages Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPagesDropdownOpen(!pagesDropdownOpen)}
              onBlur={() => setTimeout(() => setPagesDropdownOpen(false), 200)}
              className="flex items-center gap-1 py-3.5 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Pages
              <ChevronDown className={`w-4 h-4 transition-transform ${pagesDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {pagesDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <Link
                  href="/about"
                  className="block px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Contact Us
                </Link>
                <Link
                  href="/privacy-policy"
                  className="block px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/cookie-policy"
                  className="block px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cookie Policy
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="font-semibold text-xs text-zinc-400 uppercase tracking-widest px-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
            >
              Home
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="font-semibold text-xs text-zinc-400 uppercase tracking-widest px-2">
              Information & Company
            </div>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Contact Us
            </Link>
            <Link
              href="/privacy-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookie-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
