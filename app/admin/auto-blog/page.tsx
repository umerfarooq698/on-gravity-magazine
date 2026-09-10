"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/data/categories";
import { Article, ARTICLES } from "@/data/articles";
import { QueueItem } from "@/lib/automation";
import { getCustomArticlesFromStorage, saveCustomArticleToStorage, clearCustomArticlesFromStorage } from "@/lib/clientStorage";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  Globe,
  RotateCw,
  Zap,
  CheckCircle2,
  ExternalLink,
  Bot,
  Sliders,
  ChevronRight,
  User,
  Sparkles,
  ListOrdered,
  Search,
  BookOpen
} from "lucide-react";

export default function AutoBlogAdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "published" | "bulk" | "settings">("dashboard");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("auto");
  const [scheduleInterval, setScheduleInterval] = useState<string>("4");
  const [singleKeyword, setSingleKeyword] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [customArticles, setCustomArticles] = useState<Article[]>([]);
  const [lastPublished, setLastPublished] = useState<{ title: string; slug: string } | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/generate-article");
      const data = await res.json();
      if (data.queue) {
        setQueue(data.queue);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomArticles = () => {
    const stored = getCustomArticlesFromStorage();
    setCustomArticles(stored);
  };

  useEffect(() => {
    fetchQueue();
    loadCustomArticles();

    const handleUpdate = () => {
      loadCustomArticles();
      fetchQueue();
    };

    window.addEventListener("og_articles_updated", handleUpdate);
    return () => {
      window.removeEventListener("og_articles_updated", handleUpdate);
    };
  }, []);

  const handlePublishQueueItem = async (id: string, keyword: string) => {
    setPublishingId(id);
    setMessage(null);

    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish-item",
          id,
          existingSlugs: getCustomArticlesFromStorage().map((a) => a.slug),
        }),
      });

      const data = await res.json();
      if (data.success && data.article) {
        saveCustomArticleToStorage(data.article);
        loadCustomArticles();
        setMessage({
          text: `Published! Article for '${keyword}' generated: "${data.article.title}"`,
          type: "success",
        });
        setLastPublished({ title: data.article.title, slug: data.article.slug });
        if (data.queue) setQueue(data.queue);
        else fetchQueue();
      } else {
        setMessage({ text: data.error || "Failed to publish item", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error", type: "error" });
    } finally {
      setPublishingId(null);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordsInput.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-add",
          keywords: keywordsInput,
          category: selectedCategory === "auto" ? undefined : selectedCategory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setKeywordsInput("");
        setMessage({ text: data.message, type: "success" });
        if (data.queue) setQueue(data.queue);
      } else {
        setMessage({ text: data.error || "Failed to queue keywords", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleInstantPublishSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleKeyword.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: singleKeyword,
          category: selectedCategory === "auto" ? undefined : selectedCategory,
          existingSlugs: getCustomArticlesFromStorage().map((a) => a.slug),
        }),
      });

      const data = await res.json();
      if (data.success && data.article) {
        saveCustomArticleToStorage(data.article);
        loadCustomArticles();
        setSingleKeyword("");
        setLastPublished({ title: data.article.title, slug: data.article.slug });
        setMessage({
          text: `Published! Article generated: "${data.article.title}"`,
          type: "success",
        });
        if (data.queue) setQueue(data.queue);
        else fetchQueue();
      } else {
        setMessage({ text: data.error || "Failed to publish", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCronTriggerNow = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/cron/publish");
      const data = await res.json();
      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        fetchQueue();
      } else {
        setMessage({ text: data.error || "Cron run failed", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Combine custom articles, static articles, and queue published items
  const allPublishedArticlesMap = new Map<string, Article>();
  for (const art of [...customArticles, ...ARTICLES]) {
    if (!allPublishedArticlesMap.has(art.slug)) {
      allPublishedArticlesMap.set(art.slug, art);
    }
  }

  const allPublishedList = Array.from(allPublishedArticlesMap.values());
  const filteredPublishedList = searchQuery.trim()
    ? allPublishedList.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allPublishedList;

  const pendingCount = queue.filter((i) => i.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#f0f0f1] dark:bg-zinc-950 flex flex-col font-sans text-zinc-800 dark:text-zinc-200">
      {/* WordPress Top Admin Bar */}
      <header className="h-10 bg-[#1d2327] dark:bg-zinc-900 text-zinc-300 text-xs px-4 flex items-center justify-between border-b border-zinc-800 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 hover:text-amber-400 font-bold transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>On Gravity Magazine</span>
          </Link>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1 text-zinc-400 font-medium">
            <Bot className="w-3.5 h-3.5 text-amber-500" />
            <span>Auto-Blog WP Core 6.2</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-zinc-300 font-medium">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Howdy, Editor</span>
          </div>
          <Link
            href="/"
            className="bg-[#2271b1] hover:bg-[#135e96] text-white px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors"
          >
            View Live Site ↗
          </Link>
        </div>
      </header>

      {/* Main Admin Wrapper */}
      <div className="flex-1 flex overflow-hidden">
        {/* WordPress Classic Dark Left Sidebar */}
        <aside className="w-56 bg-[#1d2327] dark:bg-zinc-900 text-zinc-300 shrink-0 hidden md:flex flex-col justify-between p-2 select-none border-r border-zinc-800">
          <div className="space-y-1">
            <div className="p-3 mb-2 border-b border-zinc-800/80">
              <Logo size="sm" variant="light" />
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#2271b1] text-white"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Queue</span>
            </button>

            <button
              onClick={() => setActiveTab("published")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === "published"
                  ? "bg-[#2271b1] text-white"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Published Articles</span>
              </div>
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] rounded font-bold">
                {allPublishedList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("bulk")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === "bulk"
                  ? "bg-[#2271b1] text-white"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Bulk Keywords</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === "settings"
                  ? "bg-[#2271b1] text-white"
                  : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cron & Settings</span>
            </button>

            <div className="pt-4 border-t border-zinc-800/80 text-[10px] uppercase font-bold text-zinc-500 px-3">
              Editorial Desks
            </div>

            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors"
              >
                <span>{cat.name}</span>
                <ChevronRight className="w-3 h-3 text-zinc-600" />
              </Link>
            ))}
          </div>

          <div className="p-3 bg-zinc-900/90 dark:bg-zinc-950 rounded text-[11px] text-zinc-400 border border-zinc-800">
            <div className="font-bold text-white mb-0.5">Vercel Auto-Cron</div>
            <div className="text-[10px] text-emerald-400">● System Active</div>
          </div>
        </aside>

        {/* Right WP Main Dashboard Canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-300 dark:border-zinc-800">
            <div>
              <h1 className="text-2xl font-normal text-zinc-900 dark:text-white font-sans flex items-center gap-2">
                WP Auto-Blog Dashboard
                <span className="text-xs px-2 py-0.5 bg-[#2271b1] text-white font-bold rounded">
                  v6.2 Pro
                </span>
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Manage automated article generation, published posts, keyword queues, and schedule frequencies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCronTriggerNow}
                disabled={loading}
                className="bg-[#2271b1] hover:bg-[#135e96] text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Run Next Scheduled Post Now
              </button>
            </div>
          </div>

          {/* Feedback Message Alert */}
          {message && (
            <div
              className={`p-3.5 rounded text-xs font-semibold flex items-center justify-between ${
                message.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 border-l-4 border-emerald-600 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-rose-950/60 border-l-4 border-rose-600 text-rose-900 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{message.text}</span>
              </div>
              <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
                Dismiss ✕
              </button>
            </div>
          )}

          {/* WP Dashboard Stat Meta Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs space-y-1">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Total Published Live
              </div>
              <div className="text-2xl font-bold text-emerald-600">{allPublishedList.length} Articles</div>
              <div className="text-[11px] text-zinc-400">Live on magazine site</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs space-y-1">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Pending Queue
              </div>
              <div className="text-2xl font-bold text-amber-600">{pendingCount} Keywords</div>
              <div className="text-[11px] text-zinc-400">Waiting for auto-publish</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs space-y-1">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Auto-Publish Frequency
              </div>
              <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                Every {scheduleInterval} Hours
              </div>
              <div className="text-[11px] text-zinc-400">Configured via Cron</div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs space-y-1">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                AI Article Generator
              </div>
              <div className="text-2xl font-bold text-[#2271b1]">Active & Ready</div>
              <div className="text-[11px] text-zinc-400">Gemini Structured Engine</div>
            </div>
          </div>

          {/* Instant AI Publisher Box */}
          <div className="bg-white dark:bg-zinc-900 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs overflow-hidden border-t-4 border-t-emerald-500">
            <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-3 border-b border-zinc-300 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                Instant AI Article Publisher
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ⚡ Instant Live
              </span>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-xs text-zinc-500">
                Enter any keyword below to immediately generate a full AI article (with SEO Meta Title, Description, ALT Text & Unsplash photo) and publish it live right now.
              </p>

              <form onSubmit={handleInstantPublishSingle} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Topic Keyword *
                  </label>
                  <input
                    type="text"
                    required
                    value={singleKeyword}
                    onChange={(e) => setSingleKeyword(e.target.value)}
                    placeholder="Enter topic keyword (e.g. bathtub drain, samsung tv, sleep optimization)..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-semibold"
                  >
                    <option value="auto">Auto Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {loading && !publishingId ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        Generating & Publishing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        Publish Instantly Now
                      </>
                    )}
                  </button>
                </div>
              </form>

              {lastPublished && (
                <div className="mt-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      ✓ Article Published Live Instant!
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                      {lastPublished.title}
                    </div>
                  </div>
                  <Link
                    href={`/${lastPublished.slug}`}
                    target="_blank"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold shrink-0 transition-colors inline-flex items-center gap-1 shadow-xs"
                  >
                    View Live Article ↗
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* DEDICATED SECTION: All Published Live Articles Table */}
          <div className="bg-white dark:bg-zinc-900 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs overflow-hidden space-y-2 border-t-4 border-t-[#2271b1]">
            <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-3 border-b border-zinc-300 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Published Live Articles ({filteredPublishedList.length})
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search published..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#2271b1]"
                  />
                </div>
                <button
                  onClick={loadCustomArticles}
                  className="text-xs font-semibold text-[#2271b1] hover:underline flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  Reload
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4 font-bold">Article</th>
                    <th className="py-2.5 px-4 font-bold">Category</th>
                    <th className="py-2.5 px-4 font-bold">Published Date</th>
                    <th className="py-2.5 px-4 font-bold">Read Time</th>
                    <th className="py-2.5 px-4 font-bold text-right">View Live Article</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {filteredPublishedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500 italic text-xs">
                        No published articles found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredPublishedList.map((article) => (
                      <tr key={article.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-9 rounded overflow-hidden bg-zinc-200 shrink-0">
                              <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-md">
                                {article.title}
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono truncate max-w-xs">
                                /{article.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            {article.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-xs">
                          {article.publishedAt}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 text-xs">
                          {article.readTime}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/${article.slug}`}
                            target="_blank"
                            className="bg-[#2271b1] hover:bg-[#135e96] text-white px-3 py-1 rounded text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            View Post ↗
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Keyword Queue Table & Bulk Importer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs overflow-hidden">
                <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 border-b border-zinc-300 dark:border-zinc-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Pending Keyword Queue ({queue.filter((i) => i.status === "pending").length})
                  </h2>
                  <button
                    onClick={fetchQueue}
                    className="text-xs font-semibold text-[#2271b1] hover:underline flex items-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    Refresh Queue
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4 font-bold">Status</th>
                        <th className="py-2.5 px-4 font-bold">Topic Keyword</th>
                        <th className="py-2.5 px-4 font-bold">Category</th>
                        <th className="py-2.5 px-4 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {queue.filter((i) => i.status === "pending").length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-zinc-500 italic text-xs">
                            No pending keywords in queue.
                          </td>
                        </tr>
                      ) : (
                        queue
                          .filter((i) => i.status === "pending")
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50">
                              <td className="py-2.5 px-4">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-zinc-900 dark:text-white">
                                {item.keyword}
                              </td>
                              <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-zinc-500">
                                {item.category || "General"}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <button
                                  onClick={() => handlePublishQueueItem(item.id, item.keyword)}
                                  disabled={publishingId === item.id || loading}
                                  className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-3 py-1 rounded text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                                >
                                  {publishingId === item.id ? (
                                    <>
                                      <RotateCw className="w-3 h-3 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-3 h-3 text-zinc-950 fill-zinc-950" />
                                      Publish Now
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {/* Bulk Keywords Input Box */}
              <div className="bg-white dark:bg-zinc-900 rounded border border-zinc-300 dark:border-zinc-800 shadow-2xs overflow-hidden">
                <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 border-b border-zinc-300 dark:border-zinc-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-blue-500" />
                    Bulk Keyword Queue Importer
                  </h2>
                  <span className="text-[11px] text-zinc-500">1 per line</span>
                </div>

                <div className="p-4 space-y-3">
                  <form onSubmit={handleBulkAdd} className="space-y-3">
                    <textarea
                      rows={5}
                      required
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder={`Paste multiple keywords here:\nQuantum Computing Chips 2026\nHigh Fashion Red Carpet Highlights\nGlobal Clean Energy Urban Accords\nZero-Waste Gourmet Gastronomy`}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#2271b1]"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 text-white dark:text-zinc-950 font-bold px-4 py-1.5 rounded text-xs transition-colors"
                      >
                        Add to Auto-Publish Queue
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
