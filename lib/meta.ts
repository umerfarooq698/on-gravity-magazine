export function formatMetaDescription(raw: string, hashVal: number = 0): string {
  let str = raw.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  str = str.replace(/^[#*_\->\s]+/, "").trim();

  // Target exactly ~140 characters (135 - 142 chars)
  if (str.length <= 142) {
    return str;
  }

  const sub = str.slice(0, 137);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > 100) {
    return sub.slice(0, lastSpace) + "...";
  }
  return sub + "...";
}


