"use client";

import { Article } from "@/data/articles";

const PERMANENT_STORAGE_KEY = "og_custom_articles_permanent_v1";

export function getCustomArticlesFromStorage(): Article[] {
  if (typeof window === "undefined") return [];
  try {
    const map = new Map<string, Article>();

    // 1. Check primary permanent key
    const primaryRaw = localStorage.getItem(PERMANENT_STORAGE_KEY);
    if (primaryRaw) {
      try {
        const parsed = JSON.parse(primaryRaw);
        if (Array.isArray(parsed)) {
          for (const art of parsed) {
            if (art && art.slug && !map.has(art.slug)) {
              map.set(art.slug, art);
            }
          }
        }
      } catch (e) {}
    }

    // 2. Scan all legacy keys in localStorage to recover any previously created articles
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key !== PERMANENT_STORAGE_KEY &&
        (key.startsWith("og_custom") || key.startsWith("og_articles") || key.startsWith("on_gravity"))
      ) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              for (const art of parsed) {
                if (art && art.slug && !map.has(art.slug)) {
                  map.set(art.slug, art);
                }
              }
            }
          }
        } catch (e) {}
      }
    }

    const allCustom = Array.from(map.values());

    // Save consolidated articles back to permanent key if migrated
    if (allCustom.length > 0) {
      try {
        localStorage.setItem(PERMANENT_STORAGE_KEY, JSON.stringify(allCustom.slice(0, 500)));
      } catch (e) {}
    }

    return allCustom;
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
