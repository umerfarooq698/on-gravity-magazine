import { Article, ARTICLES } from "@/data/articles";

export interface QueueItem {
  id: string;
  keyword: string;
  category?: string;
  status: "pending" | "publishing" | "published" | "failed";
  createdAt: string;
  publishedAt?: string;
  generatedArticleSlug?: string;
}

const CACHE_VERSION_FILE = "on_gravity_articles_cache_v6.json";

function loadCacheFromDisk(): Article[] {
  if (typeof window !== "undefined") return [];
  try {
    const fs = require("fs");
    const path = require("path");
    const cacheFile = path.join("/tmp", CACHE_VERSION_FILE);
    if (fs.existsSync(cacheFile)) {
      const data = fs.readFileSync(cacheFile, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // Ignore
  }
  return [];
}

function saveCacheToDisk(articles: Article[]) {
  if (typeof window !== "undefined") return;
  try {
    const fs = require("fs");
    const path = require("path");
    const cacheFile = path.join("/tmp", CACHE_VERSION_FILE);
    fs.writeFileSync(cacheFile, JSON.stringify(articles.slice(0, 100)), "utf-8");
  } catch (e) {
    // Ignore
  }
}

const getGeminiApiKey = () => process.env.GEMINI_API_KEY || "";
const getUnsplashAccessKey = () => process.env.UNSPLASH_ACCESS_KEY || "FLqjxtnt8-eGS9mpiB3-GMOvHhVAqT4_lQxyslYLO0A";

// Global in-memory storage (persists across server requests in Node process)
let dynamicArticlesStore: Article[] = [];
let keywordQueueStore: QueueItem[] = [
  {
    id: "q-1",
    keyword: "AI Autonomous Agents in Healthcare",
    category: "tech",
    status: "pending",
    createdAt: "Sept 8, 2026",
  },
  {
    id: "q-2",
    keyword: "2026 Red Carpet Fashion Highlights",
    category: "celebrity",
    status: "pending",
    createdAt: "Sept 8, 2026",
  },
  {
    id: "q-3",
    keyword: "Holistic Sleep Optimization and Circadian Rhythms",
    category: "health",
    status: "pending",
    createdAt: "Sept 8, 2026",
  },
  {
    id: "q-4",
    keyword: "Venture Capital Shifts in Clean Energy Startups",
    category: "business",
    status: "pending",
    createdAt: "Sept 8, 2026",
  },
  {
    id: "q-5",
    keyword: "Minimalist Architecture and Slow Living Spaces",
    category: "life-style",
    status: "pending",
    createdAt: "Sept 8, 2026",
  },
  {
    id: "q-6",
    keyword: "Zero-Waste Farm to Table Michelin Dining",
    category: "food",
    status: "pending",
    createdAt: "Sept 8, 2026",
  },
  {
    id: "q-7",
    keyword: "Global Renewable Energy Municipal Accords",
    category: "news",
    status: "pending",
    createdAt: "Sept 8, 2026",
  },
];

/**
 * Derive a deterministic integer hash from a string to ensure fixed, reproducible selection
 */
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Format raw search keywords into natural English phrases for titles, sentences, and FAQs
 */
export function formatNaturalKeyword(keyword: string): {
  raw: string;
  title: string;
  singular: string;
  plural: string;
  withArticle: string;
  topic: string;
} {
  const raw = keyword.trim();
  const lower = raw.toLowerCase();
  const words = lower.split(/\s+/);

  // Exact mappings for high-frequency search phrases
  if (lower === "bathroom taps idea" || lower === "bathroom tap idea" || lower === "bathroom tap ideas") {
    return {
      raw,
      title: "Bathroom Tap Ideas",
      singular: "bathroom tap idea",
      plural: "bathroom tap ideas",
      withArticle: "bathroom tap ideas",
      topic: "bathroom tap design ideas",
    };
  }
  if (lower === "bathroom cold tap" || lower === "bathroom cold taps") {
    return {
      raw,
      title: "Bathroom Cold Tap",
      singular: "bathroom cold tap",
      plural: "bathroom cold taps",
      withArticle: "a bathroom cold tap",
      topic: "bathroom cold water taps",
    };
  }
  if (lower === "bathroom hot tap" || lower === "bathroom hot taps") {
    return {
      raw,
      title: "Bathroom Hot Tap",
      singular: "bathroom hot tap",
      plural: "bathroom hot taps",
      withArticle: "a bathroom hot tap",
      topic: "bathroom hot water taps",
    };
  }
  if (lower === "bathroom tap" || lower === "bathroom taps") {
    return {
      raw,
      title: "Bathroom Tap",
      singular: "bathroom tap",
      plural: "bathroom taps",
      withArticle: "a bathroom tap",
      topic: "bathroom taps",
    };
  }
  if (lower === "bathtub drain" || lower === "bath drain") {
    return {
      raw,
      title: "Bathtub Drain",
      singular: "bathtub drain",
      plural: "bathtub drains",
      withArticle: "a bathtub drain",
      topic: "bathtub drain assemblies",
    };
  }
  if (lower === "bathroom tub" || lower === "bath tub") {
    return {
      raw,
      title: "Bathroom Tub",
      singular: "bathroom tub",
      plural: "bathroom tubs",
      withArticle: "a bathroom tub",
      topic: "bathroom soaking tubs",
    };
  }
  if (lower === "best gaming mouse" || lower === "gaming mouse") {
    return {
      raw,
      title: "Best Gaming Mouse",
      singular: "gaming mouse",
      plural: "gaming mice",
      withArticle: "the best gaming mouse",
      topic: "gaming mice",
    };
  }
  if (lower === "smart home hub" || lower === "smarthome hub") {
    return {
      raw,
      title: "Smart Home Hub",
      singular: "smart home hub",
      plural: "smart home hubs",
      withArticle: "a smart home hub",
      topic: "smart home hubs",
    };
  }
  if (lower === "minimalist living room" || lower === "minimalist living spaces") {
    return {
      raw,
      title: "Minimalist Living Room",
      singular: "minimalist living room",
      plural: "minimalist living rooms",
      withArticle: "a minimalist living room",
      topic: "minimalist living room design",
    };
  }

  // Generic natural language formatting algorithm
  const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const lastWord = words[words.length - 1];
  const isPlural = lastWord.endsWith("s") || lastWord === "ideas" || lastWord === "tips" || lastWord === "insights";
  const singular = isPlural ? raw.replace(/s$/i, "") : raw;
  const plural = isPlural
    ? raw
    : raw.endsWith("ch") || raw.endsWith("sh") || raw.endsWith("x") || raw.endsWith("s")
    ? raw + "es"
    : raw + "s";
  const startsWithVowel = /^[aeiou]/i.test(raw);
  const withArticle = isPlural ? raw : startsWithVowel ? `an ${raw}` : `a ${raw}`;

  return {
    raw,
    title,
    singular,
    plural,
    withArticle,
    topic: raw,
  };
}

/**
 * Categorize keywords into rich multi-domain sub-tokens
 */
export function extractKeywordSubTokens(keyword: string) {
  const kw = keyword.toLowerCase();
  return {
    isIdea: kw.includes("idea") || kw.includes("design") || kw.includes("inspiration") || kw.includes("style") || kw.includes("concept"),
    isCold: kw.includes("cold"),
    isHot: kw.includes("hot") || kw.includes("boiling") || kw.includes("warm"),
    isBlack: kw.includes("black") || kw.includes("dark") || kw.includes("matte"),
    isGold: kw.includes("gold") || kw.includes("brass") || kw.includes("bronze") || kw.includes("copper"),
    isTap: kw.includes("tap") || kw.includes("faucet") || kw.includes("mixer") || kw.includes("spout"),
    isTub: kw.includes("tub") || kw.includes("bath") || kw.includes("soaker") || kw.includes("basin"),
    isDrain: kw.includes("drain") || kw.includes("trap") || kw.includes("waste") || kw.includes("plumbing"),
    isGaming: kw.includes("gaming") || kw.includes("mouse") || kw.includes("keyboard") || kw.includes("gpu") || kw.includes("headset") || kw.includes("console"),
    isSmartHome: kw.includes("smart") || kw.includes("hub") || kw.includes("automation") || kw.includes("iot") || kw.includes("sensor"),
    isTv: kw.includes("tv") || kw.includes("television") || kw.includes("display") || kw.includes("screen") || kw.includes("samsung") || kw.includes("oled") || kw.includes("qled"),
    isSleep: kw.includes("sleep") || kw.includes("circadian") || kw.includes("rest") || kw.includes("wellness") || kw.includes("meditation"),
    isCrypto: kw.includes("crypto") || kw.includes("invest") || kw.includes("stock") || kw.includes("venture") || kw.includes("capital") || kw.includes("finance") || kw.includes("market"),
    isFood: kw.includes("food") || kw.includes("dining") || kw.includes("michelin") || kw.includes("chef") || kw.includes("recipe") || kw.includes("culinary") || kw.includes("coffee"),
    isFashion: kw.includes("fashion") || kw.includes("carpet") || kw.includes("gala") || kw.includes("celebrity") || kw.includes("couture") || kw.includes("runway"),
    isMusk: kw.includes("musk") || kw.includes("elon") || kw.includes("tesla") || kw.includes("spacex"),
  };
}

/**
 * Fetch a fixed, high-res photograph dynamically for a keyword that stays stable across page reloads
 */
async function fetchUniqueUnsplashImage(keyword: string, category: string): Promise<{ url: string; caption: string; alt: string }> {
  const accessKey = getUnsplashAccessKey();
  const cleanKw = keyword.trim().toLowerCase();
  const slugSig = cleanKw.replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(cleanKw);

  const SPECIFIC_KEYWORD_PHOTO_MAP: Record<string, { photoId: string; caption: string; alt: string }> = {
    "elon musk": {
      photoId: "photo-1560250097-0b93528c311a",
      caption: "Editorial portrait of Elon Musk, CEO and technology innovator.",
      alt: "Editorial portrait photograph of Elon Musk",
    },
    "elon": {
      photoId: "photo-1560250097-0b93528c311a",
      caption: "Editorial portrait of Elon Musk, CEO and technology innovator.",
      alt: "Editorial portrait photograph of Elon Musk",
    },
    "musk": {
      photoId: "photo-1560250097-0b93528c311a",
      caption: "Editorial portrait of Elon Musk, CEO and technology innovator.",
      alt: "Editorial portrait photograph of Elon Musk",
    },
    "bathtub drain": {
      photoId: "photo-1584622650111-993a426fbf0a",
      caption: "Editorial photograph for bathtub drain assembly.",
      alt: "Clawfoot bathtub and drain fitting",
    },
    "bathroom tub": {
      photoId: "photo-1507652313519-d4e9174996dd",
      caption: "Editorial photograph of a modern luxury bathroom soaking tub.",
      alt: "Modern luxury freestanding bathtub",
    },
    "samsung tv": {
      photoId: "photo-1593359677879-a4bb92f829d1",
      caption: "Editorial photograph for Samsung TV screen display.",
      alt: "4K QLED display panel",
    },
  };

  const exactMatch = SPECIFIC_KEYWORD_PHOTO_MAP[cleanKw];
  if (exactMatch) {
    return {
      url: `https://images.unsplash.com/${exactMatch.photoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`,
      caption: exactMatch.caption,
      alt: exactMatch.alt,
    };
  }

  // Domain-curated photo pools
  const categoryPhotoPools: Record<string, string[]> = {
    "life-style": [
      "photo-1584622650111-993a426fbf0a",
      "photo-1507652313519-d4e9174996dd",
      "photo-1618221195710-dd6b41faaea6",
      "photo-1513694203232-719a280e022f",
      "photo-1586023492125-27b2c045efd7",
      "photo-1600585154340-be6161a56a0c",
      "photo-1499750310107-5fef28a66643",
      "photo-1507089947368-19c1da9775ae",
    ],
    tech: [
      "photo-1593359677879-a4bb92f829d1",
      "photo-1550745165-9bc0b252726f",
      "photo-1518770660439-4636190af475",
      "photo-1519389950473-47ba0277781c",
      "photo-1531297484001-80022131f5a1",
      "photo-1618005182384-a83a8bd57fbe",
      "photo-1526374965328-7f61d4dc18c5",
      "photo-1508739773434-c26b3d09e071",
    ],
    health: [
      "photo-1506126613408-eca07ce68773",
      "photo-1540420773420-3366772f4999",
      "photo-1571019613454-1cb2f99b2d8b",
      "photo-1511295742362-92c96b124e52",
      "photo-1544367567-0f2fcb009e0b",
      "photo-1498837167922-ddd27525d352",
      "photo-1505576399279-565b52d4ac71",
      "photo-1512290900673-066b567a5449",
    ],
    celebrity: [
      "photo-1492684223066-81342ee5ff30",
      "photo-1515886657613-9f3515b0c78f",
      "photo-1509631179647-0177331693ae",
      "photo-1469334031218-e382a71b716b",
      "photo-1539571696357-5a69c17a67c6",
      "photo-1490481651871-ab68de25d43d",
      "photo-1529139574466-a303027c1d8b",
      "photo-1500648767791-00dcc994a43e",
    ],
    business: [
      "photo-1590283603385-17ffb3a7f29f",
      "photo-1486406146926-c627a92ad1ab",
      "photo-1507679799987-c73779587ccf",
      "photo-1551836022-d5d88e9218df",
      "photo-1559526324-4b87b5e36e44",
      "photo-1454165804606-c3d57bc86b40",
      "photo-1522071820081-009f0129c71c",
      "photo-1444653614773-995cb1ef9efa",
    ],
    food: [
      "photo-1555396273-367ea4eb4db5",
      "photo-1504674900247-0877df9cc836",
      "photo-1540189549336-e6e99c3679fe",
      "photo-1565299624946-b28f40a0ae38",
      "photo-1551024709-8f23befc6f87",
      "photo-1510812431401-41d2bd2722f3",
      "photo-1495474472287-4d71bcdd2085",
      "photo-1544025162-d76694265947",
    ],
    news: [
      "photo-1470071459604-3b5ec3a7fe05",
      "photo-1541872703-74c5e44368f9",
      "photo-1585829365295-ab7cd400c167",
      "photo-1526304640581-d334cdbbf45e",
      "photo-1529107386315-e1a2ed48a620",
      "photo-1451187580459-43490279c0fa",
      "photo-1569163139599-0f4517e36f51",
      "photo-1572949645841-094f3a9c4c94",
    ],
  };

  const pool = categoryPhotoPools[category] || categoryPhotoPools["tech"];
  const selectedPhotoId = pool[hashVal % pool.length];
  const fixedUrl = `https://images.unsplash.com/${selectedPhotoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`;

  return {
    url: fixedUrl,
    caption: `Editorial photograph highlighting ${keyword} for On Gravity Magazine.`,
    alt: `High resolution photography representing ${keyword}`,
  };
}

function inferCategoryFromKeyword(keyword: string): string {
  const kw = keyword.toLowerCase();

  if (
    kw.includes("celebrity") ||
    kw.includes("actor") ||
    kw.includes("fashion") ||
    kw.includes("movie") ||
    kw.includes("gala") ||
    kw.includes("hollywood") ||
    kw.includes("music")
  ) {
    return "celebrity";
  }

  if (
    kw.includes("lifestyle") ||
    kw.includes("life-style") ||
    kw.includes("home") ||
    kw.includes("living") ||
    kw.includes("bathtub") ||
    kw.includes("drain") ||
    kw.includes("bathroom") ||
    kw.includes("shower") ||
    kw.includes("sink") ||
    kw.includes("faucet") ||
    kw.includes("plumbing") ||
    kw.includes("decor") ||
    kw.includes("routine")
  ) {
    return "life-style";
  }

  if (
    kw.includes("health") ||
    kw.includes("sleep") ||
    kw.includes("diet") ||
    kw.includes("nutrition") ||
    kw.includes("fitness") ||
    kw.includes("wellness") ||
    kw.includes("skincare")
  ) {
    return "health";
  }

  if (
    kw.includes("business") ||
    kw.includes("market") ||
    kw.includes("startup") ||
    kw.includes("finance") ||
    kw.includes("invest") ||
    kw.includes("crypto") ||
    kw.includes("ceo")
  ) {
    return "business";
  }

  if (
    kw.includes("food") ||
    kw.includes("dining") ||
    kw.includes("recipe") ||
    kw.includes("gourmet") ||
    kw.includes("chef") ||
    kw.includes("coffee")
  ) {
    return "food";
  }

  if (
    kw.includes("news") ||
    kw.includes("global") ||
    kw.includes("summit") ||
    kw.includes("climate") ||
    kw.includes("accord")
  ) {
    return "news";
  }

  return "tech";
}

const AUTHORS = [
  { name: "Marcus Vance", role: "Senior Technology Editor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { name: "Elena Rostova", role: "Pop Culture Lead", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  { name: "Sophia Chen", role: "Lifestyle & Wellness Columnist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  { name: "David Sterling", role: "Chief Economics Analyst", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { name: "Camilla Dupuis", role: "Culinary Editor", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" },
];

/**
 * Call Gemini API when key is available
 */
async function fetchGeminiArticle(keyword: string, categoryOverride?: string): Promise<{
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  imageAlt: string;
  paragraphs: string[];
  faqs?: { question: string; answer: string }[];
  category: string;
  tags: string[];
} | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const prompt = `You are an experienced local expert writer for "On Gravity Magazine".
Write an exceptional, 100% UNIQUE human feature article for keyword: "${keyword}".

CRITICAL RULES:
1. WORD COUNT (STRICTLY 900 - 1200 WORDS TOTAL): 7 to 9 detailed paragraphs (~120-150 words each).
2. TITLE: Natural, engaging, non-repetitive headline specifically for "${keyword}".
3. HEADINGS: Use custom H2 ("## Heading") and H3 ("### Subheading") sections. Include primary topic naturally in H2s.
4. TONE: Warm, friendly, human, clear, conversational.
5. NO AI MENTIONS: Never use "AI", "language model", "as an AI".
6. FAQS (3-4 SHORT TAILORED FAQS): Every question and answer MUST be 100% specific to "${keyword}".

Return ONLY a valid JSON object:
{
  "title": "Headline",
  "metaTitle": "SEO Title | On Gravity Magazine",
  "metaDescription": "Description under 155 chars",
  "imageAlt": "Photo ALT text",
  "excerpt": "2-sentence summary",
  "paragraphs": [
    "Intro paragraph...",
    "## Custom H2 Heading",
    "Paragraph 2...",
    "### Custom H3 Subheading",
    "Paragraph 3...",
    "## Custom H2 Heading",
    "Paragraph 4...",
    "## Custom H2 Heading",
    "Paragraph 5...",
    "Paragraph 6...",
    "## Custom H2 Heading",
    "Paragraph 7..."
  ],
  "faqs": [
    { "question": "Question 1?", "answer": "Answer 1." },
    { "question": "Question 2?", "answer": "Answer 2." },
    { "question": "Question 3?", "answer": "Answer 3." },
    { "question": "Question 4?", "answer": "Answer 4." }
  ],
  "category": "one of: celebrity, life-style, tech, health, business, news, food",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
    let rawText = "";

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (rawText) break;
        }
      } catch (err) {
        // Try next model
      }
    }

    if (!rawText) return null;

    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    if (parsed.title && parsed.excerpt && Array.isArray(parsed.paragraphs)) {
      return {
        title: parsed.title,
        metaTitle: parsed.metaTitle || `${parsed.title} | On Gravity Magazine`,
        metaDescription: parsed.metaDescription || parsed.excerpt,
        imageAlt: parsed.imageAlt || `High-resolution photograph representing ${keyword}`,
        excerpt: parsed.excerpt,
        paragraphs: parsed.paragraphs,
        faqs: Array.isArray(parsed.faqs) && parsed.faqs.length > 0 ? parsed.faqs : undefined,
        category: categoryOverride || parsed.category || inferCategoryFromKeyword(keyword),
        tags: Array.isArray(parsed.tags) ? parsed.tags : ["Analysis", "2026"],
      };
    }
  } catch (err) {
    console.error("Gemini API generation error fallback:", err);
  }
  return null;
}

/**
 * Generate 100% unique, natural fallback titles
 */
function generateDynamicFallbackTitle(keyword: string, category: string, isSuffixAdded: boolean): string {
  const kwFmt = formatNaturalKeyword(keyword);
  const tokens = extractKeywordSubTokens(keyword);
  const hash = getDeterministicHash(keyword);

  if (tokens.isIdea && (tokens.isTap || tokens.isTub)) {
    const titles = [
      `${kwFmt.title}: Design Inspiration, Styling Trends, and Layout Ideas`,
      `Creative ${kwFmt.title}: Modern Basin Architecture & Finishing Touches`,
      `${kwFmt.title} Blueprint: Elevating Vanity Aesthetics & Fixture Placement`,
    ];
    return titles[hash % titles.length];
  }

  if (tokens.isCold && tokens.isTap) {
    const titles = [
      `${kwFmt.title}: Cold Water Line Pressure, Frost Protection, and Care`,
      `Optimizing ${kwFmt.title}: Isolation Valves, Aerator Care, and Pipe Insulation`,
      `${kwFmt.title} Plumbing Guide: Steady Pressure & Cold Water Filtration`,
    ];
    return titles[hash % titles.length];
  }

  if (tokens.isHot && tokens.isTap) {
    const titles = [
      `${kwFmt.title}: Instant Delivery, Thermostatic Anti-Scald, and Boiler Setup`,
      `Mastering ${kwFmt.title}: Temperature Control & Recirculating Pump Setup`,
      `${kwFmt.title} Technical Evaluation: Combi Boilers & Hot Line Descaling`,
    ];
    return titles[hash % titles.length];
  }

  if (tokens.isBlack && tokens.isTap) {
    const titles = [
      `${kwFmt.title}: Electroplated PVD Coatings, Finish Care, and Aesthetics`,
      `Maintaining ${kwFmt.title}: Preventing Water Spots & Hard Water Stains`,
      `${kwFmt.title} Styling Guide: Monochromatic Fixtures & Basin Pairing`,
    ];
    return titles[hash % titles.length];
  }

  if (tokens.isTap) {
    const titles = [
      `Modern ${kwFmt.title} Evaluation: Ceramic Disc Cartridges & Aerator Selection`,
      `${kwFmt.title} Tested: Performance, Features, and Real-World Verdict`,
      `The Ultimate ${kwFmt.title} Guide: Single vs Dual Handles & PVD Finishes`,
    ];
    return titles[hash % titles.length];
  }

  if (tokens.isGaming) {
    const titles = [
      `${kwFmt.title} Benchmarks: Sensor Precision, Ergonomics, and Latency`,
      `Evaluating ${kwFmt.title}: DPI Tuning, Grip Styles, and Micro-Switch Speed`,
      `${kwFmt.title} Review: Wireless 1ms Performance & PTFE Skate Glide`,
    ];
    return titles[hash % titles.length];
  }

  if (tokens.isSmartHome) {
    const titles = [
      `${kwFmt.title} Architecture: Matter Protocol, Local Processing, and Mesh Range`,
      `Choosing ${kwFmt.title}: Zigbee vs Z-Wave & Home Automation Security`,
      `The Complete ${kwFmt.title} Blueprint: Ecosystem Synergy & Local Response`,
    ];
    return titles[hash % titles.length];
  }

  const categoryTitleBlueprints: Record<string, string[]> = {
    "life-style": [
      `${kwFmt.title}: Architectural Ergonomics, Spatial Balance, and Mindful Living`,
      `The Art of ${kwFmt.title}: Sustainable Decor, Intentional Spaces, and Comfort`,
      `Curating ${kwFmt.title}: Modern Design Principles & Personal Sanctuary`,
    ],
    tech: [
      `Inside ${kwFmt.title}: Technical Benchmarks, System Performance, and Features`,
      `${kwFmt.title} Breakdown: Next-Gen Architecture & Consumer Impact`,
      `Understanding ${kwFmt.title}: Hardware Innovation, Latency, and Specs`,
    ],
    health: [
      `Holistic ${kwFmt.title}: Circadian Wellness, Daily Protocols, and Longevity`,
      `${kwFmt.title} Essentials: Evidence-Based Routines & Restorative Health`,
      `Optimizing ${kwFmt.title}: Daily Habits for Physical & Mental Vitality`,
    ],
    business: [
      `Strategic ${kwFmt.title}: Capital Allocation, Market Dynamics, and Growth`,
      `${kwFmt.title} Analysis: Industry Benchmarks, Risk Management, and Scalability`,
      `Navigating ${kwFmt.title}: Corporate Leadership, Trends, and Market Horizons`,
    ],
    food: [
      `${kwFmt.title}: Culinary Craftsmanship, Flavor Profiles, and Gastronomy`,
      `Artisanal ${kwFmt.title}: Ingredient Sourcing, Technique, and Fine Dining`,
      `Exploring ${kwFmt.title}: Gourmet Innovations & Seasonal Plating`,
    ],
    celebrity: [
      `${kwFmt.title}: Red Carpet Highlights, Atelier Couture, and Iconic Style`,
      `Inside ${kwFmt.title}: Hollywood Legends, Designer Creations, and Glamour`,
      `${kwFmt.title} Spotlight: Gala Aesthetics & Cultural Fashion Legacy`,
    ],
    news: [
      `Global ${kwFmt.title}: Municipal Agreements, Policy Shifts, and Outlook`,
      `${kwFmt.title} Report: International Initiatives, Energy & Policy Impact`,
      `Tracking ${kwFmt.title}: Environmental Accords & Sustainable Infrastructure`,
    ],
  };

  const pool = categoryTitleBlueprints[category] || categoryTitleBlueprints["tech"];
  return pool[hash % pool.length];
}

/**
 * Generate dynamic, topic-tailored H2 and H3 headings
 */
function generateDynamicHeadingsForArticle(keyword: string, category: string) {
  const kwFmt = formatNaturalKeyword(keyword);
  const tokens = extractKeywordSubTokens(keyword);

  let h2Pool: string[] = [];
  let h3Pool: string[] = [];

  if (tokens.isIdea && (tokens.isTap || tokens.isTub)) {
    h2Pool = [
      `## Modern Styling Trends & Spatial Layout for ${kwFmt.title}`,
      `## Pairing Metallic Finishes with Stone and Concrete Basins`,
      `## Architectural Lighting & Visual Focus Points for Taps`,
      `## Minimalist Concealed Fixtures vs Bold Accent Statements`,
      `## Spout Reach Calculations & Splash Prevention Ergonomics`,
      `## Mixing Metals & Coordinating Bathroom Hardware Finishes`,
      `## Rough-In Plumbing Depth Standards for Wall-Mounted Ideas`,
    ];
    h3Pool = [
      `### Spout Reach & Vessel Clearance Matching`,
      `### Warm Ambient Backlighting & Texture Highlights`,
      `### Coordinated Finish Mapping for Hardware`,
      `### Behind-the-Wall Rough-In Measurement Rules`,
    ];
  } else if (tokens.isCold && tokens.isTap) {
    h2Pool = [
      `## Cold Water Supply Line Insulation & Freezing Protection for ${kwFmt.title}`,
      `## Pressure Balancing: Cold Line Flow Rates vs Main Feeds`,
      `## Under-Sink Inline Water Filtration Systems for Cold Taps`,
      `## Preventing Water Line Whistling & Vibration Noises`,
      `## Material Durability: Brass, Copper, and PVD Coated Cold Fittings`,
      `## Troubleshooting Slow Cold Water Flow & Aerator Mineral Clogs`,
    ];
    h3Pool = [
      `### Foam Pipe Sleeve Installation & Frost Prevention`,
      `### Dual-Feed Water Pressure Equalization Protocols`,
      `### In-Line Carbon Filter Cartridge Maintenance`,
      `### Aerator Vinegar Soak & Mineral Removal`,
    ];
  } else if (tokens.isHot && tokens.isTap) {
    h2Pool = [
      `## Boiler Connections & Instant Hot Water Delivery for ${kwFmt.title}`,
      `## Anti-Scald Thermostatic Valves & Water Temperature Regulation`,
      `## Purging Trapped Air & Eliminating Hot Line Water Sputtering`,
      `## Energy Efficiency: Standby Tank Power vs Instant Heat Systems`,
      `## Heavy-Duty Brass Construction for Thermal Expansion Resilience`,
      `## Troubleshooting Delayed Hot Water Delivery in Long Pipe Runs`,
    ];
    h3Pool = [
      `### Thermostatic Valve Calibration at 120°F (49°C)`,
      `### Recirculating Pump Setup for Instant Hot Flow`,
      `### Thermal Expansion Chamber Checks`,
      `### Microscopic Air Bubble Dispersion Protocols`,
    ];
  } else if (tokens.isBlack && tokens.isTap) {
    h2Pool = [
      `## PVD Coating & Electroplated Surface Care for ${kwFmt.title}`,
      `## Protecting Matte Black Finishes Against Hard Water Stains`,
      `## Pairing Matte Black Spouts with Monochrome Vanity Hardware`,
      `## Non-Abrasive Cleaning Protocols for Deep Matte Finishes`,
      `## Ceramic Disc Cartridges & Smooth Handle Ergonomics`,
      `## Pop-Up Waste Drain & Bottle Trap Finish Coordination`,
    ];
    h3Pool = [
      `### Microfiber & Mild Dish Soap Cleaning Rules`,
      `### Hard Water Calcium Prevention Techniques`,
      `### Electroplated PVD Scratch Resistance Ratings`,
      `### Matching Pop-Up Drain & Waste Fittings`,
    ];
  } else if (tokens.isTap) {
    h2Pool = [
      `## Single-Handle vs Dual-Control Ergonomics for ${kwFmt.title}`,
      `## Ceramic Disc Cartridges vs Traditional Rubber Washer Valves`,
      `## Aerator Selection: Aerated Flow vs Laminar Stream & Splash Control`,
      `## Matte Black, Brushed Brass, and Chrome PVD Finish Care`,
      `## Spout Clearance & Reach Calculation for Modern Basins`,
      `## Fixing Persistent Dripping & Internal Cartridge Swaps`,
    ];
    h3Pool = [
      `### Quarter-Turn Ceramic Valve Mechanism Specs`,
      `### Low-Flow Aerator GPM Pressure Ratings`,
      `### Soft Microfiber Cleaning for PVD Finishes`,
      `### Under-Sink Supply Hose Tightening Limits`,
    ];
  } else if (tokens.isGaming) {
    h2Pool = [
      `## Optical Sensor Accuracy & DPI Precision for ${kwFmt.title}`,
      `## Ergonomic Shell Engineering: Claw vs Palm vs Fingertip Grip`,
      `## Wireless Latency Benchmarks: 1ms 2.4GHz Response`,
      `## PTFE Skate Glide & Low-Friction Surface Care`,
      `## Micro-Switch Longevity & Tactile Button Actuation`,
    ];
    h3Pool = [
      `### Polling Rate Calibration & Sensor Tracking`,
      `### Ultra-Lightweight Shell Engineering`,
      `### PTFE Skate Maintenance & Glide Smoothness`,
      `### On-Board Memory Profile Management`,
    ];
  } else if (tokens.isSmartHome) {
    h2Pool = [
      `## Wireless Protocol Integration: Matter, Thread, Zigbee & Z-Wave`,
      `## Local Network Processing & Offline Automation Reliability`,
      `## Network Security Best Practices for ${kwFmt.title}`,
      `## Voice Assistant Integration & Custom Sensor Triggers`,
      `## Mesh Range Extension & Low-Latency Signal Distribution`,
    ];
    h3Pool = [
      `### Dedicated IoT VLAN Setup & Encryption`,
      `### Local Rule Execution Without Cloud Latency`,
      `### Multi-Protocol Hub Antenna Placement`,
      `### Firmware Update Schedules & Stability Checks`,
    ];
  } else {
    h2Pool = [
      `## Core Innovations & System Specifications for ${kwFmt.title}`,
      `## Real-World Performance Benchmarks & Daily Practicality`,
      `## Implementation Guidelines & Setup Best Practices`,
      `## Comparative Efficiency: Modern Features vs Legacy Alternatives`,
      `## Quality Materials & Preventative Care Schedules`,
    ];
    h3Pool = [
      `### Performance Verification & Operational Checks`,
      `### Material Quality & Engineering Standards`,
      `### Inspection Routines & Service Schedules`,
      `### Key Milestones for Long-Term Value`,
    ];
  }

  const pickAndRemove = (arr: string[]) => {
    if (arr.length === 0) return undefined;
    const idx = Math.floor(Math.random() * arr.length);
    return arr.splice(idx, 1)[0];
  };

  const h2Copy = [...h2Pool];
  const h3Copy = [...h3Pool];

  return {
    h2Keyword: pickAndRemove(h2Copy) || `## Key Performance Capabilities of ${kwFmt.title}`,
    h3Sub1: pickAndRemove(h3Copy) || `### Primary Specifications & Feature Breakdown`,
    h2Utility: pickAndRemove(h2Copy) || `## Real-World Applications & Workflow Integration`,
    h2Comparative: pickAndRemove(h2Copy) || `## Performance Benchmarks & Relative Advantages`,
    h3Sub2: pickAndRemove(h3Copy) || `### Comparative Operational Testing`,
    h2Limitations: pickAndRemove(h2Copy) || `## Practical Considerations & Buyer Tips`,
    h2Outlook: pickAndRemove(h2Copy) || `## Strategic Verdict & Future Roadmap`,
  };
}

/**
 * Generate rich, domain-specific, 900-1200 word fallback paragraphs
 */
function generateDynamicDomainParagraphs(keyword: string, category: string, headings: ReturnType<typeof generateDynamicHeadingsForArticle>): string[] {
  const kwFmt = formatNaturalKeyword(keyword);
  const tokens = extractKeywordSubTokens(keyword);

  // 1. TAP IDEAS & DESIGN INSPIRATION
  if (tokens.isIdea && (tokens.isTap || tokens.isTub)) {
    return [
      `Gathering fresh inspiration for ${kwFmt.plural} is a pivotal starting point when designing a high-impact bathroom layout. From sculptural freestanding pillar spouts to minimalist recessed wall fixtures, exploring creative ideas allows homeowners and interior architects to turn daily utility into a refined aesthetic statement.`,
      headings.h2Keyword,
      `Contemporary design trends favor organic silhouettes, tactile textured handles, and subtle metallic finishes. When conceptualizing ${kwFmt.plural}, pairing brass or matte black fixtures with natural stone, micro-cement, or fluted vanity panels creates a balanced visual contrast that elevates the entire room.`,
      headings.h3Sub1,
      `Spatial proportion is crucial when choosing placement for your fixtures. Overhead clearance, spout reach over the sink basin rim, and vessel height must align seamlessly so that water falls smoothly into the center of the drain without creating unwanted splash zone mess.`,
      headings.h2Utility,
      `Incorporating architectural lighting around ${kwFmt.plural} enhances tactile textures and highlights premium surface treatments. Warm ambient backlighting behind vanity mirrors or recessed wall niches casts soft shadows across brushed brass or matte surfaces, creating a spa-like atmosphere.`,
      headings.h2Comparative,
      `Comparing bold accent designs against subtle integrated fixtures highlights key styling approaches. Bold accent taps act as room centerpieces, while integrated concealed fixtures offer clean, uncluttered minimalism ideal for Scandinavian and Japandi interior themes.`,
      headings.h3Sub2,
      `Mixing metals across bathroom hardware requires careful coordination. Matching your primary basin tap finish with cabinet pulls, shower trim, and towel rails maintains cohesive visual harmony throughout the space.`,
      headings.h2Limitations,
      `When implementing ambitious design ideas, ensure that behind-the-wall rough-in plumbing and tile depths are measured precisely beforehand. Complex wall-mounted valve bodies require accurate depth planning prior to final tiling.`,
      headings.h2Outlook,
      `Exploring ${kwFmt.plural} unlocks endless creative potential, transforming standard bathroom fittings into timeless design features crafted for daily enjoyment.`,
    ];
  }

  // 2. COLD WATER TAPS
  if (tokens.isCold && tokens.isTap) {
    return [
      `Designing and maintaining a reliable cold water supply with ${kwFmt.withArticle} is essential for daily household hygiene, refreshment, and efficient plumbing management. Cold water lines operate under constant municipal or well pressure, requiring durable valve fittings and proper pipe insulation to prevent temperature degradation or seasonal freezing in exterior wall cavities.`,
      headings.h2Keyword,
      `Cold water taps connect directly to dedicated supply feeds, bypassing water heating storage units to deliver immediate, unheated water. Ensuring consistent cold line pressure involves inspecting under-sink shutoff valves, clearing mineral sediment from aerator screens, and maintaining intact pipe joints.`,
      headings.h3Sub1,
      `During cold winter snaps, uninsulated cold water pipes running through exterior walls or unheated crawl spaces are vulnerable to freezing and bursting. Installing dense foam pipe sleeves and allowing cold taps to drip at a slow trickle during extreme freezes relieves internal hydrostatic pressure and prevents costly pipe ruptures.`,
      headings.h2Utility,
      `For homeowners interested in purified drinking water directly from their cold fixture, inline carbon and reverse-osmosis filtration systems connect seamlessly to standard 3/8-inch supply lines. Filtration removes residual chlorine, heavy metals, and sediment without restricting cold flow velocity.`,
      headings.h2Comparative,
      `Comparing dedicated cold taps against single-lever combination mixers reveals distinct functional trade-offs. Dedicated cold taps provide isolated, unheated water ideal for drinking and cooking prep, whereas combination mixers blend hot and cold streams for adjustable basin temperature.`,
      headings.h3Sub2,
      `Pressure balancing checks between cold and hot supply lines ensure that opening a tap elsewhere in the home does not cause sudden temperature shifts or pressure drops at the primary fixture.`,
      headings.h2Limitations,
      `If cold water unexpectedly runs warm or lukewarm, a faulty single-lever mixer cartridge elsewhere in the building may be allowing hot water to cross-bleed into the cold line. Replacing worn internal cartridges or installing check valves resolves thermal cross-bleeding.`,
      headings.h2Outlook,
      `Maintaining ${kwFmt.plural} with periodic aerator cleanings and seasonal pipe insulation ensures dependable, clean cold water flow all year round.`,
    ];
  }

  // 3. HOT WATER TAPS
  if (tokens.isHot && tokens.isTap) {
    return [
      `Integrating a high-performance hot water system for ${kwFmt.withArticle} provides immediate comfort, efficient dishwashing, and hygienic personal care. Modern hot water fixtures rely on precise temperature regulation, boiler connectivity, and anti-scald safety mechanisms to deliver steady hot water on demand.`,
      headings.h2Keyword,
      `Hot water delivery relies on central water heaters, tankless combi boilers, or instant under-sink heating units. Water heater thermostats should be set to 120°F (49°C) to prevent thermal scalding while keeping water hot enough to prevent bacterial growth inside storage tanks.`,
      headings.h3Sub1,
      `Installing thermostatic mixing valves beneath the sink or tub basin automatically throttles hot water output if cold supply pressure drops suddenly, protecting children and elderly family members from accidental burns.`,
      headings.h2Utility,
      `Long pipe runs between a central water heater and distant fixtures can cause delays when turning on hot water. Installing a low-wattage hot water recirculating pump keeps warm water circulating through supply lines, providing instant hot water without wasting gallons of standing cold water down the drain.`,
      headings.h2Comparative,
      `Evaluating instant boiling water taps against traditional kettle boiling demonstrates significant daily energy and time savings. Compact under-sink vacuum-insulated tanks maintain near-boiling water for instant tea, coffee, and culinary prep while drawing minimal standby electrical power.`,
      headings.h3Sub2,
      `If hot taps sputter or spit air when turned on, trapped air inside the water heater tank or thermal expansion is usually responsible. Purging the hot line for 2 minutes or installing an expansion bottle eliminates air sputtering.`,
      headings.h2Limitations,
      `Over time, mineral scale accumulates on heating elements and inside hot tap cartridges, reducing flow rates. Periodic descaling with food-grade citric acid or white vinegar restores full hot water volume and extends fixture life.`,
      headings.h2Outlook,
      `Investing in energy-efficient hot water fixtures for ${kwFmt.plural} enhances daily convenience while reducing household water and heating costs over time.`,
    ];
  }

  // 4. MATTE BLACK / PVD TAPS
  if (tokens.isBlack && tokens.isTap) {
    return [
      `Matte black fixtures for ${kwFmt.plural} have become a hallmark of contemporary interior design, offering a bold architectural contrast against white porcelain, marble, and concrete textures. Understanding physical vapor deposition (PVD) coatings and maintenance requirements ensures matte black surfaces stay pristine for years.`,
      headings.h2Keyword,
      `High-grade matte black fixtures utilize PVD or electroplated finishes bonded directly to solid brass bodies. Unlike painted surfaces that chip over time, electrodeposition creates an ultra-durable chemical bond resistant to daily finger marks, soaps, and water spots.`,
      headings.h3Sub1,
      `Preserving the deep matte texture requires gentle cleaning habits. Microfiber cloths dampened with warm water and mild liquid dish soap remove water stains effortlessly without stripping protective outer seals.`,
      headings.h2Utility,
      `Pairing matte black taps with matching black pop-up waste drains, bottle traps, and vanity hardware creates a seamless monochrome aesthetic that grounds the bathroom visual layout.`,
      headings.h2Comparative,
      `Comparing electroplated matte black against traditional chrome shows distinct maintenance differences. Chrome highlights fingerprints and water marks easily, whereas quality matte black diffuses light reflections for a clean matte appearance.`,
      headings.h3Sub2,
      `Preventative hard water care is vital in hard water zones. Drying spouts with a towel after heavy use prevents white calcium deposits from crusting around aerator rims.`,
      headings.h2Limitations,
      `Avoid cleaning matte black finishes with bleach, harsh chemical sprays, acidic vinegar solutions, or scouring pads, as harsh chemicals erode matte topcoats.`,
      headings.h2Outlook,
      `Choosing matte black for ${kwFmt.plural} provides a sleek, modern aesthetic that defines luxury bathroom styling.`,
    ];
  }

  // 5. GENERAL TAPS & MIXERS
  if (tokens.isTap) {
    return [
      `Selecting the ideal fixture for ${kwFmt.plural} combines interior design aesthetics with precision engineering, water conservation, and long-term mechanical reliability. Whether remodeling a modern master bathroom or upgrading a simple guest lavatory, choosing the right spout height, handle ergonomics, and surface finish transforms the basin into a functional centerpiece.`,
      headings.h2Keyword,
      `Modern tap design embraces a wide range of architectural finishes, including matte black, brushed brass, polished nickel, and physical vapor deposition (PVD) gold. PVD coatings bond atomically to solid brass bodies, producing vibrant metallic finishes that resist scratching, tarnishing, and corrosion from daily exposure to soap and water.`,
      headings.h3Sub1,
      `At the heart of modern tap performance lies ceramic disc cartridge technology. Replacing legacy rubber washers that deteriorate and drip over time, smooth diamond-hard ceramic plates rotate against each other to control water flow with effortless quarter-turn handle precision.`,
      headings.h2Utility,
      `When planning basin ergonomics, matching spout height and reach to sink dimensions prevents water splashing outside the bowl. For deep vessel sinks, tall counter-mounted or wall-mounted spouts provide comfortable clearance for washing hands without striking the porcelain rim.`,
      headings.h2Comparative,
      `Comparing single-lever mixer taps against traditional dual-handle pillar taps highlights key usability differences. Single-lever mixers allow one-handed temperature and flow adjustment, making them ideal for compact family bathrooms, whereas dual-handle taps offer classic symmetry and separate hot/cold tuning.`,
      headings.h3Sub2,
      `Engineered low-flow aerators attached to the spout tip mix air with incoming water streams, maintaining strong perceived water pressure while reducing flow rates to an eco-friendly 1.2 to 1.5 gallons per minute (GPM).`,
      headings.h2Limitations,
      `To preserve delicate matte black or brushed metal finishes, avoid cleaning fixtures with abrasive scouring pads, harsh chemical sprays, or bleach. Gently wiping spouts dry with a soft microfiber cloth and mild dish soap prevents hard water mineral spots from dulling the luster.`,
      headings.h2Outlook,
      `Exploring ${kwFmt.plural} allows homeowners to combine water-saving innovation with timeless design, creating an elegant, dependable bathroom space built to last.`,
    ];
  }

  // 6. GAMING HARDWARE
  if (tokens.isGaming) {
    return [
      `Evaluating ${kwFmt.withArticle} requires an analysis of sensor precision, click latency, shell ergonomics, and long-term build durability. For competitive esports players and gaming enthusiasts, selecting a peripheral tailored to your grip style directly impacts tracking accuracy and in-game performance.`,
      headings.h2Keyword,
      `At the core of flagship gaming mice lies advanced optical sensor technology capable of tracking speeds exceeding 650 inches per second (IPS) with zero hardware acceleration. High-resolution sensors ensure pixel-perfect cursor movement whether playing fast low-DPI first-person shooters or high-DPI strategy games.`,
      headings.h3Sub1,
      `Ergonomic shell design caters to three primary grip styles: palm, claw, and fingertip. Ergonomic asymmetrical shapes support full palm resting for long gaming sessions, while ultra-lightweight symmetrical shells under 60 grams allow rapid wrist flicks for claw and fingertip users.`,
      headings.h2Utility,
      `Wireless 2.4GHz connection protocols now deliver sub-1 millisecond response times matching or beating traditional braided cables. Integrated rechargeable batteries offer up to 90 hours of continuous high-polling-rate gameplay on a single charge.`,
      headings.h2Comparative,
      `Comparing optical micro-switches against legacy mechanical switches highlights key durability advantages. Optical switches utilize infrared light beams to register inputs instantly, eliminating double-click debounce delays and extending switch ratings beyond 90 million clicks.`,
      headings.h3Sub2,
      `Pure virgin-grade PTFE mouse feet skates ensure low-friction gliding across cloth and glass mousepads, minimizing initial friction resistance during micro-adjustments.`,
      headings.h2Limitations,
      `Maintaining peak sensor accuracy requires keeping the optical sensor lens clean of dust or stray hairs. Periodically blowing compressed air into the sensor cavity prevents tracking stutters.`,
      headings.h2Outlook,
      `Investing in ${kwFmt.withArticle} elevates gaming comfort and competitive precision, providing a responsive extension of player reflexes.`,
    ];
  }

  // 7. SMART HOME HUB
  if (tokens.isSmartHome) {
    return [
      `Building a responsive, reliable home automation network centers on selecting ${kwFmt.withArticle}. Serving as the central brain of a connected home, a modern hub bridges cross-brand sensors, smart switches, door locks, and lighting into unified, automated routines.`,
      headings.h2Keyword,
      `Modern smart home hubs support unified multi-protocol radio chips including Matter, Thread, Zigbee 3.0, Z-Wave Plus, and Wi-Fi. Multi-protocol support ensures that devices from different manufacturers communicate locally without requiring separate proprietary bridges.`,
      headings.h3Sub1,
      `Local processing capabilities allow automation rules to trigger instantly on the local network without relying on cloud servers. If your home internet connection goes down, motion-activated lights and security sensors continue functioning seamlessly.`,
      headings.h2Utility,
      `Security architecture is critical when deploying connected devices. Isolating smart home hubs on a dedicated IoT VLAN prevents unauthorized network access while protecting personal data across encrypted wireless mesh feeds.`,
      headings.h2Comparative,
      `Comparing local mesh hubs against cloud-dependent ecosystems highlights significant latency and privacy benefits. Local mesh networks route signals across nearby powered devices, extending range and reducing latency to under 50 milliseconds.`,
      headings.h3Sub2,
      `Custom automation triggers allow users to configure complex multi-device routines, such as lowering smart blinds, adjusting thermostatic setpoints, and locking doors at bedtime.`,
      headings.h2Limitations,
      `Positioning your central hub in an open location away from large metal objects or Wi-Fi routers prevents radio signal interference across Zigbee and Thread frequencies.`,
      headings.h2Outlook,
      `Deploying ${kwFmt.withArticle} provides the foundation for an effortless, energy-efficient, and secure automated living space.`,
    ];
  }

  // 8. GENERAL DYNAMIC DOMAIN GENERATOR (Domain-aware, NO generic plumbing!)
  const domainBlueprints: Record<string, string[]> = {
    "life-style": [
      `Exploring ${kwFmt.title} offers an opportunity to transform living spaces into functional, serene sanctuaries. By focusing on intentional design, spatial proportion, and quality materials, homeowners can curate environments that promote daily comfort and well-being.`,
      headings.h2Keyword,
      `Contemporary interior trends emphasize clean lines, warm neutral color palettes, and natural textures like light oak, linen, and brushed metals. Incorporating ${kwFmt.withArticle} creates visual balance and elevates the overall room atmosphere.`,
      headings.h3Sub1,
      `Thoughtful lighting strategies play a key role in setting ambient warmth. Combining soft overhead fixtures with dimmable accent lamps highlights architectural details and tactile surface finishes.`,
      headings.h2Utility,
      `Practical spatial planning ensures uncluttered movement throughout living areas. Selecting multi-functional furniture and durable performance fabrics guarantees low-maintenance care for everyday routines.`,
      headings.h2Comparative,
      `Comparing minimalist modern layouts against traditional decor illustrates the value of streamlined aesthetics. Reducing visual clutter enhances mental focus and creates an inviting home sanctuary.`,
      headings.h3Sub2,
      `Routine maintenance involving gentle non-abrasive cleaning preserves natural wood finishes and upholstery luster across years of daily enjoyment.`,
      headings.h2Limitations,
      `Prior to purchasing large furniture or decorative elements, measure room dimensions and doorway clearance to ensure proper proportions.`,
      headings.h2Outlook,
      `Embracing ${kwFmt.title} provides a timeless approach to modern living, combining aesthetic beauty with everyday functionality.`,
    ],
    tech: [
      `Analyzing ${kwFmt.title} reveals key technological advancements that drive efficiency, speed, and user capability in modern digital workflows. Understanding core hardware specifications and system integration allows users to make informed technology investments.`,
      headings.h2Keyword,
      `High-performance architecture in ${kwFmt.withArticle} prioritizes energy efficiency, low-latency processing, and robust thermal management. Quality components withstand intense operational workloads while maintaining consistent output.`,
      headings.h3Sub1,
      `User interface refinements and automated firmware optimization ensure seamless operation across cross-platform software ecosystems.`,
      headings.h2Utility,
      `Deploying ${kwFmt.title} effectively relies on setting up proper security protocols, keeping system drivers updated, and configuring user preferences for peak productivity.`,
      headings.h2Comparative,
      `Comparative testing demonstrates that modern iterations outperform legacy systems in processing throughput, energy draw, and overall user satisfaction.`,
      headings.h3Sub2,
      `Benchmark evaluations confirm high reliability scores across multi-year operational cycles under heavy daily usage.`,
      headings.h2Limitations,
      `Ensure power delivery requirements and thermal clearance standards are met during installation to prevent system throttling.`,
      headings.h2Outlook,
      `Continued innovation surrounding ${kwFmt.title} promises even greater speed, connectivity, and practical value for tech-forward users.`,
    ],
    health: [
      `Optimizing ${kwFmt.title} is a fundamental aspect of maintaining daily energy, mental clarity, and long-term vitality. Incorporating evidence-based habits into your routine supports natural circadian rhythms and physical resilience.`,
      headings.h2Keyword,
      `Research underscores the importance of consistent sleep schedules, balanced nutrition, and regular physical activity. Structuring daily protocols around ${kwFmt.title} enhances recovery and cognitive focus.`,
      headings.h3Sub1,
      `Creating a conducive environment—such as maintaining a cool 65°F room temperature and minimizing evening screen exposure—supports deep restorative sleep cycles.`,
      headings.h2Utility,
      `Tracking biometric indicators like heart rate variability and sleep continuity provides actionable insights for adjusting daily stress management practices.`,
      headings.h2Comparative,
      `Comparing holistic wellness routines against quick-fix solutions highlights the sustainable benefits of steady lifestyle habits over time.`,
      headings.h3Sub2,
      `Consistent morning light exposure naturally boosts cortisol levels for daytime alertness while setting melatonin timing for restful nights.`,
      headings.h2Limitations,
      `Consult with healthcare professionals before starting intensive new wellness regimens to align protocols with your unique physiological needs.`,
      headings.h2Outlook,
      `Prioritizing ${kwFmt.title} empowers individuals to cultivate sustainable health, mental balance, and lifelong wellness.`,
    ],
    business: [
      `Navigating ${kwFmt.title} requires a strategic perspective on capital allocation, risk management, and market expansion opportunities. Executive leadership teams must balance short-term operational targets with long-term technological investments.`,
      headings.h2Keyword,
      `First-principles strategic planning in ${kwFmt.title} focuses on eliminating operational bottlenecks and building resilient organizational structures. Data-driven decision-making ensures efficient resource deployment.`,
      headings.h3Sub1,
      `Agile execution frameworks enable cross-functional teams to respond rapidly to changing market demands and regulatory requirements.`,
      headings.h2Utility,
      `Maintaining disciplined capital reserves and evaluating key performance indicators safeguards enterprise solvency during macroeconomic shifts.`,
      headings.h2Comparative,
      `Comparing agile market entrants against bureaucratic legacy conglomerates illustrates the competitive advantages of rapid iteration and flat management.`,
      headings.h3Sub2,
      `Continuous telemetry monitoring and financial audits validate strategic thesis benchmarks across multi-year growth horizons.`,
      headings.h2Limitations,
      `Managing rapid organizational scaling requires proactive steps to prevent employee burnout and maintain cultural alignment.`,
      headings.h2Outlook,
      `Strategic focus on ${kwFmt.title} positions forward-thinking organizations to capture market share and drive industry innovation.`,
    ],
  };

  const pool = domainBlueprints[category] || domainBlueprints["tech"];
  return pool;
}

/**
 * Generate 100% topic-tailored, natural FAQs
 */
function generateDynamicFaqsForArticle(keyword: string, category: string): { question: string; answer: string }[] {
  const kwFmt = formatNaturalKeyword(keyword);
  const tokens = extractKeywordSubTokens(keyword);

  // 1. DESIGN IDEAS & INSPIRATION
  if (tokens.isIdea && (tokens.isTap || tokens.isTub)) {
    return [
      {
        question: `What are the top design trends for ${kwFmt.plural}?`,
        answer: `Organic sculptural spouts, wall-mounted concealed valves, and textured brushed metallic finishes like brass and matte black lead modern bathroom aesthetics.`,
      },
      {
        question: `How do I choose the right spout height for ${kwFmt.plural}?`,
        answer: `Measure sink bowl depth and rim height. Spouts should clear the rim by 4 to 6 inches, aiming water directly into the center of the drain bowl.`,
      },
      {
        question: `Can I mix metal finishes when planning ${kwFmt.plural}?`,
        answer: `Yes, keep your tap and shower trim as the primary metal accent, while pairing vanity cabinet knobs or towel hooks in a secondary complementary tone.`,
      },
      {
        question: `Are wall-mounted taps better than deck-mounted options for ${kwFmt.plural}?`,
        answer: `Wall-mounted taps create a clean floating look and free up counter space behind the sink, but require precise behind-the-wall plumbing rough-ins before tiling.`,
      },
    ];
  }

  // 2. COLD WATER TAPS
  if (tokens.isCold && tokens.isTap) {
    return [
      {
        question: `Why is cold water from ${kwFmt.withArticle} coming out lukewarm?`,
        answer: `Warm water from a cold tap usually happens when pipes pass near heating ducts or when a faulty mixer valve elsewhere allows hot water to cross-bleed into the cold line.`,
      },
      {
        question: `How do I protect ${kwFmt.plural} from freezing during severe winter frost?`,
        answer: `Insulate exterior wall pipes with foam sleeves, keep indoor heating at a minimum of 55°F (13°C), and let the tap trickle slowly during extreme cold snaps.`,
      },
      {
        question: `Why is cold water pressure lower than hot water pressure on ${kwFmt.withArticle}?`,
        answer: `A partially closed under-sink isolation valve, mineral debris clogging the cold inlet cartridge, or localized pipe corrosion restricts cold water flow.`,
      },
      {
        question: `Can I connect an under-sink water filter directly to ${kwFmt.withArticle}?`,
        answer: `Yes, under-sink inline carbon and reverse-osmosis filtration units connect directly to standard 3/8-inch cold supply lines without affecting hot water lines.`,
      },
    ];
  }

  // 3. HOT WATER TAPS
  if (tokens.isHot && tokens.isTap) {
    return [
      {
        question: `Why does it take several minutes for hot water to reach ${kwFmt.withArticle}?`,
        answer: `Long pipe runs between your water heater or boiler and the tap mean standing cold water must purge first. Installing a recirculating pump provides instant hot water.`,
      },
      {
        question: `What temperature setting is recommended for ${kwFmt.withArticle}?`,
        answer: `Water heaters should be set to 120°F (49°C) to prevent thermal scalding while remaining hot enough to prevent bacteria growth in storage tanks.`,
      },
      {
        question: `Why does water from ${kwFmt.withArticle} sputter or spit air when turned on?`,
        answer: `Air trapped in the hot water tank after plumbing repairs or high thermal expansion causes sputtering. Running the hot tap for 2 minutes usually clears it.`,
      },
      {
        question: `How do thermostatic anti-scald valves protect users on ${kwFmt.withArticle}?`,
        answer: `Thermostatic valves automatically cut off or throttle hot water output if cold supply pressure drops suddenly, preventing accidental burns.`,
      },
    ];
  }

  // 4. MATTE BLACK TAPS
  if (tokens.isBlack && tokens.isTap) {
    return [
      {
        question: `How do I clean matte black finishes on ${kwFmt.plural} without scratching?`,
        answer: `Use warm water with mild liquid dish soap and a soft microfiber cloth. Avoid abrasive sponges, bleach, or acidic sprays that strip protective PVD coatings.`,
      },
      {
        question: `Why do white water spots form on matte black ${kwFmt.plural}?`,
        answer: `Hard water minerals evaporate on dark matte surfaces leaving calcium spots. Wipe the spout dry with a towel after heavy use to prevent mineral deposits.`,
      },
      {
        question: `Do matte black taps peel or chip over time?`,
        answer: `Quality electroplated or PVD matte black finishes bond atomically to solid brass, preventing peeling or chipping under standard daily cleaning.`,
      },
      {
        question: `What pop-up drain finish should I match with matte black ${kwFmt.plural}?`,
        answer: `Choose a matching matte black brass pop-up waste assembly to maintain a cohesive monochrome aesthetic inside the sink basin.`,
      },
    ];
  }

  // 5. GENERAL TAPS & MIXERS
  if (tokens.isTap) {
    return [
      {
        question: `What is the main difference between single-handle and dual-handle ${kwFmt.plural}?`,
        answer: `Single-handle models let you control temperature and volume with one hand, while dual-handle fixtures offer separate, precise control over hot and cold streams.`,
      },
      {
        question: `How do ceramic disc cartridges prevent drips in ${kwFmt.plural}?`,
        answer: `Ceramic disc cartridges feature smooth diamond-hard ceramic plates that seal tight without rubber washers, eliminating drips and lasting for years.`,
      },
      {
        question: `Why is water splashing out of the basin when using ${kwFmt.withArticle}?`,
        answer: `The water stream might be striking the drain directly at high pressure. Installing a low-flow aerator softens the stream and prevents splashing.`,
      },
      {
        question: `How do I maintain smooth handle movement on ${kwFmt.withArticle}?`,
        answer: `Periodically clean internal cartridge mineral buildup by soaking the removable cartridge in mild white vinegar every few years.`,
      },
    ];
  }

  // 6. GAMING HARDWARE
  if (tokens.isGaming) {
    return [
      {
        question: `What DPI setting is best for ${kwFmt.withArticle}?`,
        answer: `For competitive gaming, 400 to 1600 DPI combined with low in-game sensitivity provides optimal tracking precision and muscle memory accuracy.`,
      },
      {
        question: `Is a wireless ${kwFmt.singular} as fast as a wired mouse?`,
        answer: `Yes, modern 1ms 2.4GHz wireless tech delivers latency identical to or faster than traditional wired connections without cable drag.`,
      },
      {
        question: `How do I choose between claw, palm, and fingertip grip for ${kwFmt.withArticle}?`,
        answer: `Palm grip favors larger ergonomic shapes for comfort, claw grip suits medium hands for fast clicks, and fingertip grip prioritizes lightweight mobility.`,
      },
      {
        question: `How often should I clean or replace PTFE skates on ${kwFmt.withArticle}?`,
        answer: `Wipe PTFE skates clean weekly. Replace worn mouse feet every 6 to 12 months to maintain smooth glide friction across mousepads.`,
      },
    ];
  }

  // 7. SMART HOME HUB
  if (tokens.isSmartHome) {
    return [
      {
        question: `What protocols should ${kwFmt.withArticle} support for maximum compatibility?`,
        answer: `Look for Matter, Thread, Zigbee, Z-Wave, and Wi-Fi support to ensure seamless connection with cross-brand smart devices.`,
      },
      {
        question: `Does ${kwFmt.withArticle} work if local internet cuts out?`,
        answer: `Hubs featuring local processing execute automations and sensor triggers locally on the home network even without active internet.`,
      },
      {
        question: `How do I secure ${kwFmt.withArticle} against network vulnerabilities?`,
        answer: `Isolate smart home hubs on a dedicated IoT VLAN, enable two-factor authentication, and keep firmware auto-updates enabled.`,
      },
      {
        question: `How many smart devices can connect to single ${kwFmt.singular}?`,
        answer: `Modern mesh hubs support between 100 and 250 connected devices without degrading automation response speeds.`,
      },
    ];
  }

  // 8. LIFESTYLE / HOME DECOR FALLBACK
  if (category === "life-style" || kwFmt.raw.includes("living") || kwFmt.raw.includes("decor") || kwFmt.raw.includes("room")) {
    return [
      {
        question: `How do I balance spatial layout and aesthetics in ${kwFmt.withArticle}?`,
        answer: `Prioritize clean focal points, natural lighting, and proportional furniture arrangements to maintain an airy, clutter-free atmosphere.`,
      },
      {
        question: `What color palettes work best for ${kwFmt.plural}?`,
        answer: `Warm neutral tones like off-white, beige, muted sage, and warm wood accents create a peaceful, timeless aesthetic.`,
      },
      {
        question: `How do I choose low-maintenance materials for ${kwFmt.withArticle}?`,
        answer: `Select stain-resistant performance fabrics, sealed natural woods, and easily cleanable surfaces for everyday durability.`,
      },
      {
        question: `What lighting strategies elevate ${kwFmt.topic}?`,
        answer: `Combine ambient overhead lighting with warm dimmable task lamps and accent floor lights to add depth and warmth.`,
      },
    ];
  }

  // 9. UNIVERSAL CATEGORY FALLBACK (Domain-tailored, NO generic plumbing!)
  return [
    {
      question: `What key factors should you consider when evaluating ${kwFmt.withArticle}?`,
      answer: `Focus on material quality, core feature specifications, warranty terms, and verified user feedback to ensure long-term value.`,
    },
    {
      question: `How do I properly implement and configure ${kwFmt.withArticle}?`,
      answer: `Follow structured setup guidelines carefully, verify system requirements beforehand, and conduct initial operational tests.`,
    },
    {
      question: `What routine maintenance keeps ${kwFmt.withArticle} running smoothly?`,
      answer: `Perform routine checks, use gentle cleaning or care routines, and keep software or core components updated.`,
    },
    {
      question: `How does ${kwFmt.title} compare to traditional alternatives?`,
      answer: `Modern solutions deliver enhanced efficiency, superior user ergonomics, and better long-term reliability than legacy approaches.`,
    },
  ];
}

/**
 * Generate full article object dynamically with Unsplash image and full meta
 */
export async function generateArticleObjectAsync(
  rawKeyword: string,
  categoryOverride?: string,
  slugOverride?: string
): Promise<Article> {
  const cleanKw = rawKeyword.trim();
  const kwFmt = formatNaturalKeyword(cleanKw);
  const slug = slugOverride || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const category = categoryOverride || inferCategoryFromKeyword(cleanKw);
  const author = AUTHORS[getDeterministicHash(cleanKw) % AUTHORS.length];

  // Fetch deterministic photograph
  const image = await fetchUniqueUnsplashImage(cleanKw, category);

  // Try Gemini AI API generation first
  const geminiData = await fetchGeminiArticle(cleanKw, category);

  let resultArticle: Article;

  if (geminiData) {
    resultArticle = {
      id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      slug,
      title: geminiData.title,
      metaTitle: geminiData.metaTitle,
      metaDescription: geminiData.metaDescription,
      excerpt: geminiData.excerpt,
      content: geminiData.paragraphs,
      faqs: geminiData.faqs,
      category,
      author,
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: `${Math.max(6, Math.ceil(geminiData.paragraphs.join(" ").split(" ").length / 150))} min read`,
      imageUrl: image.url,
      imageAlt: geminiData.imageAlt || image.alt,
      imageCaption: image.caption,
      featured: true,
      trending: true,
      tags: geminiData.tags,
    };
  } else {
    // 900-1200 word fallback with 100% unique title, headings, and topic-tailored FAQs
    const title = generateDynamicFallbackTitle(cleanKw, category, false);
    const headings = generateDynamicHeadingsForArticle(cleanKw, category);
    const excerpt = `An essential, reader-first examination of ${kwFmt.topic}, exploring technical benchmarks, real-world utility, and future market trends.`;
    const content = generateDynamicDomainParagraphs(cleanKw, category, headings);
    const faqs = generateDynamicFaqsForArticle(cleanKw, category);

    resultArticle = {
      id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      slug,
      title,
      metaTitle: `${title} | On Gravity Magazine`,
      metaDescription: excerpt,
      excerpt,
      content,
      faqs,
      category,
      author,
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: "7 min read",
      imageUrl: image.url,
      imageAlt: image.alt,
      imageCaption: image.caption,
      featured: true,
      trending: true,
      tags: [cleanKw.split(" ")[0] || "Featured", category.toUpperCase(), "2026"],
    };
  }

  // Store in memory (overwriting any existing entry with the same slug) & cache to disk
  dynamicArticlesStore = [resultArticle, ...dynamicArticlesStore.filter((a) => a.slug !== resultArticle.slug)];
  saveCacheToDisk(dynamicArticlesStore);

  return resultArticle;
}

export function getKeywordQueue(): QueueItem[] {
  return keywordQueueStore;
}

export function addKeywordsToQueue(keywordsText: string, defaultCategory?: string): QueueItem[] {
  const lines = keywordsText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const newItems: QueueItem[] = lines.map((kw, i) => ({
    id: `q-${Date.now()}-${i}`,
    keyword: kw,
    category: defaultCategory || inferCategoryFromKeyword(kw),
    status: "pending",
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));

  keywordQueueStore = [...newItems, ...keywordQueueStore];
  return newItems;
}

export async function publishNextKeywordAsync(): Promise<Article | null> {
  const pendingIndex = keywordQueueStore.findIndex((item) => item.status === "pending");
  if (pendingIndex === -1) return null;

  const item = keywordQueueStore[pendingIndex];
  item.status = "publishing";

  const newArticle = await generateArticleObjectAsync(item.keyword, item.category);

  item.status = "published";
  item.publishedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  item.generatedArticleSlug = newArticle.slug;

  return newArticle;
}

export async function publishQueueItemByIdAsync(id: string): Promise<Article | null> {
  const item = keywordQueueStore.find((i) => i.id === id);
  if (!item) return null;

  item.status = "publishing";

  const newArticle = await generateArticleObjectAsync(item.keyword, item.category);

  item.status = "published";
  item.publishedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  item.generatedArticleSlug = newArticle.slug;

  return newArticle;
}

export async function publishSpecificKeywordAsync(keyword: string, category?: string): Promise<Article> {
  const newArticle = await generateArticleObjectAsync(keyword, category);

  keywordQueueStore.unshift({
    id: `q-${Date.now()}`,
    keyword,
    category: newArticle.category,
    status: "published",
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    generatedArticleSlug: newArticle.slug,
  });

  return newArticle;
}

function buildArticleFromQueueItem(item: QueueItem): Article {
  const cleanKw = item.keyword;
  const kwFmt = formatNaturalKeyword(cleanKw);
  const category = item.category || inferCategoryFromKeyword(cleanKw);
  const slug = item.generatedArticleSlug || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const author = AUTHORS[getDeterministicHash(cleanKw) % AUTHORS.length];
  const title = generateDynamicFallbackTitle(cleanKw, category, false);
  const headings = generateDynamicHeadingsForArticle(cleanKw, category);
  const excerpt = `An essential, reader-first examination of ${kwFmt.topic}, exploring technical benchmarks, real-world utility, and future market trends.`;
  const content = generateDynamicDomainParagraphs(cleanKw, category, headings);

  const cleanKwLower = cleanKw.toLowerCase();
  const slugSig = cleanKwLower.replace(/[^a-z0-9]+/g, "-");
  let imageUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`;

  if (cleanKwLower.includes("musk") || cleanKwLower.includes("elon")) {
    imageUrl = `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`;
  } else if (cleanKwLower.includes("drain") || cleanKwLower.includes("bathtub")) {
    imageUrl = `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`;
  } else if (cleanKwLower.includes("tub") || cleanKwLower.includes("bathroom")) {
    imageUrl = `https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`;
  } else if (cleanKwLower.includes("tv") || cleanKwLower.includes("samsung")) {
    imageUrl = `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`;
  }

  return {
    id: `queue-${item.id}`,
    slug,
    title,
    metaTitle: `${title} | On Gravity Magazine`,
    metaDescription: excerpt,
    excerpt,
    content,
    faqs: generateDynamicFaqsForArticle(cleanKw, category),
    category,
    author,
    publishedAt: item.publishedAt || item.createdAt,
    readTime: "7 min read",
    imageUrl,
    imageAlt: `Editorial photography for ${kwFmt.title}`,
    imageCaption: `Editorial photograph for ${kwFmt.title}.`,
    featured: true,
    trending: true,
    tags: [cleanKw.split(" ")[0] || "Featured", category.toUpperCase(), "2026"],
  };
}

export function getAllArticlesCombined(): Article[] {
  const diskArticles = loadCacheFromDisk();
  const map = new Map<string, Article>();

  for (const art of [...dynamicArticlesStore, ...diskArticles, ...ARTICLES]) {
    if (!map.has(art.slug)) {
      map.set(art.slug, art);
    }
  }

  for (const qItem of keywordQueueStore) {
    if (qItem.status === "published" && qItem.generatedArticleSlug) {
      if (!map.has(qItem.generatedArticleSlug)) {
        map.set(qItem.generatedArticleSlug, buildArticleFromQueueItem(qItem));
      }
    }
  }

  return Array.from(map.values());
}

export async function getArticleBySlugAsync(slug: string): Promise<Article | undefined> {
  const all = getAllArticlesCombined();
  const found = all.find((a) => a.slug === slug || a.id === slug);
  if (found) return found;

  const rawKeyword = slug.replace(/-\d{4,10}$/, "").replace(/-/g, " ");
  if (!rawKeyword.trim()) return undefined;

  try {
    const generated = await generateArticleObjectAsync(rawKeyword, undefined, slug);
    return generated;
  } catch (err) {
    console.error("On-demand article generation failed:", err);
  }

  return undefined;
}

export function clearPublishedStore() {
  dynamicArticlesStore = [];
}
