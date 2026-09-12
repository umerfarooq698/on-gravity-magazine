import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getArticleBySlug } from "@/data/articles";
import { getAllArticlesCombined } from "@/lib/automation";
import { getCategoryBySlug } from "@/data/categories";
import { getAuthorSlug } from "@/data/authors";
import ArticleCard from "@/components/ArticleCard";
import { formatMetaDescription } from "@/lib/meta";
import { injectNaturalInternalLinks } from "@/lib/internalLinks";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Tag,
  Sparkles,
  HelpCircle,
  Share2,
  Bookmark
} from "lucide-react";

export const revalidate = 60;
export const dynamicParams = true;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found | On Gravity Magazine" };

  const baseUrl = "https://on-gravity-magazine-mu.vercel.app";
  const title = (article.metaTitle || `${article.title} | On Gravity Magazine`).replace(/&/g, "and");
  const description = formatMetaDescription(article.metaDescription || article.excerpt);
  const url = `${baseUrl}/${article.slug}`;
  const imageUrl = article.imageUrl.startsWith("http") ? article.imageUrl : `${baseUrl}${article.imageUrl}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "On Gravity Magazine",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.imageAlt || article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

function parseRichText(text: string): React.ReactNode[] {
  let cleanText = text.replace(/^[\#\s]+/, "").replace(/&/g, "and");

  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleanText)) !== null) {
    if (match.index > lastIndex) {
      const plainSegment = cleanText.substring(lastIndex, match.index).replace(/\*\*/g, "").replace(/\*/g, "");
      if (plainSegment) {
        parts.push(plainSegment);
      }
    }

    if (match[1] && match[2]) {
      const linkText = match[1].replace(/\*\*/g, "").replace(/\*/g, "");
      const linkUrl = match[2];
      const isExternal = linkUrl.startsWith("http://") || linkUrl.startsWith("https://");

      if (isExternal) {
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 dark:text-amber-400 font-bold underline hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            {linkText}
          </a>
        );
      } else {
        parts.push(
          <Link
            key={match.index}
            href={linkUrl}
            className="text-amber-600 dark:text-amber-400 font-bold underline hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            {linkText}
          </Link>
        );
      }
    } else if (match[3]) {
      parts.push(
        <strong key={match.index} className="font-bold text-zinc-900 dark:text-white">
          {match[3]}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < cleanText.length) {
    const plainSegment = cleanText.substring(lastIndex).replace(/\*\*/g, "").replace(/\*/g, "");
    if (plainSegment) {
      parts.push(plainSegment);
    }
  }

  return parts.length > 0 ? parts : [cleanText.replace(/\*\*/g, "").replace(/\*/g, "")];
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const baseUrl = "https://on-gravity-magazine-mu.vercel.app";
  const pageUrl = `${baseUrl}/${article.slug}`;
  const category = getCategoryBySlug(article.category);
  const allArticles = getAllArticlesCombined();

  const relatedArticles = allArticles
    .filter(
      (a) => a.category === article.category && a.id !== article.id && a.slug !== article.slug
    )
    .slice(0, 3);

  const usedSlugs = new Set([
    article.slug,
    article.id,
    ...relatedArticles.map((r) => r.slug),
    ...relatedArticles.map((r) => r.id),
  ]);

  const missedArticles = [...allArticles]
    .reverse()
    .filter((a) => !usedSlugs.has(a.slug) && !usedSlugs.has(a.id))
    .slice(0, 6);

  // 1. JSON-LD NewsArticle Schema
  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "headline": article.title.replace(/&/g, "and"),
    "image": [article.imageUrl],
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author.name,
      "jobTitle": article.author.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "On Gravity Magazine",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.svg`
      }
    },
    "description": article.metaDescription || article.excerpt
  };

  // 2. JSON-LD BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category ? category.name : "Category",
        "item": category ? `${baseUrl}/category/${category.slug}` : baseUrl
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title.replace(/&/g, "and"),
        "item": pageUrl
      }
    ]
  };

  // 3. JSON-LD FAQPage Schema for Google SERP Rich Snippets
  const faqJsonLd = article.faqs && article.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faqs.map(f => ({
      "@type": "Question",
      "name": f.question.replace(/&/g, "and"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer.replace(/&/g, "and")
      }
    }))
  } : null;

  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

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

          {category && (          <div className="flex items-center gap-3">
            <Link
              href={`/category/${article.category}`}
              className="px-3.5 py-1 text-xs font-black uppercase tracking-widest bg-red-600 text-white rounded-xs shadow-xs"
            >
              {category?.name || article.category}
            </Link>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">• NEWS DESK</span>
          </div>
          )}
        </div>

        {/* Article Title Header */}
        <header className="space-y-6">
          <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] uppercase">
            {article.title.replace(/&/g, "and")}
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 font-sans leading-relaxed border-l-4 border-red-600 pl-4 py-1 font-semibold">
            {article.excerpt.replace(/&/g, "and")}
          </p>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <Link
              href={`/author/${getAuthorSlug(article.author.name)}`}
              className="flex items-center gap-3 group/author hover:opacity-80 transition-opacity"
            >
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-red-600"
              />
              <div>
                <div className="font-black text-slate-900 dark:text-white text-sm group-hover/author:text-red-600 transition-colors uppercase">
                  {article.author.name}
                </div>
                <div className="text-slate-500 text-[10px] font-medium">{article.author.role}</div>
              </div>
            </Link>

            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                {article.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                {article.readTime}
              </span>
            </div>
          </div>
        </header>

        {/* Main Cover Image */}
        <div className="space-y-2">
          <div className="relative w-full aspect-16/9 rounded-xs overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
            <Image
              src={article.imageUrl}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 896px"
            />
          </div>
          {article.imageCaption && (
            <p className="text-center text-xs text-slate-500 italic pt-1">
              {article.imageCaption.replace(/&/g, "and")}
            </p>
          )}
        </div>

        {/* Reading Body with Fox News Styling */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 font-sans text-slate-800 dark:text-slate-200 text-lg leading-relaxed">
          {injectNaturalInternalLinks(article.content, article.slug)
            .filter((item) => {
              const lower = item.toLowerCase().trim();
              return (
                !lower.includes("frequently asked questions") &&
                !lower.startsWith("## faq") &&
                !lower.startsWith("### faq") &&
                !lower.startsWith("### q:") &&
                !lower.startsWith("q:")
              );
            })
            .map((item, index) => {
              const trimmed = item.trim();
              if (trimmed.startsWith("## ")) {
                const headingText = trimmed.replace(/^##\s+/, "").replace(/&/g, "and");
                return (
                  <h2
                    key={index}
                    className="font-sans text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white pt-8 pb-2 border-b-2 border-red-600 mt-8 mb-4 tracking-tight"
                  >
                    {parseRichText(headingText)}
                  </h2>
                );
              }
              if (trimmed.startsWith("### ")) {
                const headingText = trimmed.replace(/^###\s+/, "").replace(/&/g, "and");
                return (
                  <h3
                    key={index}
                    className="font-sans text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 pt-6 pb-2 mt-6 mb-3 tracking-tight"
                  >
                    {parseRichText(headingText)}
                  </h3>
                );
              }

              const isBullet = /^[*\-•]\s+/.test(trimmed) || /^[*\-•]\s*\*\*/.test(trimmed);

              if (isBullet) {
                const bulletContent = trimmed.replace(/^[*\-•]\s*/, "");
                return (
                  <div key={index} className="flex items-start gap-3 my-3 pl-2 sm:pl-4">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 mt-2 shrink-0" />
                    <div className="flex-1 font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
                      {parseRichText(bulletContent)}
                    </div>
                  </div>
                );
              }

              return (
                <p
                  key={index}
                  className={
                    index === 0
                      ? "first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:font-sans first-letter:text-red-600 first-letter:leading-none"
                      : ""
                  }
                >
                  {parseRichText(item)}
                </p>
              );
            })}
        </div>

        {/* Frequently Asked Questions (FAQ) Section */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900 border-t-4 border-t-red-600 border-x border-b border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-sans text-xl sm:text-2xl font-black uppercase">
              <HelpCircle className="w-6 h-6 text-red-600 shrink-0" />
              <h3>FREQUENTLY ASKED QUESTIONS</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {article.faqs.map((faq, index) => {
                const cleanQ = faq.question.replace(/^[\*\s]*(Q|Question)\s*[:\.]?\s*/gi, "").trim();
                const cleanA = faq.answer.replace(/^[\*\s]*(A|Answer)\s*[:\.]?\s*/gi, "").trim();
                return (
                  <div
                    key={index}
                    className="p-5 rounded-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 transition-all hover:border-red-600"
                  >
                    <h4 className="font-sans font-extrabold text-base text-slate-900 dark:text-white flex items-start gap-2">
                      <span className="text-red-600 font-black shrink-0">Q:</span>
                      {parseRichText(cleanQ)}
                    </h4>
                    <div className="font-sans text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                      {parseRichText(cleanA)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Highlights Takeaway Box */}
        <div className="p-6 bg-slate-900 text-white border-l-4 border-red-600 space-y-2">
          <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            NEWSROOM TAKEAWAY
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Stay connected with On Gravity News for live updates and continuation of breaking developments.
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
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-5">
          <Link
            href={`/author/${getAuthorSlug(article.author.name)}`}
            className="flex items-center gap-5 group/bio hover:opacity-90 transition-opacity flex-1"
          >
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={64}
              height={64}
              className="rounded-full object-cover shrink-0 border-2 border-amber-500/30"
            />
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Written by
              </div>
              <h4 className="font-serif text-lg font-bold text-zinc-900 dark:text-white group-hover/bio:text-amber-500 transition-colors">
                {article.author.name}
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {article.author.role} at On Gravity Magazine, specializing in in-depth features, investigative series, and editorial columns.
              </p>
            </div>
          </Link>
          <Link
            href={`/author/${getAuthorSlug(article.author.name)}`}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/30 hover:bg-amber-500/20 transition-colors shrink-0"
          >
            View Profile
          </Link>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
            <h3 className="font-sans text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white border-b-2 border-red-600 pb-2">
              More from {category?.name || "this Edition"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id || rel.slug} article={rel} variant="standard" />
              ))}
            </div>
          </section>
        )}

        {/* You May Have Missed Section */}
        {missedArticles.length > 0 && (
          <section className="pt-10 border-t-4 border-red-600 space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-6 bg-red-600" />
                <h3 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  YOU MAY HAVE MISSED
                </h3>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-500 hidden sm:inline-block">
                LATEST DISPATCHES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {missedArticles.map((missed) => (
                <ArticleCard key={missed.id || missed.slug} article={missed} variant="standard" />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
