import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Target, Award, Users, Globe2, ShieldCheck, FileCheck, Landmark } from "lucide-react";
import { formatMetaDescription } from "@/lib/meta";

export const metadata = {
  title: "About Us | Editorial Standards & Mission",
  description: formatMetaDescription("Learn about the mission, editorial standards, journalism values, and executive team behind On Gravity Magazine."),
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Our Story and Mission
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
          About On Gravity Magazine
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          On Gravity Magazine is an independent international publication dedicated to delivering deep, thoughtful, and captivating stories across culture, technology, lifestyle, health, business, global news, and culinary arts.
        </p>
      </section>

      {/* Hero Image */}
      <div className="relative w-full aspect-21/9 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <Image
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=80"
          alt="On Gravity Newsroom and Editorial Desk"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-8">
          <span className="text-white font-serif text-lg font-bold">
            "Journalism with substance, integrity, and timeless clarity."
          </span>
        </div>
      </div>

      {/* Deep Editorial Overview */}
      <section className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Our Editorial Philosophy
        </h2>
        <p>
          Founded with a commitment to modern journalistic excellence, On Gravity Magazine brings together expert commentators, investigative writers, and industry analysts. We operate with complete independence from commercial bias, ensuring that our reporting remains objective, accurate, and valuable for curious minds across the globe.
        </p>
        <p>
          In an era of superficial headlines and algorithmic noise, we prioritize depth, accuracy, and structured analytical reporting. Whether covering breaking developments in artificial intelligence, evaluating modern home architectural trends, or profiling leading pop culture icons, our newsroom enforces strict editorial standards before any article reaches publication.
        </p>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-4">
          Fact Checking and Editorial Rigor
        </h3>
        <p>
          Every report published on On Gravity Magazine undergoes multi-tier editorial review. Our research team verifies primary data sources, cross-references official statements, and consults accredited domain specialists. We hold ourselves accountable to our readership by maintaining full transparency in our sourcing and correcting any factual errors promptly.
        </p>
      </section>

      {/* Core Values Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
            Pillars of Our Newsroom
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Guiding principles across all desks</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Uncompromising Integrity
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every story undergoes rigorous fact checking and editorial verification before publication without commercial influence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Global Perspectives
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We connect regional developments with broader international trends, offering our readership a balanced perspective.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Reader Centric Excellence
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Clean typography, distraction free reading experiences, and lightning fast performance across mobile and desktop.
            </p>
          </div>
        </div>
      </section>

      {/* Specialized Editorial Desks */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight">
          Dedicated Editorial Desks
        </h2>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
          From red carpet moments in Celebrity to deep tech insights, wellness guides, economic analysis, breaking news, and culinary culture, our specialized desks bring you structured coverage daily.
        </p>

        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-red-400">
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ Celebrity Desk</div>
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ Life Style Desk</div>
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ Tech Desk</div>
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ Health Desk</div>
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ Business Desk</div>
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ News Desk</div>
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ Food Desk</div>
          <div className="p-3 bg-slate-800/80 rounded-xl">✦ Features Desk</div>
        </div>
      </section>

      {/* Ethics & Accountability */}
      <section className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <Landmark className="w-6 h-6" />
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Ethics and Corrections Policy
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          We maintain an open-door policy regarding editorial feedback and factual clarifications. If you discover a discrepancy or wish to submit an editorial inquiry, reach out directly to our editorial board via our <Link href="/contact" className="text-red-600 underline font-bold">Contact Page</Link>.
        </p>
      </section>
    </div>
  );
}
