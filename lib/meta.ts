export function formatMetaDescription(raw: string, hashVal: number = 0): string {
  let str = raw.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  str = str.replace(/^[#*_\->\s]+/, "").trim();

  // Strip generic AI buzzwords
  str = str.replace(/^(discover|explore|learn more about|learn all about|dive into|uncover|in this article)\s+/i, "");
  str = str.replace(/\b(discover|explore|learn more)\b/gi, "review");

  if (str.length > 0) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Target 135-155 characters
  if (str.length <= 155) {
    return str;
  }

  const sub = str.slice(0, 147);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > 110) {
    return sub.slice(0, lastSpace) + "...";
  }
  return sub + "...";
}


