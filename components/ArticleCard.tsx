import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/data/articles";
import { getCategoryBySlug } from "@/data/categories";
import { Clock, ArrowUpRight } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  variant?: "featured" | "standard" | "compact" | "horizontal";
}

export default function ArticleCard({ article, variant = "standard" }: ArticleCardProps) {
  const category = getCategoryBySlug(article.category);
  const articleUrl = `/${article.slug}`;

  if (variant === "featured") {
    return (
      <article className="group relative bg-zinc-900 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-end min-h-[420px] sm:min-h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-80"
            sizes="(max-width: 1200px) 100vw, 66vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10 space-y-4 text-white">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                category?.bgLight || "bg-amber-500 text-zinc-950"
              }`}
            >
              {category?.name || article.category}
            </span>
            <span className="text-xs text-zinc-300 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
            <span className="text-xs text-zinc-400">• {article.publishedAt}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight leading-tight group-hover:text-amber-400 transition-colors">
            <Link href={articleUrl}>
              {article.title}
            </Link>
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base line-clamp-2 max-w-2xl leading-relaxed">
            {article.excerpt}
          </p>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={36}
                height={36}
                className="rounded-full border border-white/20 object-cover"
              />
              <div>
                <div className="text-xs font-semibold text-white">{article.author.name}</div>
                <div className="text-[10px] text-zinc-400">{article.author.role}</div>
              </div>
            </div>

            <Link
              href={articleUrl}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-xs"
            >
              Read Article
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-md">
        <div className="relative w-full sm:w-48 h-44 sm:h-auto rounded-xl overflow-hidden shrink-0">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, 200px"
          />
        </div>

        <div className="flex flex-col justify-between space-y-2 flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md ${
                  category?.bgLight || "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {category?.name || article.category}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
              <Link href={articleUrl}>{article.title}</Link>
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-2">
            <span>By {article.author.name}</span>
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-lg">
      <div className="relative w-full aspect-16/10 overflow-hidden">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md shadow-xs ${
              category?.bgLight || "bg-zinc-900 text-white"
            }`}
          >
            {category?.name || article.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>

          <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
            <Link href={articleUrl}>{article.title}</Link>
          </h3>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {article.author.name}
            </span>
          </div>

          <Link
            href={articleUrl}
            className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}
