import { Article } from "@/data/articles";
import { getAllArticlesCombined } from "@/lib/automation";

/**
 * Naturally injects internal links into article paragraphs.
 * Only creates a link IF a relevant target article actually exists in the magazine.
 * Max 1 to 2 natural links per article.
 */
export function injectNaturalInternalLinks(
  paragraphs: string[],
  currentSlug: string
): string[] {
  if (!paragraphs || paragraphs.length === 0) return paragraphs;

  try {
    const allArticles = getAllArticlesCombined();
    const availableTargets = allArticles.filter(
      (a) => a.slug !== currentSlug && a.id !== currentSlug
    );

    if (availableTargets.length === 0) return paragraphs;

    // Build target phrases mapped to target article slugs
    const targets: { phrase: string; slug: string }[] = [];

    for (const art of availableTargets) {
      const slugKey = art.slug.replace(/-\d+$/, "").replace(/-/g, " ").toLowerCase().trim();
      if (slugKey.length >= 4) {
        targets.push({ phrase: slugKey, slug: art.slug });
      }
    }

    // Sort target phrases by length descending (longest phrase match first)
    targets.sort((a, b) => b.phrase.length - a.phrase.length);

    let insertedCount = 0;
    const MAX_INTERNAL_LINKS = 2;
    const usedSlugs = new Set<string>();

    return paragraphs.map((para) => {
      // Skip headings, bullets, FAQs, or paragraphs already containing markdown links
      if (
        insertedCount >= MAX_INTERNAL_LINKS ||
        para.startsWith("#") ||
        para.startsWith("*") ||
        para.startsWith("-") ||
        para.includes("](")
      ) {
        return para;
      }

      let modifiedPara = para;

      for (const target of targets) {
        if (insertedCount >= MAX_INTERNAL_LINKS) break;
        if (usedSlugs.has(target.slug)) continue;

        const escapedPhrase = target.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\b(${escapedPhrase})\\b`, "i");

        if (regex.test(modifiedPara)) {
          modifiedPara = modifiedPara.replace(regex, (match) => `[${match}](/${target.slug})`);
          usedSlugs.add(target.slug);
          insertedCount++;
          break; // At most 1 link per paragraph
        }
      }

      return modifiedPara;
    });
  } catch (e) {
    return paragraphs;
  }
}
