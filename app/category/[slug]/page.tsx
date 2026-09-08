import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, CATEGORIES } from "@/data/categories";
import { getArticlesByCategory } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import { FolderOpen, ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} | On Gravity Magazine`,
    description: category.description,
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const articles = getArticlesByCategory(category.slug);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Category Header Banner */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-8 sm:p-12 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Categories
          </span>
        </div>

        <div className="space-y-3">
          <span
            className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${category.bgLight}`}
          >
            {category.name} Edition
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
            {category.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            {category.description}
          </p>
        </div>

        <div className="pt-2 text-xs font-medium text-zinc-500">
          Showing {articles.length} {articles.length === 1 ? "article" : "articles"} in this category
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
          <FolderOpen className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-zinc-800 dark:text-zinc-200">
            No articles found in {category.name}
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            We are actively adding new stories for this edition. Please check back shortly or explore our other editions.
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
          >
            Back to Home
          </Link>
        </div>
      )}

      {/* Category Pills Footer Navigation */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <h4 className="font-serif text-lg font-bold text-zinc-900 dark:text-white">
          Other Editions You Might Enjoy
        </h4>
        <div className="flex items-center gap-3 flex-wrap">
          {CATEGORIES.filter((c) => c.slug !== category.slug).map((other) => (
            <Link
              key={other.id}
              href={`/category/${other.slug}`}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {other.name} →
            </Link>
          ))}
        </div>
      </div>

      <Newsletter />
    </div>
  );
}
