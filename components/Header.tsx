"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ARTICLES, Article } from "@/data/articles";
import { CATEGORIES } from "@/data/categories";
import { getCustomArticlesFromStorage } from "@/lib/clientStorage";
import Logo from "@/components/Logo";
import { Search, Sun, Moon, Menu, X, Radio, ChevronRight, ChevronLeft } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [breakingArticles, setBreakingArticles] = useState<Article[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    const loadArticles = () => {
      const custom = getCustomArticlesFromStorage();
      const combined = [...custom, ...ARTICLES];
      const map = new Map<string, Article>();
      combined.forEach((art) => {
        if (art && art.slug && !map.has(art.slug)) {
          map.set(art.slug, art);
        }
      });
      const top6 = Array.from(map.values()).slice(0, 6);
      setBreakingArticles(top6);
    };

    loadArticles();

    const handleUpdate = () => loadArticles();
    window.addEventListener("og_articles_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("og_articles_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (breakingArticles.length <= 1) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [breakingArticles]);

  const todayDate = "Friday, Sept 11, 2026";
  const currentArticle = breakingArticles[tickerIndex] || ARTICLES[0];

  return (
    <header className="w-full transition-colors duration-200 sticky top-0 z-50 shadow-md">
      {/* FOX News Style Top Utility Bar */}
      <div className="bg-[#001933] text-slate-200 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <span className="font-semibold text-slate-300 hidden sm:inline uppercase text-[11px] tracking-wider shrink-0">
              {todayDate}
            </span>
            <span className="hidden sm:inline text-slate-600 shrink-0">|</span>
            <div className="flex items-center gap-1.5 bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-xs uppercase text-[10px] tracking-widest shrink-0">
              <Radio className="w-3 h-3 animate-pulse" />
              BREAKING
            </div>
            
            {/* Dynamic Rotating Top 6 Articles Ticker */}
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <Link
                key={currentArticle?.id || tickerIndex}
                href={`/${currentArticle?.slug || ''}`}
                className="hover:underline text-white font-semibold truncate max-w-xs sm:max-w-xl transition-all duration-500 animate-fade-in block"
              >
                {currentArticle?.title}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/search"
              aria-label="Search articles and news"
              className="flex items-center gap-1 hover:text-red-400 transition-colors font-bold uppercase text-[11px] tracking-wider"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Search</span>
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-400" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FOX News Main Logo Banner */}
      <div className="py-4 px-4 sm:px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-red-600" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center mx-auto lg:mx-0">
            <Logo size="md" />
          </Link>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xs text-xs font-bold transition-all hover:border-red-600"
            >
              <Search className="w-4 h-4 text-red-600" />
              SEARCH NEWS...
            </Link>
          </div>
        </div>
      </div>

      {/* FOX News Navy Navigation Bar */}
      <nav className="hidden lg:block bg-[#002b49] dark:bg-slate-900 border-t-2 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center space-x-1 font-sans text-xs font-black uppercase tracking-wider text-white whitespace-nowrap overflow-x-auto">
            <Link
              href="/"
              className={`py-3 px-4 transition-all hover:bg-red-600 ${
                pathname === "/" ? "bg-red-600 text-white font-black" : "text-white"
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
                  className={`py-3 px-4 transition-all hover:bg-red-600 ${
                    isActive ? "bg-red-600 text-white font-black" : "text-white opacity-90 hover:opacity-100"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b-2 border-red-600 bg-[#002b49] text-white px-4 py-6 space-y-4">
          <div className="font-black text-xs text-red-400 uppercase tracking-widest px-2 border-b border-slate-700 pb-2">
            NEWS SECTIONS
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded font-black text-sm uppercase hover:bg-red-600 text-white"
            >
              Home
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded font-bold text-xs uppercase hover:bg-red-600 text-slate-100"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
