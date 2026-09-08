import React from "react";
import { getAllArticlesCombined } from "@/lib/automation";
import HomePageFeed from "@/components/HomePageFeed";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const allArticles = getAllArticlesCombined();
  return <HomePageFeed initialArticles={allArticles} />;
}
