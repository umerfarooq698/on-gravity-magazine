"use client";

import { Article } from "@/data/articles";

const STORAGE_KEY = "og_custom_published_articles_v12";

export function getCustomArticlesFromStorage(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to load articles from localStorage:", e);
  }
  return [];
}

export function saveCustomArticleToStorage(article: Article) {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomArticlesFromStorage();
    const filtered = existing.filter((a) => a.slug !== article.slug && a.id !== article.id);
    const updated = [article, ...filtered].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch custom event so open tabs update instantly
    window.dispatchEvent(new Event("og_articles_updated"));
  } catch (e) {
    console.error("Failed to save article to localStorage:", e);
  }
}
