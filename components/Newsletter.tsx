"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, Sparkles } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="w-full my-16 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-zinc-800">
      {/* Decorative accent background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          The On Gravity Dispatch
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          Thoughtful Stories Delivered to Your Inbox Every Morning
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Join over 45,000 curious minds who receive our curated selection of breaking news, tech developments, lifestyle essays, and cultural analyses.
        </p>

        {subscribed ? (
          <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="font-medium text-sm sm:text-base">
              Welcome aboard! Check your inbox shortly for your confirmation dispatch.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-amber-400 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95"
            >
              Subscribe Free
            </button>
          </form>
        )}

        <p className="text-[11px] text-zinc-500">
          No spam ever. Unsubscribe with a single click at any time.
        </p>
      </div>
    </section>
  );
}
