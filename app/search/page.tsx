"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ARTICLES, searchArticles } from "@/data/articles";
import { CATEGORIES } from "@/data/categories";
import ArticleCard from "@/components/ArticleCard";
import { Search, X, Filter, Sparkles } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  let results = query.trim() ? searchArticles(query) : ARTICLES;

  if (selectedCategory !== "all") {
    results = results.filter((a) => a.category === selectedCategory);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header & Search Bar */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-8 sm:p-12 border border-zinc-200/80 dark:border-zinc-800 space-y-6">
        <div className="space-y-2 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Archive & Search
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Search On Gravity Articles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Search across titles, keywords, authors, tags, and categories
          </p>
        </div>

        {/* Input box */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type keywords (e.g. AI, Hollywood, Longevity, Markets)..."
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base focus:outline-none focus:border-amber-500 shadow-md text-zinc-900 dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-4 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950"
                : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.slug
                  ? "bg-amber-500 text-zinc-950"
                  : "bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <span>
          Showing {results.length} {results.length === 1 ? "result" : "results"}
          {query && ` for "${query}"`}
        </span>
        {selectedCategory !== "all" && (
          <span className="uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
            Category: {selectedCategory}
          </span>
        )}
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
          <Search className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-zinc-800 dark:text-zinc-200">
            No matching articles found
          </h3>
          <p className="text-xs text-zinc-500">
            Try adjusting your search keywords or switching category filters.
          </p>
        </div>
      )}
    </div>
  );
}
