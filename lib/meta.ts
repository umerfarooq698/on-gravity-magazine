export function formatMetaDescription(raw: string, hashVal: number = 0): string {
  let str = raw.replace(/&/g, "and").replace(/\s+/g, " ").trim().replace(/[.,!?;:]$/, "");
  const TARGET = 140;

  if (str.length === TARGET && !str.includes("&")) return str;

  const suffixesByLen: Record<number, string[]> = {
    1: ["."],
    2: [".."],
    3: ["..."],
    4: ["...."],
    5: [" now."],
    6: [" site."],
    7: [" online."],
    8: [" report."],
    9: [" article."],
    10: [" now site.", " overview."],
    11: [" full info.", " view guide."],
    12: [" read report.", " view summary."],
    13: [" read summary.", " full report."],
    14: [". Read report.", ". Read guide.", ". Full report."],
    15: [". Read summary.", ". Full analysis.", ". Read overview."],
    16: [". Read guide now.", ". Full report now.", ". Read report site."],
    17: [". Read analysis.", ". View full guide.", ". Read summary site."],
    18: [". Read full report.", ". Read full guide.", ". View full report."],
    19: [". Read full article.", ". Read full analysis.", ". View complete info."],
    20: [". Read full overview.", ". Read complete report.", ". View full breakdown."],
    21: [". Read complete guide.", ". Read full review now.", ". View complete report."],
    22: [". Read complete report.", ". Read full review site.", ". View complete guide."],
    23: [". Read full review now.", ". Read complete summary.", ". View complete review."],
    24: [". Read full review online.", ". Read complete guide site.", ". View full report online."],
    25: [". Read complete report now.", ". Read full evaluation now.", ". View complete analysis."],
    26: [". Read complete guide online.", ". Read full review on site.", ". View complete report now."],
    27: [". Read full editorial review.", ". Read complete guide today.", ". View full technical guide."],
    28: [". Read full editorial report.", ". Read complete review site.", ". View full editorial guide."],
    29: [". Read complete editorial guide.", ". Read full technical summary.", ". View complete review online."],
    30: [". Read full technical evaluation.", ". Read complete report online.", ". View full editorial review."],
    31: [". Read complete technical report.", ". Read full editorial review site.", ". View complete technical guide."],
    32: [". Read complete editorial report.", ". Read full technical breakdown.", ". View complete technical review."],
    33: [". Read full technical guide online.", ". Read complete editorial review.", ". View full technical report site."],
    34: [". Read complete technical analysis.", ". Read full editorial report online.", ". View complete technical summary."],
    35: [". Read full technical review online.", ". Read complete technical guide site.", ". View full editorial evaluation."],
    36: [". Read full technical report online.", ". Read complete editorial breakdown.", ". View complete technical report now."],
    37: [". Read complete technical report online.", ". Read full editorial evaluation site.", ". View complete technical breakdown."],
    38: [". Read complete editorial review online.", ". Read full technical breakdown site.", ". View complete editorial report now."],
    39: [". Read complete technical guide on site.", ". Read full technical evaluation online.", ". View complete editorial guide site."],
    40: [". Read complete editorial review on site.", ". Read full technical breakdown online.", ". View complete technical analysis site."],
    41: [". Read full technical analysis on Gravity.", ". Read complete editorial breakdown site.", ". View full technical report on site."],
    42: [". Read complete editorial analysis online.", ". Read full technical report on Gravity.", ". View complete technical evaluation site."],
    43: [". Read full technical review on Gravity.", ". Read complete editorial report on site.", ". View complete technical breakdown site."],
    44: [". Read complete editorial report on Gravity.", ". Read full technical analysis online.", ". View complete technical evaluation now."],
    45: [". Read full technical evaluation on Gravity.", ". Read complete editorial breakdown online.", ". View complete technical report on site."],
    46: [". Read complete editorial analysis on Gravity.", ". Read full technical breakdown on site.", ". View complete technical review online."],
    47: [". Read full technical breakdown on Gravity.", ". Read complete editorial evaluation site.", ". View complete technical report online."],
    48: [". Read complete technical breakdown on Gravity.", ". Read full editorial analysis on site.", ". View complete technical evaluation online."],
    49: [". Read complete editorial report on Gravity mag.", ". Read full technical analysis on site.", ". View complete editorial review online."],
    50: [". Read complete editorial report on Gravity site.", ". Read full technical evaluation on site.", ". View complete technical breakdown site."],
    51: [". Read full technical breakdown on Gravity site.", ". Read complete editorial analysis site.", ". View complete technical report on site."],
    52: [". Read complete editorial analysis on Gravity site.", ". Read full technical report on site.", ". View complete editorial breakdown site."],
    53: [". Read full technical breakdown on Gravity mag.", ". Read complete technical analysis site.", ". View complete editorial report on site."],
    54: [". Read full technical breakdown on Gravity Magazine.", ". Read complete editorial evaluation site.", ". View complete technical report online."],
    55: [". Read complete technical breakdown on Gravity mag.", ". Read full technical evaluation on site.", ". View complete editorial analysis site."],
    56: [". Read complete editorial analysis on Gravity Magazine.", ". Read full technical breakdown on site.", ". View complete technical report online."],
    57: [". Read full technical breakdown on On Gravity Magazine.", ". Read complete editorial review on site.", ". View complete technical analysis site."],
    58: [". Read complete editorial coverage on On Gravity Magazine.", ". Read full technical report on site.", ". View complete technical evaluation site."],
    59: [". Read full technical evaluation on On Gravity Magazine.", ". Read complete editorial report on site.", ". View complete technical breakdown site."],
    60: [". Read complete technical evaluation on On Gravity Magazine.", ". Read full technical analysis on site.", ". View complete editorial review online."],
    61: [". Read full editorial analysis report on On Gravity Magazine.", ". Read complete technical breakdown on site.", ". View complete technical report online."],
    62: [". Read complete technical breakdown report on Gravity Mag.", ". Read full editorial evaluation on site.", ". View complete technical analysis site."],
    63: [". Read complete editorial analysis report on On Gravity Magazine.", ". Read full technical report on site.", ". View complete technical breakdown site."],
    64: [". Read complete technical evaluation report on On Gravity Mag.", ". Read full editorial review on site.", ". View complete technical report online."],
    65: [". Read complete technical analysis report on On Gravity Magazine.", ". Read full technical breakdown on site.", ". View complete editorial report online."],
    66: [". Read full technical analysis report on On Gravity Magazine online.", ". Read complete editorial evaluation on site.", ". View complete technical report online."],
    67: [". Read complete technical evaluation report on On Gravity Magazine now.", ". Read full technical breakdown on site.", ". View complete editorial analysis site."],
    68: [". Read full technical analysis overview report on On Gravity Magazine.", ". Read complete technical breakdown on site.", ". View complete editorial report online."],
    69: [". Read complete technical evaluation overview report on On Gravity Mag.", ". Read full technical analysis on site.", ". View complete editorial breakdown site."],
    70: [". Read complete technical analysis overview report on On Gravity Magazine.", ". Read full technical breakdown on site.", ". View complete technical report online."],
    71: [". Read full complete technical analysis overview report on On Gravity Mag.", ". Read complete editorial review on site.", ". View complete technical breakdown site."],
    72: [". Read complete technical analysis and review report on On Gravity Magazine.", ". Read full technical evaluation on site.", ". View complete technical report online."],
    73: [". Read full complete technical evaluation breakdown report on On Gravity Mag.", ". Read complete editorial analysis on site.", ". View complete technical report online."],
    74: [". Read complete technical analysis breakdown report on On Gravity Magazine.", ". Read full technical evaluation on site.", ". View complete editorial report online."],
    75: [". Read full technical evaluation and breakdown report on On Gravity Magazine.", ". Read complete technical analysis on site.", ". View complete technical report online."]
  };

  const words = str.split(" ");
  const candidatePool: string[] = [];

  for (let i = words.length; i >= 1; i--) {
    const candidateBase = words.slice(0, i).join(" ").trim().replace(/[.,!?;:]$/, "");
    const needed = TARGET - candidateBase.length;
    if (suffixesByLen[needed]) {
      const pool = suffixesByLen[needed];
      for (let sIdx = 0; sIdx < pool.length; sIdx++) {
        const res = candidateBase + pool[sIdx];
        if (res.length === TARGET && !res.includes("&")) {
          candidatePool.push(res);
        }
      }
    }
  }

  if (candidatePool.length > 0) {
    return candidatePool[Math.abs(hashVal) % candidatePool.length];
  }

  let base = str.slice(0, 95).trim().replace(/[.,!?;:]$/, "");
  const needed = TARGET - base.length;
  if (suffixesByLen[needed]) {
    const pool = suffixesByLen[needed];
    const res = base + pool[Math.abs(hashVal) % pool.length];
    if (res.length === TARGET && !res.includes("&")) return res;
  }

  const fillerOptions = [
    ". Read complete editorial analysis on On Gravity Magazine.",
    ". Read full technical report breakdown on Gravity Mag.",
    ". Read complete technical evaluation on Gravity site."
  ];
  let filler = fillerOptions[Math.abs(hashVal) % fillerOptions.length];
  let candidate = base + filler;
  if (candidate.length > TARGET) {
    candidate = candidate.slice(0, TARGET - 1) + ".";
  } else if (candidate.length < TARGET) {
    candidate = candidate + ".".repeat(TARGET - candidate.length);
  }
  return candidate.replace(/&/g, "and");
}
