export function formatMetaDescription(raw: string, hashVal: number = 0): string {
  let str = raw.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  str = str.replace(/^[#*_\->\s]+/, "").trim();

  if (str.length <= 160) {
    return str;
  }

  const sub = str.slice(0, 157);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > 120) {
    return sub.slice(0, lastSpace) + "...";
  }
  return sub + "...";
}


