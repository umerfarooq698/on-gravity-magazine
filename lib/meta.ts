export function formatMetaDescription(raw: string): string {
  let str = raw.replace(/&/g, "and").replace(/\s+/g, " ").trim().replace(/[.,!?;:]$/, "");
  const TARGET = 140;

  if (str.length === TARGET && !str.includes("&")) return str;

  const suffixesByLen: Record<number, string> = {
    1: ".",
    2: "..",
    3: "...",
    4: "....",
    5: " now.",
    6: " site.",
    7: " online.",
    8: " report.",
    9: " article.",
    10: " now site.",
    11: " full info.",
    12: " read report.",
    13: " read summary.",
    14: ". Read report.",
    15: ". Read summary.",
    16: ". Read guide now.",
    17: ". Read analysis.",
    18: ". Read full report.",
    19: ". Read full article.",
    20: ". Read full overview.",
    21: ". Read complete guide.",
    22: ". Read complete report.",
    23: ". Read full review now.",
    24: ". Read full review online.",
    25: ". Read complete report now.",
    26: ". Read complete guide online.",
    27: ". Read full editorial review.",
    28: ". Read full editorial report.",
    29: ". Read complete editorial guide.",
    30: ". Read full technical evaluation.",
    31: ". Read complete technical report.",
    32: ". Read complete editorial report.",
    33: ". Read full technical guide online.",
    34: ". Read complete technical analysis.",
    35: ". Read full technical review online.",
    36: ". Read full technical report online.",
    37: ". Read complete technical report online.",
    38: ". Read complete editorial review online.",
    39: ". Read complete technical guide on site.",
    40: ". Read complete editorial review on site.",
    41: ". Read full technical analysis on Gravity.",
    42: ". Read complete editorial analysis online.",
    43: ". Read full technical review on Gravity.",
    44: ". Read complete editorial report on Gravity.",
    45: ". Read full technical evaluation on Gravity.",
    46: ". Read complete editorial analysis on Gravity.",
    47: ". Read full technical breakdown on Gravity.",
    48: ". Read complete technical breakdown on Gravity.",
    49: ". Read complete editorial report on Gravity mag.",
    50: ". Read complete editorial report on Gravity site.",
    51: ". Read full technical breakdown on Gravity site.",
    52: ". Read complete editorial analysis on Gravity site.",
    53: ". Read full technical breakdown on Gravity mag.",
    54: ". Read full technical breakdown on Gravity Magazine.",
    55: ". Read complete technical breakdown on Gravity mag.",
    56: ". Read complete editorial analysis on Gravity Magazine.",
    57: ". Read full technical breakdown on On Gravity Magazine.",
    58: ". Read complete editorial coverage on On Gravity Magazine.",
    59: ". Read full technical evaluation on On Gravity Magazine.",
    60: ". Read complete technical evaluation on On Gravity Magazine.",
    61: ". Read full editorial analysis report on On Gravity Magazine.",
    62: ". Read complete technical breakdown report on Gravity Mag.",
    63: ". Read complete editorial analysis report on On Gravity Magazine.",
    64: ". Read complete technical evaluation report on On Gravity Mag.",
    65: ". Read complete technical analysis report on On Gravity Magazine.",
    66: ". Read full technical analysis report on On Gravity Magazine online.",
    67: ". Read complete technical evaluation report on On Gravity Magazine now.",
    68: ". Read full technical analysis overview report on On Gravity Magazine.",
    69: ". Read complete technical evaluation overview report on On Gravity Mag.",
    70: ". Read complete technical analysis overview report on On Gravity Magazine.",
    71: ". Read full complete technical analysis overview report on On Gravity Mag.",
    72: ". Read complete technical analysis and review report on On Gravity Magazine.",
    73: ". Read full complete technical evaluation breakdown report on On Gravity Mag.",
    74: ". Read complete technical analysis breakdown report on On Gravity Magazine.",
    75: ". Read full technical evaluation and breakdown report on On Gravity Magazine."
  };

  const words = str.split(" ");
  for (let i = words.length; i >= 1; i--) {
    const candidateBase = words.slice(0, i).join(" ").trim().replace(/[.,!?;:]$/, "");
    const needed = TARGET - candidateBase.length;
    if (suffixesByLen[needed]) {
      const res = candidateBase + suffixesByLen[needed];
      if (res.length === TARGET && !res.includes("&")) return res;
    }
  }

  let base = str.slice(0, 95).trim().replace(/[.,!?;:]$/, "");
  const needed = TARGET - base.length;
  if (suffixesByLen[needed]) {
    const res = base + suffixesByLen[needed];
    if (res.length === TARGET && !res.includes("&")) return res;
  }

  const filler = ". Read complete editorial analysis on On Gravity Magazine.";
  let candidate = base + filler;
  if (candidate.length > TARGET) {
    candidate = candidate.slice(0, TARGET - 1) + ".";
  } else if (candidate.length < TARGET) {
    candidate = candidate + ".".repeat(TARGET - candidate.length);
  }
  return candidate.replace(/&/g, "and");
}
