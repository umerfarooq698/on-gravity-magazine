"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/data/articles";
import { CATEGORIES } from "@/data/categories";
import { getCustomArticlesFromStorage } from "@/lib/clientStorage";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import { Flame, TrendingUp, Sparkles, ArrowRight, BookOpen, Layers } from "lucide-react";

interface HomePageFeedProps {
  initialArticles: Article[];
}

export default function HomePageFeed({ initialArticles }: HomePageFeedProps) {
  const [allArticles, setAllArticles] = useState<Article[]>(initialArticles);

  const refreshArticles = () => {
    const customArticles = getCustomArticlesFromStorage();
    const map = new Map<string, Article>();
    for (const art of [...customArticles, ...initialArticles]) {
      if (!map.has(art.slug)) {
        map.set(art.slug, art);
      }
    }
    setAllArticles(Array.from(map.values()));
  };

  useEffect(() => {
    refreshArticles();

    const handleUpdate = () => refreshArticles();
    window.addEventListener("og_articles_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("og_articles_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [initialArticles]);

  const featuredArticles = allArticles.filter((a) => a.featured);
  const trendingArticles = allArticles.filter((a) => a.trending);

  const heroMain = featuredArticles[0] || allArticles[0];
  const heroSub1 = featuredArticles[1] || allArticles[1];
  const heroSub2 = featuredArticles[2] || allArticles[2];

  const recentArticles = allArticles.slice(0, 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-16">
      {/* Editorial Topics Pill Header */}
      <section className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-zinc-200 dark:border-zinc-800/80">
        <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 shrink-0 mr-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Topics Explorer:
        </span>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${cat.bgLight} hover:scale-105 hover:shadow-sm`}
          >
            {cat.name}
          </Link>
        ))}
      </section>

      {/* Hero Cover Story Grid */}
      {heroMain && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-zinc-900 dark:border-zinc-100 pb-3">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
                Cover Stories & Features
              </h2>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Daily Edition
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Large Cover Story */}
            <div className="lg:col-span-8">
              <ArticleCard article={heroMain} variant="featured" />
            </div>

            {/* Side Secondary Featured */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {heroSub1 && <ArticleCard article={heroSub1} variant="standard" />}
              {heroSub2 && <ArticleCard article={heroSub2} variant="standard" />}
            </div>
          </div>
        </section>
      )}

      {/* Trending Ranked Leaderboard Bar */}
      {trendingArticles.length > 0 && (
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-amber-950/10 dark:to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-amber-500/20 pb-3">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-serif text-xl font-bold tracking-tight text-zinc-900 dark:text-amber-300 uppercase">
              Trending Across On Gravity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingArticles.slice(0, 3).map((item, idx) => (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className="group flex gap-4 items-start p-3 rounded-xl hover:bg-amber-500/10 transition-colors"
              >
                <span className="font-serif text-4xl font-black text-amber-500/40 group-hover:text-amber-500 transition-colors shrink-0">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Dispatches Stream */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b-2 border-zinc-900 dark:border-zinc-100 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
              Latest Dispatches & Reports
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20"
          >
            View All ({allArticles.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {allArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
            <BookOpen className="w-12 h-12 text-zinc-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-zinc-800 dark:text-zinc-200">
              No Published Articles Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              All articles have been cleared. You can generate new publication-ready articles from the Auto-Blog Admin panel.
            </p>
            <Link
              href="/admin/auto-blog"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
            >
              Go to Auto-Blog Admin →
            </Link>
          </div>
        )}
      </section>

      {/* Categories Spotlight */}
      <section className="space-y-8">
        <div className="flex items-center gap-2.5 border-b-2 border-zinc-900 dark:border-zinc-100 pb-3">
          <Layers className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            Explore By Edition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.slice(0, 4).map((cat) => {
            const catArticles = allArticles.filter((a) => a.category === cat.slug);
            return (
              <div
                key={cat.id}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all hover:shadow-xl group"
              >
                <div className="space-y-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full ${cat.bgLight}`}
                  >
                    {cat.name}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {cat.name} Edition
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-semibold">{catArticles.length} Published</span>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Browse →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
