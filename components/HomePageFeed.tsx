"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/data/articles";
import { CATEGORIES } from "@/data/categories";
import { getCustomArticlesFromStorage } from "@/lib/clientStorage";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import { Flame, TrendingUp, Sparkles, ArrowRight, BookOpen, Layers, Newspaper } from "lucide-react";

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
  const sideFeed = allArticles.slice(1, 6);
  const recentArticles = allArticles.slice(0, 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* FOX News Top Topics Nav Strip */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-slate-900 dark:border-slate-100">
        <span className="text-xs font-black uppercase tracking-widest text-red-600 shrink-0 mr-2 flex items-center gap-1">
          <Newspaper className="w-4 h-4 text-red-600" />
          HOT TOPICS:
        </span>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider rounded-xs transition-colors whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}
      </section>

      {/* Hero Cover Story Grid (FOX News Layout: Big Lead + Live Side Feed) */}
      {heroMain && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-4 border-red-600 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-6 bg-red-600" />
              <h2 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                TOP STORIES
              </h2>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-white bg-red-600 px-3 py-1 rounded-xs">
              LIVE NEWSROOM
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Massive Lead Story */}
            <div className="lg:col-span-8">
              <ArticleCard article={heroMain} variant="featured" />
            </div>

            {/* Side Latest News Stream Column */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-red-600 pb-2">
                <Flame className="w-4 h-4 text-red-600" />
                <h3 className="font-sans text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  LATEST HEADLINES
                </h3>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-3">
                {sideFeed.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.slug}`}
                    className="group flex gap-3 items-center pt-3 first:pt-0"
                  >
                    <div className="relative w-20 h-16 rounded-xs overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-widest">
                        <span>• {item.publishedAt}</span>
                        <span className="text-slate-400 font-semibold">• {item.category}</span>
                      </div>
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-snug line-clamp-2 uppercase">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Ranked Leaderboard Bar */}
      {trendingArticles.length > 0 && (
        <section className="bg-slate-900 text-white p-6 sm:p-8 space-y-4 border-l-4 border-red-600">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h3 className="font-sans text-xl font-black tracking-tight text-white uppercase">
              MUST READ STORIES
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingArticles.slice(0, 3).map((item, idx) => (
              <Link
                key={item.id}
                href={`/${item.slug}`}
                className="group flex gap-3 items-start p-3 bg-slate-800/60 hover:bg-red-600 transition-colors rounded-xs"
              >
                <span className="font-sans text-3xl font-black text-red-500 group-hover:text-white transition-colors shrink-0">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 uppercase">
                    {item.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Dispatches Stream */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-4 border-red-600 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-6 bg-red-600" />
            <h2 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              NATIONAL & WORLD COVERAGE
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-xs transition-colors flex items-center gap-1 shadow-sm"
          >
            VIEW ALL ({allArticles.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {allArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-xs border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-sans text-xl font-black uppercase text-slate-800 dark:text-slate-200">
              No Published Articles Found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All articles have been cleared. You can generate new publication-ready articles from the Auto-Blog Admin panel.
            </p>
            <Link
              href="/admin/auto-blog"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs px-6 py-3 rounded-xs shadow-md"
            >
              Go to Auto-Blog Admin →
            </Link>
          </div>
        )}
      </section>

      {/* Categories Spotlight */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b-4 border-red-600 pb-2">
          <span className="w-3 h-6 bg-red-600" />
          <h2 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            CATEGORIES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.slice(0, 4).map((cat) => {
            const catArticles = allArticles.filter((a) => a.category === cat.slug);
            return (
              <div
                key={cat.id}
                className="p-5 bg-white dark:bg-slate-900 border-t-4 border-t-red-600 border-x border-b border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all group"
              >
                <div className="space-y-2">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-xs">
                    {cat.name}
                  </span>
                  <h3 className="font-sans text-lg font-black uppercase text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                    {cat.name} Desk
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">{catArticles.length} STORIES</span>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="font-black uppercase text-[11px] text-red-600 hover:underline flex items-center gap-1 tracking-wider"
                  >
                    READ →
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
