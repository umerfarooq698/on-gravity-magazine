import React from "react";
import Metadata from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllArticlesCombined } from "@/lib/automation";
import { getAuthorBySlug, getAuthorSlug, AUTHORS } from "@/data/authors";
import ArticleCard from "@/components/ArticleCard";
import { ArrowLeft, BookOpen, MapPin, Globe, Share2, Mail } from "lucide-react";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  return {
    title: `${author.name} - Author Profile | On Gravity Magazine`,
    description: `Read all articles, features, and columns written by ${author.name} (${author.role}) on On Gravity Magazine.`,
    openGraph: {
      title: `${author.name} - Author Profile`,
      description: author.bio,
      type: "profile",
      images: [{ url: author.avatar }],
    },
  };
}

export async function generateStaticParams() {
  return AUTHORS.map((author) => ({
    slug: author.slug,
  }));
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  const allArticles = getAllArticlesCombined();
  const authorArticles = allArticles.filter((art) => {
    const artAuthorSlug = getAuthorSlug(art.author?.name || "");
    return artAuthorSlug === author.slug;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back Navigation */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Author Profile Hero Card */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="rounded-full object-cover border-4 border-amber-500/30 shadow-2xl"
              priority
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                Verified Contributor
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                {author.name}
              </h1>
              <p className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">
                {author.role}
              </p>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              {author.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {author.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  {author.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                {authorArticles.length} Published {authorArticles.length === 1 ? "Article" : "Articles"}
              </span>
            </div>

            {/* Social Links */}
            {author.socials && (
              <div className="flex items-center justify-center md:justify-start gap-3 pt-3">
                {author.socials.twitter && (
                  <a
                    href={author.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    aria-label="Website / Social"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {author.socials.linkedin && (
                  <a
                    href={author.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    aria-label="Share Profile"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
            Articles by {author.name}
          </h2>
          <span className="text-xs font-semibold text-zinc-500">
            Showing {authorArticles.length} stories
          </span>
        </div>

        {authorArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorArticles.map((article) => (
              <ArticleCard key={article.id || article.slug} article={article} variant="standard" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              No published articles found for this author yet.
            </p>
            <Link href="/" className="text-xs font-bold text-amber-500 hover:underline">
              Return to Homepage
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
