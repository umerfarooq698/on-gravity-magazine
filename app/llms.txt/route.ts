import { SITE_URL } from "@/lib/meta";
import { getAllArticlesCombined } from "@/lib/automation";
import { CATEGORIES } from "@/data/categories";

export const revalidate = 60;

export async function GET() {
  const articles = getAllArticlesCombined();
  const articleList = articles
    .map((a) => `- [${a.title}](${SITE_URL}/${a.slug}): ${a.excerpt}`)
    .join("\n");

  const categoryList = CATEGORIES.map(
    (c) => `- [${c.name}](${SITE_URL}/category/${c.slug}): ${c.description}`
  ).join("\n");

  const content = `# On Gravity Magazine

> On Gravity Magazine delivers independent journalism, breaking news, technology analysis, celebrity updates, lifestyle guides, business insights, and culinary features.

## Site Structure & Categories

${categoryList}

## Published Articles & Guides

${articleList}

## Corporate & Policies

- [About Us](${SITE_URL}/about)
- [Contact Us](${SITE_URL}/contact)
- [Privacy Policy](${SITE_URL}/privacy-policy)
- [Cookie Policy](${SITE_URL}/cookie-policy)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [RSS Feed](${SITE_URL}/rss.xml)
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
