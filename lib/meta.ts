export function formatMetaDescription(raw: string): string {
  let str = raw.replace(/&/g, "and").replace(/\s+/g, " ").trim().replace(/[.,!?;:]$/, "");
  const TARGET = 140;

  if (str.length === TARGET && !str.includes("&")) return str;

  const suffixes = [
    ". Read full report.",                        // 18
    ". Read full report now.",                    // 22
    ". Read complete report.",                    // 22
    ". Read full review online.",                 // 24
    ". Read complete report now.",                // 25
    ". Read full editorial report.",              // 28
    ". Read complete editorial report.",          // 32
    ". Read full technical report online.",       // 36
    ". Read complete editorial review online.",   // 40
    ". Read full technical analysis on Gravity.", // 42
    ". Read complete editorial analysis online.", // 42
    ". Read full technical breakdown on Gravity.",// 44
    ". Read complete editorial report on Gravity.",// 44
    ". Read complete technical report on Gravity.",// 44
    ". Read full editorial breakdown on Gravity.",// 44
    ". Read complete editorial analysis on Gravity.",// 46
    ". Read full technical analysis on On Gravity.",// 46
    ". Read complete technical breakdown on Gravity.",// 48
    ". Read full editorial analysis on Gravity news.",// 48
    ". Read complete editorial report on Gravity mag.",// 49
    ". Read complete editorial report on Gravity site.",// 50
    ". Read full technical breakdown on Gravity news.",// 50
    ". Read complete editorial analysis on Gravity site.",// 52
    ". Read full technical breakdown on Gravity Magazine.",// 54
    ". Read complete editorial analysis on Gravity Magazine.",// 56
    ". Read full technical breakdown on On Gravity Magazine.",// 57
    ". Read complete editorial coverage on On Gravity Magazine."// 58
  ];

  const words = str.split(" ");
  for (let i = words.length; i >= 1; i--) {
    const candidateBase = words.slice(0, i).join(" ").trim().replace(/[.,!?;:]$/, "");
    const needed = TARGET - candidateBase.length;
    const foundSuffix = suffixes.find((s) => s.length === needed);
    if (foundSuffix) {
      return candidateBase + foundSuffix;
    }
  }

  let sub = words.slice(0, 15).join(" ").replace(/[.,!?;:]$/, "");
  const fill = ". Read full editorial analysis on On Gravity Magazine.";
  let combined = (sub.slice(0, TARGET - fill.length) + fill);
  if (combined.length > TARGET) combined = combined.slice(0, TARGET);
  while (combined.length < TARGET) combined += ".";
  return combined;
}
