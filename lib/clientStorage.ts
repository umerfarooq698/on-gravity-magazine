"use client";

import { Article } from "@/data/articles";

const PERMANENT_STORAGE_KEY = "og_custom_articles_v3";

export function getCustomArticlesFromStorage(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    // Purge all old legacy storage keys (v1, permanent_v1, etc.)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key !== PERMANENT_STORAGE_KEY && (key.startsWith("og_") || key.startsWith("on_gravity"))) {
        localStorage.removeItem(key);
      }
    }

    const primaryRaw = localStorage.getItem(PERMANENT_STORAGE_KEY);
    if (primaryRaw) {
      const parsed = JSON.parse(primaryRaw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to load articles from localStorage:", e);
  }
  return [];
}

export function saveCustomArticleToStorage(article: Article): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomArticlesFromStorage();
    const filtered = existing.filter((a) => a.slug !== article.slug && a.id !== article.id);
    const updated = [article, ...filtered].slice(0, 500);

    localStorage.setItem(PERMANENT_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch events so all active components & open tabs update immediately
    window.dispatchEvent(new Event("og_articles_updated"));
    window.dispatchEvent(new CustomEvent("og_articles_updated", { detail: article }));
  } catch (e) {
    console.error("Failed to save article to localStorage:", e);
  }
}

export function clearCustomArticlesFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("og_custom") || key.startsWith("og_articles") || key.startsWith("on_gravity"))
      ) {
        localStorage.removeItem(key);
      }
    }
    window.dispatchEvent(new Event("og_articles_updated"));
  } catch (e) {
    console.error("Failed to clear articles from localStorage:", e);
  }
}
