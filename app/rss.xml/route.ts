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

export async function GET() {
  const baseUrl = SITE_URL;
  const articles = getAllArticlesCombined();

  const itemsXml = articles
    .map((art) => {
      const link = `${baseUrl}/${art.slug}`;
      const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date().toUTCString();
      const title = (art.title || "").replace(/&/g, "and");
      const description = (art.excerpt || "").replace(/&/g, "and");
      const category = (art.category || "General").toUpperCase();
      const author = art.author?.name || "Editorial Team";
      const imageUrl = art.imageUrl ? escapeXml(art.imageUrl) : "";

      const mediaTag = imageUrl
        ? `      <media:content url="${imageUrl}" medium="image" />\n      <enclosure url="${imageUrl}" length="0" type="image/jpeg" />`
        : "";

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${category}]]></category>
      <author><![CDATA[${author}]]></author>
${mediaTag}
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="/feed-style.xsl" type="text/xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
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
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
