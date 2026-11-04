import { MetadataRoute } from "next";
import { getAllArticlesCombined } from "@/lib/automation";
import { CATEGORIES } from "@/data/categories";
import { SITE_URL } from "@/lib/meta";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 1. Gather all published indexable articles
  const rawArticles = getAllArticlesCombined();
  const seenUrls = new Set<string>();

  // Exclude disallowed/non-indexable paths
  const DISALLOWED_SLUGS = new Set(["glock-19-gen-5", "search", "admin"]);

  // Calculate actual lastmod dates for articles
  const articleEntries: { url: string; lastModified: Date }[] = [];

  for (const art of rawArticles) {
    if (!art || !art.slug) continue;
    const cleanSlug = art.slug.trim().replace(/^\/+/, "");
    if (!cleanSlug || DISALLOWED_SLUGS.has(cleanSlug)) continue;

    const url = `${baseUrl}/${cleanSlug}`;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    const pubDate = art.publishedAt ? new Date(art.publishedAt) : null;
    const lastModified =
      pubDate && !isNaN(pubDate.getTime()) ? pubDate : new Date("2026-09-01T00:00:00Z");

    articleEntries.push({
      url,
      lastModified,
    });
  }

  // Find genuine latest modification timestamp across all articles
  const latestSiteDate = articleEntries.reduce((latest, entry) => {
    return entry.lastModified > latest ? entry.lastModified : latest;
  }, new Date("2026-09-27T00:00:00Z"));

  // 2. Core homepage and informational pages with genuine lastmod dates
  // Verified from git commit history: informational pages were last modified on 2026-09-27
  const STATIC_PAGES_LASTMOD = new Date("2026-09-27T00:00:00Z");

  const staticEntries: { url: string; lastModified: Date }[] = [
    {
      url: baseUrl,
      lastModified: latestSiteDate, // Homepage updates when newest article is published
    },
    {
      url: `${baseUrl}/about`,
      lastModified: STATIC_PAGES_LASTMOD,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: STATIC_PAGES_LASTMOD,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: STATIC_PAGES_LASTMOD,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: STATIC_PAGES_LASTMOD,
    },
  ].filter((entry) => {
    if (seenUrls.has(entry.url)) return false;
    seenUrls.add(entry.url);
    return true;
  });

  // 3. Category pages: lastModified is the date of the latest published article in that category
  const categoryEntries: { url: string; lastModified: Date }[] = CATEGORIES.map((cat) => {
    const catArticles = rawArticles.filter(
      (art) => art.category && art.category.toLowerCase() === cat.slug.toLowerCase()
    );

    const catLatestDate = catArticles.reduce((latest, art) => {
      const d = art.publishedAt ? new Date(art.publishedAt) : null;
      if (!d || isNaN(d.getTime())) return latest;
      return d > latest ? d : latest;
    }, STATIC_PAGES_LASTMOD);

    return {
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: catLatestDate,
    };
  }).filter((entry) => {
    if (seenUrls.has(entry.url)) return false;
    seenUrls.add(entry.url);
    return true;
  });

  // Return combined entries without changeFrequency and priority per Google official guidelines
  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
