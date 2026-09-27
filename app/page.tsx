import type { Metadata } from "next";
import { getAllArticlesCombined } from "@/lib/automation";
import HomePageFeed from "@/components/HomePageFeed";
import { SITE_URL } from "@/lib/meta";

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

export const revalidate = 60;

export default function HomePage() {
  const allArticles = getAllArticlesCombined();
  return <HomePageFeed initialArticles={allArticles} />;
}
