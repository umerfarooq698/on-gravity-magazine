import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/data/articles";
import { getCategoryBySlug } from "@/data/categories";
import { getAuthorSlug } from "@/data/authors";
import { Clock, ArrowUpRight, ChevronRight } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  variant?: "featured" | "standard" | "compact" | "horizontal";
}

export default function ArticleCard({ article, variant = "standard" }: ArticleCardProps) {
  const category = getCategoryBySlug(article.category);
  const articleUrl = `/${article.slug}`;

  if (variant === "featured") {
    return (
      <article className="group relative bg-slate-950 rounded-xs overflow-hidden shadow-2xl flex flex-col justify-end min-h-[440px] sm:min-h-[520px] border-b-4 border-red-600">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
            sizes="(max-width: 1200px) 100vw, 66vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10 space-y-4 text-white">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 text-xs font-black uppercase tracking-widest bg-red-600 text-white rounded-xs shadow-sm">
              {category?.name || article.category}
            </span>
            <span className="text-xs text-slate-300 flex items-center gap-1 font-semibold bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xs">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              {article.readTime}
            </span>
            <span className="text-xs text-slate-400 font-medium">• {article.publishedAt}</span>
          </div>

          <h2 className="font-sans text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white group-hover:text-red-400 transition-colors uppercase">
            <Link href={articleUrl} className="text-white hover:text-red-400">
              {article.title}
            </Link>
          </h2>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href={`/author/${getAuthorSlug(article.author.name)}`}
              className="flex items-center gap-3 group/author hover:opacity-90 transition-opacity"
            >
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={40}
                height={40}
                className="rounded-full border-2 border-red-600 object-cover"
              />
              <div>
                <div className="text-xs font-bold text-white group-hover/author:text-red-400 transition-colors">
                  {article.author.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{article.author.role}</div>
              </div>
            </Link>

            <Link
              href={articleUrl}
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 transition-all px-4 py-2 rounded-xs shadow-md"
            >
              FULL STORY
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xs bg-white dark:bg-slate-900 border-l-4 border-red-600 border-y border-r border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg">
        <div className="relative w-full sm:w-48 h-44 sm:h-auto rounded-xs overflow-hidden shrink-0">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, 200px"
          />
        </div>

        <div className="flex flex-col justify-between space-y-2 flex-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-xs">
                {category?.name || article.category}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3 text-red-600" />
                {article.readTime}
              </span>
            </div>

            <h3 className="font-sans text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-snug uppercase">
              <Link href={articleUrl}>{article.title}</Link>
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <Link
              href={`/author/${getAuthorSlug(article.author.name)}`}
              className="font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
            >
              By {article.author.name}
            </Link>
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-xs overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-red-600 dark:hover:border-red-600 transition-all hover:shadow-xl border-t-2 border-t-red-600">
      <div className="relative w-full aspect-16/10 overflow-hidden">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2">
          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white shadow-md rounded-xs">
            {category?.name || article.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-600" />
              {article.readTime}
            </span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>

          <h3 className="font-sans text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors leading-snug uppercase">
            <Link href={articleUrl}>{article.title}</Link>
          </h3>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <Link
            href={`/author/${getAuthorSlug(article.author.name)}`}
            className="flex items-center gap-2 group/author hover:text-red-600 dark:hover:text-red-500 transition-colors"
          >
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={24}
              height={24}
              className="rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
            <span className="font-bold text-slate-800 dark:text-slate-200 group-hover/author:text-red-600 dark:group-hover/author:text-red-500">
              {article.author.name}
            </span>
          </Link>

          <Link
            href={articleUrl}
            className="text-red-600 dark:text-red-500 font-black uppercase text-[11px] hover:underline flex items-center gap-0.5 tracking-wider"
          >
            READ
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
