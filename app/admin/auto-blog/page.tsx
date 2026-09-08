"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { QueueItem } from "@/lib/automation";
import {
  Sparkles,
  Bot,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  ListPlus,
  Zap,
  ExternalLink,
  RotateCw,
  SlidersHorizontal
} from "lucide-react";

export default function AutoBlogAdminPage() {
  const [keywordsInput, setKeywordsInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("auto");
  const [scheduleInterval, setScheduleInterval] = useState<string>("4");
  const [singleKeyword, setSingleKeyword] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetchQueue();
  }, []);

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
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSingleKeyword("");
        setMessage({
          text: `Success! Article generated & published: "${data.article.title}"`,
          type: "success",
        });
        fetchQueue();
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 rounded-3xl p-8 sm:p-12 text-white border border-zinc-800 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
          <Bot className="w-4 h-4 text-amber-400" />
          On Gravity Auto-Blogging Engine
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Content Automation Control Center
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Add bulk keywords to your publishing queue, set auto-publishing intervals (Every {scheduleInterval} Hours), or trigger instant AI article generation with one click.
        </p>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/80 border border-rose-500/40 text-rose-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message.text}
          </div>
        )}
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bulk Add & Single Publish */}
        <div className="lg:col-span-7 space-y-8">
          {/* Bulk Keyword Queue Box */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                  Add Bulk Keywords Queue
                </h3>
              </div>
              <span className="text-xs text-zinc-400 font-medium">1 keyword per line</span>
            </div>

            <form onSubmit={handleBulkAdd} className="space-y-4">
              <textarea
                rows={5}
                required
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder={`Paste keywords list here, for example:\nArtificial Intelligence in Medicine\nHollywood Met Gala Red Carpet Trends 2026\nGlobal Inflation and Federal Reserve Shifts\nZero-Waste Farm-to-Table Gourmet Food`}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-2xl p-4 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 w-full sm:w-auto">
                  <span>Target Edition:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="auto">Auto-Detect Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Queue
                </button>
              </div>
            </form>
          </div>

          {/* Instant Single Keyword Generation */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Zap className="w-5 h-5 text-rose-500" />
              <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                Instant Generate & Publish Now
              </h3>
            </div>

            <form onSubmit={handleInstantPublishSingle} className="flex gap-2">
              <input
                type="text"
                required
                value={singleKeyword}
                onChange={(e) => setSingleKeyword(e.target.value)}
                placeholder="Enter any keyword (e.g. Electric Supercars 2026)..."
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 text-white dark:text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Publish Now
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Cron Schedule Settings & Immediate Trigger */}
        <div className="lg:col-span-5 space-y-8">
          {/* Schedule Settings Box */}
          <div className="bg-zinc-50 dark:bg-zinc-900/80 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-5">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <SlidersHorizontal className="w-5 h-5 text-blue-500" />
              <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
                Auto-Publish Schedule
              </h3>
            </div>

            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              <label className="block font-bold text-zinc-800 dark:text-zinc-200">
                Select Auto-Publish Frequency:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["4", "6", "8"].map((hr) => (
                  <button
                    key={hr}
                    type="button"
                    onClick={() => setScheduleInterval(hr)}
                    className={`py-2.5 rounded-xl font-bold transition-all border text-center ${
                      scheduleInterval === hr
                        ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-md"
                        : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    Every {hr} Hours
                  </button>
                ))}
              </div>

              <div className="p-3 bg-zinc-200/60 dark:bg-zinc-950 rounded-xl space-y-1 text-[11px] font-mono text-zinc-500">
                <div className="font-bold text-zinc-700 dark:text-zinc-300">Vercel Cron Trigger Endpoint:</div>
                <div className="truncate text-amber-600 dark:text-amber-400">/api/cron/publish</div>
              </div>
            </div>

            <button
              onClick={handleCronTriggerNow}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4 fill-current" />
              Trigger Next Scheduled Article Now
            </button>
          </div>
        </div>
      </div>

      {/* Queue & Published Log Table */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
              Automation Queue & Published Logs ({queue.length})
            </h3>
          </div>
          <button
            onClick={fetchQueue}
            className="p-2 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Keyword Topic</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "published"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                    {item.keyword}
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-zinc-400">
                    {item.category || "General"}
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {item.publishedAt || item.createdAt}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.generatedArticleSlug ? (
                      <Link
                        href={`/article/${item.generatedArticleSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Read Live
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-zinc-400">In Queue</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
