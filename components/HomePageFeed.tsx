"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/data/articles";
import { CATEGORIES } from "@/data/categories";
import { getCustomArticlesFromStorage } from "@/lib/clientStorage";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import { Flame, TrendingUp, Sparkles, ArrowRight, BookOpen } from "lucide-react";

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

  const recentArticles = allArticles.slice(0, 12);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-16">
      {/* Category Pills Header */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-100 dark:border-zinc-900">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Explore Topics:
        </span>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${cat.bgLight} hover:scale-105`}
          >
            {cat.name}
          </Link>
        ))}
      </section>

      {/* Hero Showcase Grid */}
      {heroMain && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h2 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Cover Stories & Highlights
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-medium">Updated Daily</span>
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

      {/* Trending News Bar */}
      {trendingArticles.length > 0 && (
        <section className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-amber-300">
              Trending Across On Gravity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingArticles.slice(0, 3).map((item, idx) => (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className="group flex gap-4 items-start"
              >
                <span className="font-serif text-3xl font-black text-amber-500/40 group-hover:text-amber-500 transition-colors">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
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

      {/* Latest Articles Stream */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h2 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Latest Dispatches & Essays
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            View All Articles
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentArticles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      </section>

      {/* Categories Spotlight */}
      <section className="space-y-10">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Explore By Edition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.slice(0, 4).map((cat) => {
            const catArticles = allArticles.filter((a) => a.category === cat.slug);
            return (
              <div
                key={cat.id}
                className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-colors"
              >
                <div className="space-y-2">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${cat.bgLight}`}
                  >
                    {cat.name}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                    {cat.name} Edition
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">{catArticles.length} Articles</span>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Browse Category →
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
