"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { CATEGORIES } from "@/data/categories";
import Logo from "@/components/Logo";
import { Search, Sun, Moon, Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayDate = "Tuesday, Sept 8, 2026";

  const PAGE_LINKS = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Auto-Blog Admin", href: "/admin/auto-blog" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Cookie Policy", href: "/cookie-policy" },
  ];

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
              href="/on-gravity-magazine/ai-generative-revolution-2026"
              className="hover:underline text-zinc-200 truncate max-w-xs sm:max-w-md transition-colors"
            >
              The Next Frontier of AI: Autonomous Agents Reshaping Workflows
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/auto-blog"
              className="text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-all px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 hidden sm:inline-block"
            >
              Auto-Blog Admin
            </Link>
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
      <div className="py-5 px-4 sm:px-8 border-b border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center mx-auto lg:mx-0 text-center">
            <Logo size="md" />
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

      {/* 2-Tier Navigation Bar */}
      <nav className="hidden lg:block bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-1 py-1">
          {/* Row 1: Categories Bar */}
          <div className="flex items-center space-x-1 font-sans text-xs font-semibold tracking-wide whitespace-nowrap overflow-x-auto">
            <Link
              href="/"
              className={`py-2 px-3 border-b-2 transition-colors ${
                pathname === "/"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                  : "border-transparent text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
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
                  className={`py-2 px-3 border-b-2 transition-colors ${
                    isActive
                      ? "border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                      : "border-transparent text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Row 2: Pages Row Directly Below Categories */}
          <div className="flex items-center space-x-1 font-sans text-[11px] font-medium tracking-wide whitespace-nowrap overflow-x-auto pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
            {PAGE_LINKS.map((page) => {
              const isActive = pathname === page.href;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`py-1 px-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {page.name}
                </Link>
              );
            })}
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
              Pages
            </div>
            {PAGE_LINKS.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
