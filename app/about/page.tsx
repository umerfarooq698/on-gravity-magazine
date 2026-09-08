import React from "react";
import Image from "next/image";
import Link from "next/link";
import Newsletter from "@/components/Newsletter";
import { Sparkles, Target, Award, Users, Globe2 } from "lucide-react";

export const metadata = {
  title: "About Us | On Gravity Magazine",
  description: "Learn about the mission, editorial standards, and team behind On Gravity Magazine.",
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Our Story & Mission
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-black text-zinc-900 dark:text-white tracking-tight">
          About On Gravity Magazine
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          On Gravity Magazine is an independent publication dedicated to delivering deep, thoughtful, and captivating stories across culture, technology, lifestyle, health, business, news, and gastronomy.
        </p>
      </section>

      {/* Hero Image */}
      <div className="relative w-full aspect-21/9 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <Image
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80"
          alt="On Gravity Newsroom and Editorial"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex items-end p-8">
          <span className="text-white font-serif text-lg font-bold">
            "Journalism with substance, integrity, and timeless clarity."
          </span>
        </div>
      </div>

      {/* Core Values Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">
            What Drives Us
          </h2>
          <p className="text-xs text-zinc-500">Pillars of our editorial independence</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
              Uncompromising Integrity
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every story undergoes rigorous fact-checking and editorial verification before publication.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
              Global Perspectives
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We connect local stories with overarching global trends, giving readers a comprehensive viewpoint.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
              Reader-Centric Design
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Clean typography, distraction-free reading, and fast performance across every screen size.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Categories */}
      <section className="bg-zinc-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight">
          7 Dedicated Editorial Desks
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          From red carpet moments in Celebrity to deep tech insights, wellness guides, economic analysis, breaking news, and food culture—our specialized desks bring you nuanced coverage daily.
        </p>

        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-amber-400">
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ Celebrity Desk</div>
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ Life Style Desk</div>
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ Tech Desk</div>
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ Health Desk</div>
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ Business Desk</div>
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ News Desk</div>
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ Food Desk</div>
          <div className="p-3 bg-zinc-800/80 rounded-xl">✦ Features Desk</div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
