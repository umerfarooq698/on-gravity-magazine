import fs from "fs";
import path from "path";
import { getAllArticlesCombined } from "@/lib/automation";
import { SITE_URL } from "@/lib/meta";

export const revalidate = 60;

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCdata(str: string): string {
  if (!str) return "";
  return str.replace(/]]>/g, "]]]]><![CDATA[>");
}

function parseUtcDate(dateStr: string): Date {
  const clean = (dateStr || "").trim();
  if (!clean) return new Date("2026-09-01T00:00:00Z");
  const d = new Date(clean.endsWith("UTC") ? clean : `${clean} UTC`);
  if (!isNaN(d.getTime())) return d;
  return new Date(clean);
}

function getImageMimeType(url: string): string {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".gif")) return "image/gif";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".avif")) return "image/avif";
  return "image/jpeg";
}

function resolveAbsoluteImageUrl(rawUrl: string, baseUrl: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
}

function getLocalFileByteLength(imageUrl: string, baseUrl: string): number | null {
  try {
    let pathname = "";
    if (imageUrl.startsWith(baseUrl)) {
      pathname = imageUrl.slice(baseUrl.length);
    } else if (imageUrl.startsWith("/")) {
      pathname = imageUrl;
    } else {
      try {
        const parsed = new URL(imageUrl);
        const baseParsed = new URL(baseUrl);
        if (parsed.hostname === baseParsed.hostname) {
          pathname = parsed.pathname;
        } else {
          return null;
        }
      } catch {
        return null;
      }
    }

    if (pathname) {
      const sanitized = pathname.split("?")[0].replace(/^\/+/, "");
      const fullPath = path.join(process.cwd(), "public", sanitized);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isFile() && stats.size > 0) {
          return stats.size;
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET() {
  const baseUrl = SITE_URL;
  const rawArticles = getAllArticlesCombined();

  // Deduplicate articles by slug
  const seenSlugs = new Set<string>();
  const articles = rawArticles.filter((art) => {
    if (!art || !art.slug) return false;
    const cleanSlug = art.slug.trim();
    if (seenSlugs.has(cleanSlug)) return false;
    seenSlugs.add(cleanSlug);
    return true;
  });

  // Sort articles by publication date descending (newest first)
  articles.sort((a, b) => {
    const timeA = a.publishedAt ? parseUtcDate(a.publishedAt).getTime() : 0;
    const timeB = b.publishedAt ? parseUtcDate(b.publishedAt).getTime() : 0;
    return timeB - timeA;
  });

  const itemsXml = articles
    .map((art) => {
      const link = `${baseUrl}/${art.slug}`;
      const pubDateObj = art.publishedAt ? parseUtcDate(art.publishedAt) : null;
      const pubDate =
        pubDateObj && !isNaN(pubDateObj.getTime())
          ? pubDateObj.toUTCString()
          : new Date("2026-09-01T00:00:00Z").toUTCString();

      const title = escapeCdata((art.title || "").replace(/&/g, "and"));
      const description = escapeCdata((art.excerpt || "").replace(/&/g, "and"));
      const category = escapeCdata((art.category || "General").toUpperCase());
      const author = escapeCdata(art.author?.name || "Editorial Team");

      const resolvedImage = resolveAbsoluteImageUrl(art.imageUrl || "", baseUrl);
      const escapedImageUrl = resolvedImage ? escapeXml(resolvedImage) : "";
      const mimeType = resolvedImage ? getImageMimeType(resolvedImage) : "image/jpeg";
      const localByteLength = resolvedImage ? getLocalFileByteLength(resolvedImage, baseUrl) : null;

      let mediaXml = "";
      if (escapedImageUrl) {
        if (localByteLength !== null && localByteLength > 0) {
          mediaXml = `      <media:content url="${escapedImageUrl}" medium="image" type="${mimeType}" />\n      <enclosure url="${escapedImageUrl}" length="${localByteLength}" type="${mimeType}" />`;
        } else {
          mediaXml = `      <media:content url="${escapedImageUrl}" medium="image" type="${mimeType}" />`;
        }
      }

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${category}]]></category>
      <dc:creator><![CDATA[${author}]]></dc:creator>
      <author><![CDATA[${author}]]></author>
${mediaXml}
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>On Gravity Magazine | Independent Journalism and Culture</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Explore in-depth reporting across Tech, Celebrity, Life Style, Health, Business, News, and Food on On Gravity Magazine.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} On Gravity Magazine. All rights reserved.</copyright>
    <atom:link href="${escapeXml(baseUrl)}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
