import React from "react";
import { getAllArticlesCombined } from "@/lib/automation";
import HomePageFeed from "@/components/HomePageFeed";

export const revalidate = 60;

export default function HomePage() {
  const allArticles = getAllArticlesCombined();
  return <HomePageFeed initialArticles={allArticles} />;
}
