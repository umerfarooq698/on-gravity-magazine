import { getAllArticlesCombined } from "@/lib/automation";

export const revalidate = 60;

export async function GET() {
  const baseUrl = "https://on-gravity-magazine-mu.vercel.app";
  const articles = getAllArticlesCombined();

  const itemsXml = articles
    .map((art) => {
      const link = `${baseUrl}/${art.slug}`;
      const pubDate = new Date(art.publishedAt).toUTCString();
      const title = art.title.replace(/&/g, "and");
      const description = (art.excerpt || "").replace(/&/g, "and");
      const category = (art.category || "General").toUpperCase();

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${category}]]></category>
      <author><![CDATA[${art.author.name}]]></author>
      <media:content url="${art.imageUrl}" medium="image" />
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>On Gravity Magazine | Independent Journalism and Culture</title>
    <link>${baseUrl}</link>
    <description>Explore in-depth reporting across Tech, Celebrity, Life Style, Health, Business, News, and Food on On Gravity Magazine.</description>
    <language>en-us</language>
    <copyright>© ${new Date().getFullYear()} On Gravity Magazine. All rights reserved.</copyright>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
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
