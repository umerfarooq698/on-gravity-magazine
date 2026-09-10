import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, CATEGORIES } from "@/data/categories";
import { getArticlesByCategory } from "@/data/articles";
import CategoryPageFeed from "@/components/CategoryPageFeed";
import ArticleCard from "@/components/ArticleCard";
import Newsletter from "@/components/Newsletter";
import { FolderOpen, ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

import { formatMetaDescription } from "@/lib/meta";

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name.replace(/&/g, "and")} | On Gravity Magazine`,
    description: formatMetaDescription(category.description),
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

  return <CategoryPageFeed category={category} initialArticles={articles} />;
}
