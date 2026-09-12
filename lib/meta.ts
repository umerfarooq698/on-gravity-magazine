export function formatMetaDescription(raw: string, hashVal: number = 0): string {
  let str = raw.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  str = str.replace(/^[#*_\->\s]+/, "").trim();

  // Strip generic AI buzzwords
  str = str.replace(/^(discover|explore|learn more about|learn all about|dive into|uncover|in this article)\s+/i, "");
  str = str.replace(/\b(discover|explore|learn more)\b/gi, "review");

  // STRICT RULE: Remove all hyphens and dashes (- and —) from meta descriptions
  str = str.replace(/[-—–]+/g, " ");
  str = str.replace(/\s+/g, " ").trim();

  if (str.length > 0) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Strict target: 135 to 140 characters max
  if (str.length <= 140) {
    return str;
  }

  const sub = str.slice(0, 137);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > 100) {
    return sub.slice(0, lastSpace) + "...";
  }
  return sub + "...";
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ongravitymagazine.com";

export function toSeoSlug(text: string): string {
  if (!text) return "";
  let clean = text.toLowerCase().trim();
  clean = clean.replace(/&/g, "and");
  clean = clean.replace(/[^a-z0-9\s-]/g, "");
  clean = clean.replace(/\s+/g, "-");
  clean = clean.replace(/-+/g, "-");
  clean = clean.replace(/^-+|-+$/g, "");
  return clean;
}
