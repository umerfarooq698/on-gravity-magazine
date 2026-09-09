import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArticleBySlug, ARTICLES } from "@/data/articles";
import { getCategoryBySlug } from "@/data/categories";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Tag,
  Sparkles,
  HelpCircle
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

import { formatMetaDescription } from "@/lib/meta";

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  const title = (article.metaTitle || `${article.title} | On Gravity Magazine`).replace(/&/g, "and");
  const description = formatMetaDescription(article.metaDescription || article.excerpt);
  return {
    title,
    description,
  };
}

export async function generateStaticParams() {
  return ARTICLES.map((art) => ({
    slug: art.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = getCategoryBySlug(article.category);
  const relatedArticles = ARTICLES.filter(
    (a) => a.category === article.category && a.id !== article.id
  ).slice(0, 3);

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
        <Link
          href="/"
          className="hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          Back to Home
        </Link>

        {category && (
          <Link
            href={`/category/${category.slug}`}
            className={`px-3 py-1 rounded-full uppercase tracking-wider font-bold text-[11px] ${category.bgLight}`}
          >
            {category.name}
          </Link>
        )}
      </div>

      {/* Article Title Header */}
      <header className="space-y-6">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.15]">
          {article.title.replace(/&/g, "and")}
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed border-l-4 border-amber-500 pl-4 py-1 italic">
          {article.excerpt.replace(/&/g, "and")}
        </p>

        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={44}
              height={44}
              className="rounded-full object-cover border border-zinc-300 dark:border-zinc-700"
            />
            <div>
              <div className="font-bold text-zinc-900 dark:text-white text-sm">
                {article.author.name}
              </div>
              <div className="text-zinc-500 text-[11px]">{article.author.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-zinc-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime}
            </span>
          </div>
        </div>
      </header>

      {/* Main Cover Image */}
      <div className="space-y-2">
        <div className="relative w-full aspect-16/9 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-800">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt || article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
        {article.imageCaption && (
          <p className="text-center text-xs text-zinc-500 italic pt-1">
            {article.imageCaption.replace(/&/g, "and")}
          </p>
        )}
      </div>

      {/* Reading Body */}
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 font-serif text-zinc-800 dark:text-zinc-200 text-lg leading-relaxed">
        {article.content.map((item, index) => {
          const trimmed = item.trim();
          if (trimmed.startsWith("## ")) {
            const headingText = trimmed.replace(/^##\s+/, "").replace(/&/g, "and");
            return (
              <h2
                key={index}
                className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white pt-8 pb-3 border-b border-zinc-200 dark:border-zinc-800 mt-8 mb-4 tracking-tight"
              >
                {headingText}
              </h2>
            );
          }
          if (trimmed.startsWith("### ")) {
            const headingText = trimmed.replace(/^###\s+/, "").replace(/&/g, "and");
            return (
              <h3
                key={index}
                className="font-serif text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 pt-6 pb-2 mt-6 mb-3 tracking-tight"
              >
                {headingText}
              </h3>
            );
          }
          return (
            <p
              key={index}
              className={
                index === 0
                  ? "first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-amber-500"
                  : ""
              }
            >
              {item}
            </p>
          );
        })}
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      {article.faqs && article.faqs.length > 0 && (
        <section className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-serif text-xl sm:text-2xl font-bold">
            <HelpCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <h3>Frequently Asked Questions</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {article.faqs.map((faq, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1.5 shadow-2xs"
              >
                <h4 className="font-sans font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                  {faq.question}
                </h4>
                <p className="font-sans text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Highlights Box */}
      <div className="p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Editorial Takeaway
        </div>
        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
          Stay connected with On Gravity Magazine for updates and continuation of this story in upcoming editions.
        </p>
      </div>

      {/* Tags & Sharing */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-zinc-400" />
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Author Bio Box */}
      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-5">
        <Image
          src={article.author.avatar}
          alt={article.author.name}
          width={64}
          height={64}
          className="rounded-full object-cover shrink-0"
        />
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Written by
          </div>
          <h4 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
            {article.author.name}
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {article.author.role} at On Gravity Magazine, specializing in in-depth features, investigative series, and editorial columns.
          </p>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
          <h3 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
            More from {category?.name || "this Edition"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <ArticleCard key={rel.id} article={rel} variant="standard" />
            ))}
          </div>
        </section>
      )}

      <Newsletter />
    </article>
  );
}
