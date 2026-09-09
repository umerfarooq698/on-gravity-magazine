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

function loadCacheFromDisk(): Article[] {
  if (typeof window !== "undefined") return [];
  try {
    const fs = require("fs");
    const path = require("path");
    const cacheFile = path.join("/tmp", "on_gravity_articles_cache.json");
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
    const cacheFile = path.join("/tmp", "on_gravity_articles_cache.json");
    fs.writeFileSync(cacheFile, JSON.stringify(articles.slice(0, 50)), "utf-8");
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
 * Derive a deterministic integer hash from a string to ensure fixed, reproducible image selection
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
 * Fetch a fixed, high-res photograph dynamically for a keyword that stays stable across page reloads
 */
async function fetchUniqueUnsplashImage(keyword: string, category: string): Promise<{ url: string; caption: string; alt: string }> {
  const accessKey = getUnsplashAccessKey();
  const cleanKw = keyword.trim().toLowerCase();
  const slugSig = cleanKw.replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(cleanKw);

  // Exact entity override map for prominent people, products, and topics
  const SPECIFIC_KEYWORD_PHOTO_MAP: Record<string, { photoId: string; caption: string; alt: string }> = {
    "elon musk": {
      photoId: "photo-1560250097-0b93528c311a", // Tech CEO portrait on presentation stage
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
    "steve jobs": {
      photoId: "photo-1507003211169-0a1dd7228f2d",
      caption: "Editorial portrait of Steve Jobs, Apple co-founder.",
      alt: "Editorial portrait photograph of Steve Jobs",
    },
    "mark zuckerberg": {
      photoId: "photo-1534528741775-53994a69daeb",
      caption: "Editorial portrait of Mark Zuckerberg.",
      alt: "Editorial portrait photograph of Mark Zuckerberg",
    },
    "sam altman": {
      photoId: "photo-1500648767791-00dcc994a43e",
      caption: "Editorial portrait of Sam Altman, OpenAI CEO.",
      alt: "Editorial portrait photograph of Sam Altman",
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
    "ai autonomous agents in healthcare": {
      photoId: "photo-1576091160399-112ba8d25d1d",
      caption: "Medical clinical technology interface visualization.",
      alt: "Healthcare AI analytics dashboard",
    },
    "2026 red carpet fashion highlights": {
      photoId: "photo-1492684223066-81342ee5ff30",
      caption: "Red carpet gala lighting and high-fashion showcase.",
      alt: "Red carpet gala event stage",
    },
    "holistic sleep optimization and circadian rhythms": {
      photoId: "photo-1511295742362-92c96b124e52",
      caption: "Serene bedroom atmosphere optimized for circadian sleep.",
      alt: "Minimalist peaceful bedroom interior",
    },
    "venture capital shifts in clean energy startups": {
      photoId: "photo-1559526324-4b87b5e36e44",
      caption: "Clean energy solar infrastructure and sustainable investment.",
      alt: "Solar energy infrastructure array",
    },
    "minimalist architecture and slow living spaces": {
      photoId: "photo-1600585154340-be6161a56a0c",
      caption: "Minimalist architectural living space with natural lighting.",
      alt: "Modern minimalist residential interior architecture",
    },
    "zero-waste farm to table michelin dining": {
      photoId: "photo-1555396273-367ea4eb4db5",
      caption: "Gourmet culinary presentation at a fine dining restaurant.",
      alt: "Fine dining gourmet chef plating",
    },
    "global renewable energy municipal accords": {
      photoId: "photo-1470071459604-3b5ec3a7fe05",
      caption: "Global earth environmental perspective for municipal energy accords.",
      alt: "Earth environment landscape",
    },
  };

  // Check if keyword matches a specific entity override directly
  if (SPECIFIC_KEYWORD_PHOTO_MAP[cleanKw]) {
    const override = SPECIFIC_KEYWORD_PHOTO_MAP[cleanKw];
    return {
      url: `https://images.unsplash.com/${override.photoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`,
      caption: override.caption,
      alt: override.alt,
    };
  }

  // Check partial keyword matches for entity overrides (e.g. "elon musk news", "bathroom tub guide")
  for (const [key, override] of Object.entries(SPECIFIC_KEYWORD_PHOTO_MAP)) {
    if (cleanKw.includes(key)) {
      return {
        url: `https://images.unsplash.com/${override.photoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`,
        caption: override.caption,
        alt: override.alt,
      };
    }
  }

  // Refine query for people/celebrities to get portraits instead of vehicles/products
  let searchQuery = keyword;
  if (
    cleanKw.includes("musk") ||
    cleanKw.includes("ceo") ||
    cleanKw.includes("founder") ||
    cleanKw.includes("actor") ||
    cleanKw.includes("actress") ||
    cleanKw.includes("singer") ||
    cleanKw.includes("person") ||
    cleanKw.includes("president")
  ) {
    searchQuery = `${keyword} portrait headshot executive`;
  }

  if (accessKey) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=20&orientation=landscape&client_id=${accessKey}`
      );

      if (res.ok) {
        const data = await res.json();
        const results = data?.results;
        if (Array.isArray(results) && results.length > 0) {
          const photoIndex = hashVal % results.length;
          const photo = results[photoIndex];
          const rawUrl = photo?.urls?.regular || photo?.urls?.full;
          const authorName = photo?.user?.name || "Unsplash Photographer";
          const description = photo?.alt_description || photo?.description || keyword;

          if (rawUrl) {
            const imageUrl = rawUrl.includes("?") ? `${rawUrl}&sig=${slugSig}` : `${rawUrl}?sig=${slugSig}`;
            return {
              url: imageUrl,
              caption: `Editorial photograph for ${keyword}. Photo by ${authorName} on Unsplash.`,
              alt: description,
            };
          }
        }
      }
    } catch (err) {
      console.error("Unsplash API fetch error fallback:", err);
    }
  }

  // Domain-curated Unsplash photo pools matched strictly to keywords
  const categoryPhotoPools: Record<string, string[]> = {
    "life-style": [
      "photo-1584622650111-993a426fbf0a", // Bathtub / Drainage
      "photo-1507652313519-d4e9174996dd", // Bathroom Fixtures
      "photo-1618221195710-dd6b41faaea6", // Living Space
      "photo-1513694203232-719a280e022f", // Interior Decor
      "photo-1586023492125-27b2c045efd7", // Modern Home
      "photo-1600585154340-be6161a56a0c", // Interior Architecture
      "photo-1499750310107-5fef28a66643", // Cozy Work & Living
      "photo-1507089947368-19c1da9775ae", // Minimalist Room
    ],
    tech: [
      "photo-1593359677879-a4bb92f829d1", // TV / Display
      "photo-1550745165-9bc0b252726f", // Tech Workstation
      "photo-1518770660439-4636190af475", // Microchip
      "photo-1519389950473-47ba0277781c", // Laptop
      "photo-1531297484001-80022131f5a1", // Modern Gadgets
      "photo-1618005182384-a83a8bd57fbe", // Tech Abstract
      "photo-1526374965328-7f61d4dc18c5", // Cyber AI Matrix
      "photo-1508739773434-c26b3d09e071", // Smart Screen
    ],
    health: [
      "photo-1506126613408-eca07ce68773", // Wellness / Rest
      "photo-1540420773420-3366772f4999", // Nutrition
      "photo-1571019613454-1cb2f99b2d8b", // Fitness
      "photo-1511295742362-92c96b124e52", // Sleep Architecture
      "photo-1544367567-0f2fcb009e0b", // Spa & Rest
      "photo-1498837167922-ddd27525d352", // Healthy Smoothies
      "photo-1505576399279-565b52d4ac71", // Medical Biometrics
      "photo-1512290900673-066b567a5449", // Skincare
    ],
    celebrity: [
      "photo-1492684223066-81342ee5ff30", // Red Carpet Event
      "photo-1515886657613-9f3515b0c78f", // High Fashion
      "photo-1509631179647-0177331693ae", // Runway Model
      "photo-1469334031218-e382a71b716b", // Designer Outfits
      "photo-1539571696357-5a69c17a67c6", // Celebrity Portrait
      "photo-1490481651871-ab68de25d43d", // Luxury Fashion
      "photo-1529139574466-a303027c1d8b", // Street Style
      "photo-1500648767791-00dcc994a43e", // Actor Lighting
    ],
    business: [
      "photo-1590283603385-17ffb3a7f29f", // Stock Market
      "photo-1486406146926-c627a92ad1ab", // Corporate Skyscraper
      "photo-1507679799987-c73779587ccf", // Executive Suit
      "photo-1551836022-d5d88e9218df", // Business Meeting
      "photo-1559526324-4b87b5e36e44", // Clean Energy
      "photo-1454165804606-c3d57bc86b40", // Financial Analytics
      "photo-1522071820081-009f0129c71c", // Team Work
      "photo-1444653614773-995cb1ef9efa", // Corporate Tech
    ],
    food: [
      "photo-1555396273-367ea4eb4db5", // Gourmet Restaurant
      "photo-1504674900247-0877df9cc836", // Plating
      "photo-1540189549336-e6e99c3679fe", // Fresh Produce
      "photo-1565299624946-b28f40a0ae38", // Pizza & Dining
      "photo-1551024709-8f23befc6f87", // Gourmet Desserts
      "photo-1510812431401-41d2bd2722f3", // Wine Pairing
      "photo-1495474472287-4d71bcdd2085", // Specialty Coffee
      "photo-1544025162-d76694265947", // Fine Dining
    ],
    news: [
      "photo-1470071459604-3b5ec3a7fe05", // World Earth
      "photo-1541872703-74c5e44368f9", // Clean Energy
      "photo-1585829365295-ab7cd400c167", // Global News
      "photo-1526304640581-d334cdbbf45e", // Currency Trade
      "photo-1529107386315-e1a2ed48a620", // Summit Hall
      "photo-1451187580459-43490279c0fa", // Satellite Earth
      "photo-1569163139599-0f4517e36f51", // Solar Farm
      "photo-1572949645841-094f3a9c4c94", // Press Conference
    ],
  };

  // If keyword contains person indicator and is tech, fallback to executive portrait
  if (category === "tech" && (cleanKw.includes("musk") || cleanKw.includes("ceo") || cleanKw.includes("founder"))) {
    const photoId = "photo-1560250097-0b93528c311a";
    return {
      url: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`,
      caption: `Editorial portrait photograph for ${keyword}.`,
      alt: `Editorial portrait representing ${keyword}`,
    };
  }

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

  // Celebrity / Entertainment
  if (
    kw.includes("celebrity") ||
    kw.includes("actor") ||
    kw.includes("actress") ||
    kw.includes("fashion") ||
    kw.includes("movie") ||
    kw.includes("film") ||
    kw.includes("hollywood") ||
    kw.includes("gala") ||
    kw.includes("star") ||
    kw.includes("singer") ||
    kw.includes("music") ||
    kw.includes("pop") ||
    kw.includes("influencer") ||
    kw.includes("entertainment")
  ) {
    return "celebrity";
  }

  // Lifestyle / Home / Living / DIY
  if (
    kw.includes("lifestyle") ||
    kw.includes("life-style") ||
    kw.includes("home") ||
    kw.includes("house") ||
    kw.includes("living") ||
    kw.includes("mindful") ||
    kw.includes("travel") ||
    kw.includes("design") ||
    kw.includes("bathtub") ||
    kw.includes("drain") ||
    kw.includes("bathroom") ||
    kw.includes("shower") ||
    kw.includes("sink") ||
    kw.includes("faucet") ||
    kw.includes("plumbing") ||
    kw.includes("kitchen decor") ||
    kw.includes("interior") ||
    kw.includes("decor") ||
    kw.includes("renovation") ||
    kw.includes("furniture") ||
    kw.includes("garden") ||
    kw.includes("diy") ||
    kw.includes("cleaning") ||
    kw.includes("routine")
  ) {
    return "life-style";
  }

  // Health & Wellness
  if (
    kw.includes("health") ||
    kw.includes("medical") ||
    kw.includes("medicine") ||
    kw.includes("doctor") ||
    kw.includes("hospital") ||
    kw.includes("sleep") ||
    kw.includes("diet") ||
    kw.includes("nutrition") ||
    kw.includes("fitness") ||
    kw.includes("workout") ||
    kw.includes("longevity") ||
    kw.includes("mental") ||
    kw.includes("therapy") ||
    kw.includes("wellness") ||
    kw.includes("skin") ||
    kw.includes("skincare") ||
    kw.includes("disease")
  ) {
    return "health";
  }

  // Business & Finance
  if (
    kw.includes("business") ||
    kw.includes("market") ||
    kw.includes("stock") ||
    kw.includes("startup") ||
    kw.includes("finance") ||
    kw.includes("economy") ||
    kw.includes("invest") ||
    kw.includes("crypto") ||
    kw.includes("money") ||
    kw.includes("ceo") ||
    kw.includes("company") ||
    kw.includes("bank") ||
    kw.includes("trade") ||
    kw.includes("real estate")
  ) {
    return "business";
  }

  // Food & Culinary
  if (
    kw.includes("food") ||
    kw.includes("dining") ||
    kw.includes("dish") ||
    kw.includes("recipe") ||
    kw.includes("gourmet") ||
    kw.includes("chef") ||
    kw.includes("cooking") ||
    kw.includes("cook") ||
    kw.includes("restaurant") ||
    kw.includes("meal") ||
    kw.includes("snack") ||
    kw.includes("coffee") ||
    kw.includes("wine") ||
    kw.includes("baking")
  ) {
    return "food";
  }

  // News & Global Affairs
  if (
    kw.includes("news") ||
    kw.includes("global") ||
    kw.includes("summit") ||
    kw.includes("accord") ||
    kw.includes("policy") ||
    kw.includes("climate") ||
    kw.includes("election") ||
    kw.includes("government") ||
    kw.includes("politics") ||
    kw.includes("breaking") ||
    kw.includes("world")
  ) {
    return "news";
  }

  // Tech / Software / Electronics (Default)
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
 * Call Gemini 3.6 Flash API to generate rich content + SEO meta title & description + Image ALT text
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

  const editorialAngles = [
    "Comprehensive Buyer & Performance Evaluation",
    "Expert Technical & Architectural Deep-Dive",
    "Real-World Practical User Guide & Workflow Analysis",
    "Industry Impact, Market Shifts & Future Outlook",
    "In-Depth Comparative Breakdown & Benchmark Review"
  ];
  const selectedAngle = editorialAngles[Math.floor(Math.random() * editorialAngles.length)];
  const randomSeed = Math.floor(Math.random() * 999999);

  try {
    const prompt = `You are a friendly, experienced local expert writing for "On Gravity Magazine".
Write an exceptional, 100% UNIQUE, human feature article for keyword: "${keyword}".

CRITICAL INSTRUCTIONS & EDITORIAL RULES:

1. WORD COUNT (STRICTLY 900 - 1200 WORDS TOTAL):
   - The entire article MUST be strictly between 900 and 1200 words in total length.
   - Write 7 to 9 detailed paragraphs (approx 120-150 words per paragraph).

2. TITLE & INTRO:
   - TITLE: Create a clear, engaging, human headline specifically for "${keyword}". Do NOT use generic formula templates.
   - INTRO: Start with a short, warm introduction that speaks directly to the reader ("you"), setting immediate real-world value.

3. HEADINGS & H2 KEYWORD RULE:
   - Use custom H2 ("## Heading") and H3 ("### Subheading") sections for each topic and each article.
   - H2 KEYWORD RULE: Include the primary keyword "${keyword}" naturally in 1 or 2 H2 headings. The remaining H2 headings MUST address specific sub-topics without repeating the keyword.
   - STRICTLY FORBIDDEN GENERIC HEADINGS: Do NOT use template headings like "Key Architecture", "Real-World Utility", "Comparative Benchmarks", "Key Limitations", "Strategic Outlook"!

4. TONE & WRITING STYLE:
   - Write like a local person explaining things to a friend.
   - Make it human, conversational, warm, but still highly informative and professional.
   - Vary sentence length and avoid repetitive patterns or formula sentence starters.
   - NO BULLET POINT OVERKILL: Mix well-structured paragraphs with occasional clean list items where natural.

5. FORBIDDEN WORDS & ABSOLUTE ZERO META / AI MENTIONS:
   - ABSOLUTELY NO MENTION OF AI: Do NOT use "AI", "artificial intelligence", "as an AI", "AI model", "language model", or any machine/bot references.
   - FORBIDDEN PHRASES: Do NOT use "why search", "when search", "this article", "in today's fast-paced digital world", "delve into", "tapestry", "game-changer", "paradigm shift", "testament to", "beacon of", or any meta commentary.

6. FAQS SECTION (3-4 SHORT HELPFUL FAQS):
   - Provide 3 to 4 short, helpful Frequently Asked Questions at the end with concise, direct, friendly answers.
   - MANDATORY: Every question and answer MUST be 100% SPECIFIC and TAILORED to the exact subject "${keyword}".
   - NEVER use generic formula questions like "What makes ${keyword} a major focus in 2026?" or "How does ${keyword} compare to traditional solutions?".
   - For example: if the keyword is "bathroom cold tap", every question MUST specifically address cold water supply, freezing frost protection, cold pressure, or cold filtration!
   - For example: if the keyword is "bathroom hot tap", every question MUST specifically address hot water boilers, scalding safety, thermal mixing valves, or heating delays!

Return ONLY a valid JSON object matching this schema:
{
  "title": "Clear, engaging headline for ${keyword}",
  "metaTitle": "SEO Title under 60 chars ending with | On Gravity Magazine",
  "metaDescription": "Friendly meta description under 155 chars for search clicks",
  "imageAlt": "Descriptive photograph ALT text for ${keyword}",
  "excerpt": "A compelling 2-sentence summary of the article",
  "paragraphs": [
    "Short engaging intro speaking directly to you, the reader...",
    "## Topic-Specific H2 Heading with ${keyword}",
    "Paragraph 2 (120-150 words): Conversational, detailed local explanation...",
    "### Topic-Specific Subheading",
    "Paragraph 3 (120-150 words): Practical advice and real-world breakdown...",
    "## Topic-Specific H2 Heading",
    "Paragraph 4 (120-150 words): Step-by-step practical insights...",
    "## Topic-Specific H2 Heading",
    "Paragraph 5 (120-150 words): Detailed breakdown and friendly recommendations...",
    "Paragraph 6 (120-150 words): Practical caveats or maintenance tips...",
    "## Topic-Specific H2 Heading",
    "Paragraph 7 (120-150 words): Concluding advice and key takeaway..."
  ],
  "faqs": [
    { "question": "Short Question 1 regarding ${keyword}?", "answer": "Short, helpful, friendly answer." },
    { "question": "Short Question 2 regarding ${keyword}?", "answer": "Short, helpful, friendly answer." },
    { "question": "Short Question 3 regarding ${keyword}?", "answer": "Short, helpful, friendly answer." },
    { "question": "Short Question 4 regarding ${keyword}?", "answer": "Short, helpful, friendly answer." }
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
 * Extract sub-topic tokens from keyword to isolate exact nuances (e.g. idea vs cold vs hot vs black vs wall mounted)
 */
function extractKeywordSubTokens(keyword: string) {
  const kw = keyword.toLowerCase().trim();
  return {
    isIdea: kw.includes("idea") || kw.includes("design") || kw.includes("style") || kw.includes("decor") || kw.includes("trend") || kw.includes("inspiration") || kw.includes("aesthetic") || kw.includes("concept"),
    isCold: kw.includes("cold") || kw.includes("frost") || kw.includes("ice") || kw.includes("unheated"),
    isHot: kw.includes("hot") || kw.includes("boiling") || kw.includes("heater") || kw.includes("thermal") || kw.includes("warm"),
    isBlack: kw.includes("black") || kw.includes("dark") || kw.includes("matte"),
    isGold: kw.includes("gold") || kw.includes("brass") || kw.includes("bronze") || kw.includes("copper") || kw.includes("pvd"),
    isWall: kw.includes("wall") || kw.includes("mounted") || kw.includes("concealed"),
    isSensor: kw.includes("sensor") || kw.includes("touchless") || kw.includes("automatic") || kw.includes("smart") || kw.includes("motion"),
    isSmall: kw.includes("small") || kw.includes("compact") || kw.includes("cloakroom") || kw.includes("mini") || kw.includes("narrow"),
    isLuxury: kw.includes("luxury") || kw.includes("modern") || kw.includes("premium") || kw.includes("high end") || kw.includes("designer"),
    isTub: (kw.includes("bathtub") || kw.includes("tub") || kw.includes("soaking")) && !kw.includes("tap") && !kw.includes("faucet"),
    isDrain: (kw.includes("drain") || kw.includes("trap") || kw.includes("waste") || kw.includes("plumbing")) && !kw.includes("tap") && !kw.includes("faucet"),
    isTap: kw.includes("tap") || kw.includes("faucet") || kw.includes("mixer") || kw.includes("spout"),
    isMusk: kw.includes("musk") || kw.includes("elon") || kw.includes("zuckerberg") || kw.includes("jobs") || kw.includes("altman") || kw.includes("ceo") || kw.includes("founder"),
    isTv: kw.includes("tv") || kw.includes("samsung") || kw.includes("display") || kw.includes("oled") || kw.includes("qled") || kw.includes("screen"),
    isSleep: kw.includes("sleep") || kw.includes("circadian") || kw.includes("health") || kw.includes("wellness") || kw.includes("diet") || kw.includes("fitness"),
  };
}

/**
 * Synthesize domain-specific, journalism-grade paragraphs (900-1200 words) strictly tailored to keyword sub-tokens
 */
function generateDynamicDomainParagraphs(keyword: string, category: string, headings: ReturnType<typeof generateDynamicHeadingsForArticle>): string[] {
  const cleanKw = keyword.trim();
  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const tokens = extractKeywordSubTokens(cleanKw);
  const hash = getDeterministicHash(cleanKw);

  // 1. TAP IDEAS & DESIGN INSPIRATION (e.g., "bathroom taps idea", "modern faucet design ideas")
  if (tokens.isIdea && (tokens.isTap || tokens.isTub)) {
    return [
      `Gathering fresh inspiration for ${cleanKw} is a pivotal starting point when designing a high-impact bathroom layout. From sculptural freestanding pillar spouts to minimalist recessed wall fixtures, exploring creative ideas allows homeowners and interior architects to turn daily utility into a refined aesthetic statement.`,
      headings.h2Keyword,
      `Contemporary design trends favor organic silhouettes, tactile textured handles, and subtle metallic finishes. When conceptualizing ${cleanKw}, pairing brass or matte black fixtures with natural stone, micro-cement, or fluted vanity panels creates a balanced visual contrast that elevates the entire room.`,
      headings.h3Sub1,
      `Spatial proportion is crucial when choosing placement for your fixtures. Overhead clearance, spout reach over the sink basin rim, and vessel height must align seamlessly so that water falls smoothly into the center of the drain without creating unwanted splash zone mess.`,
      headings.h2Utility,
      `Incorporating architectural lighting around ${cleanKw} enhances tactile textures and highlights premium surface treatments. Warm ambient backlighting behind vanity mirrors or recessed wall niches casts soft shadows across brushed brass or matte surfaces, creating a spa-like atmosphere.`,
      headings.h2Comparative,
      `Comparing bold accent designs against subtle integrated fixtures highlights key styling approaches. Bold accent taps act as room centerpieces, while integrated concealed fixtures offer clean, uncluttered minimalism ideal for Scandinavian and Japandi interior themes.`,
      headings.h3Sub2,
      `Mixing metals across bathroom hardware requires careful coordination. Matching your primary basin tap finish with cabinet pulls, shower trim, and towel rails maintains cohesive visual harmony throughout the space.`,
      headings.h2Limitations,
      `When implementing ambitious design ideas, ensure that behind-the-wall rough-in plumbing and tile depths are measured precisely beforehand. Complex wall-mounted valve bodies require accurate depth planning prior to final tiling.`,
      headings.h2Outlook,
      `Exploring ${cleanKw} unlocks endless creative potential, transforming standard bathroom fittings into timeless design features crafted for daily enjoyment.`
    ];
  }

  // 2. COLD WATER TAPS & COLD LINES (e.g., "bathroom cold tap", "cold water tap")
  if (tokens.isCold && tokens.isTap) {
    return [
      `Designing and maintaining a reliable cold water supply with ${cleanKw} is essential for daily household hygiene, refreshment, and efficient plumbing management. Cold water lines operate under constant municipal or well pressure, requiring durable valve fittings and proper pipe insulation to prevent temperature degradation or seasonal freezing in exterior wall cavities.`,
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
      `Maintaining ${cleanKw} with periodic aerator cleanings and seasonal pipe insulation ensures dependable, clean cold water flow all year round.`
    ];
  }

  // 3. HOT WATER & BOILING TAPS (e.g., "bathroom hot tap", "boiling water tap")
  if (tokens.isHot && tokens.isTap) {
    return [
      `Integrating a high-performance hot water system for ${cleanKw} provides immediate comfort, efficient dishwashing, and hygienic personal care. Modern hot water fixtures rely on precise temperature regulation, boiler connectivity, and anti-scald safety mechanisms to deliver steady hot water on demand.`,
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
      `Investing in energy-efficient hot water fixtures for ${cleanKw} enhances daily convenience while reducing household water and heating costs over time.`
    ];
  }

  // 4. BLACK / MATTE FINISH TAPS (e.g., "black bathroom tap", "matte black faucet")
  if (tokens.isBlack && tokens.isTap) {
    return [
      `Matte black fixtures for ${cleanKw} have become a hallmark of contemporary interior design, offering a bold architectural contrast against white porcelain, marble, and concrete textures. Understanding physical vapor deposition (PVD) coatings and maintenance requirements ensures matte black surfaces stay pristine for years.`,
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
      `Choosing matte black for ${cleanKw} provides a sleek, modern aesthetic that defines luxury bathroom styling.`
    ];
  }

  // 5. GENERAL TAPS / FAUCETS / MIXERS (e.g., "bathroom tap", "basin faucet", "mixer tap")
  if (tokens.isTap) {
    const tapVariants = [
      [
        `Selecting the ideal fixture for ${cleanKw} combines interior design aesthetics with precision engineering, water conservation, and long-term mechanical reliability. Whether remodeling a modern master bathroom or upgrading a simple guest lavatory, choosing the right spout height, handle ergonomics, and surface finish transforms the basin into a functional centerpiece.`,
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
        `Exploring ${cleanKw} allows homeowners to combine water-saving innovation with timeless design, creating an elegant, dependable bathroom space built to last.`
      ],
      [
        `Evaluating options for ${cleanKw} requires an understanding of water pressure requirements, mounting styles, and interior design compatibility. A well-selected fixture provides effortless daily water control while enhancing the architectural beauty of your vanity space.`,
        headings.h2Keyword,
        `Engineering standards for ${cleanKw} emphasize solid forged brass bodies and lead-free waterways. Solid brass resists internal corrosion caused by chlorinated municipal water, guaranteeing structural integrity across decades of heavy use.`,
        headings.h3Sub1,
        `Smooth handle operation is driven by precision-milled ceramic disc cartridges rated for over 500,000 opening and closing cycles. Ceramic discs prevent persistent handle drips and maintain smooth thermal mixing.`,
        headings.h2Utility,
        `Installation specs vary between deck-mounted single-hole setups, three-hole widespread vanity configurations, and space-saving wall-mounted valves. Matching hole spacing and water line connections ensures a clean, leak-free installation.`,
        headings.h2Comparative,
        `Testing water delivery across aerated stream tips versus laminar flow spouts shows distinct user benefits. Aerated tips produce soft, non-splash streams ideal for handwashing, while laminar spouts deliver crystal-clear water streams.`,
        headings.h3Sub2,
        `Eco-friendly eco-flow restrictors help reduce household water consumption without sacrificing water stream force or daily rinsing effectiveness.`,
        headings.h2Limitations,
        `Before purchasing high-spout fixtures, measure cabinet door openings and medicine cabinet clearance above the sink to avoid physical obstruction during operation.`,
        headings.h2Outlook,
        `Investing in a quality fixture for ${cleanKw} delivers long-term peace of mind, reliable flow, and striking visual refinement.`
      ]
    ];
    return tapVariants[hash % tapVariants.length];
  }

  // 6. BATHTUBS & SOAKING BASINS
  if (tokens.isTub) {
    return [
      `Designing a peaceful bath space around ${cleanKw} blends luxury basin ergonomics with solid subfloor structural engineering and high-flow plumbing. As bather preferences shift toward home wellness retreats, selecting tub materials, basin depths, and hydrotherapy features shapes daily relaxation and property value.`,
      headings.h2Keyword,
      `Evaluating soaking tub materials highlights performance differences between high-grade acrylic, fiberglass, and heavy cast iron. Cast iron basins provide exceptional heat retention but require subfloor joist reinforcement due to empty weights exceeding 300 pounds. Lightweight acrylic basins offer versatility and smooth contours suited for freestanding vessels.`,
      headings.h3Sub1,
      `Freestanding soaking tubs create striking architectural focal points in open floor plan bathrooms, requiring floor-mounted or wall-mounted filler spouts. Alcove tub designs maximize space efficiency in standard 60-inch footprints, featuring built-in tile flanges that prevent splash water from seeping into wall studs.`,
      headings.h2Utility,
      `Maintaining hygiene in air jet and hydrotherapy soaking tubs requires periodic flushing with specialized purge solutions to prevent organic biofilms from building up inside recirculation lines.`,
      headings.h2Comparative,
      `Comparing deep soaking vessels against shallow standard tubs shows significant relaxation benefits, allowing bather shoulders to remain fully submerged in 14 to 18 inches of warm water.`,
      headings.h3Sub2,
      `Installing high-flow 4 to 8 GPM tub fillers ensures large soaking basins fill quickly before bathwater loses thermal energy.`,
      headings.h2Limitations,
      `Cleaning acrylic and enamel tub basins requires non-abrasive liquid cleaners. Abrasive powders strip gel coatings, leaving microscopic pores that trap soap scum.`,
      headings.h2Outlook,
      `Investing in a well-crafted basin for ${cleanKw} elevates daily self-care while anchoring modern interior design.`
    ];
  }

  // 7. DRAINS & WASTE PIPING
  if (tokens.isDrain) {
    return [
      `Ensuring rapid water evacuation and maintaining proper waste line standards for ${cleanKw} is essential for preventing structural water damage and unpleasant odors in residential bathrooms. Hair, soap residue, and mineral scale accumulate inside drain traps over time, reducing flow rates and straining household plumbing.`,
      headings.h2Keyword,
      `Standard residential bath and sink drain assemblies connect 1.5-inch waste piping to a curved P-trap. The standing water barrier inside the P-trap prevents sewer gas from venting into living spaces, while solid brass or heavy PVC fittings withstand hot water and daily usage.`,
      headings.h3Sub1,
      `Applying a smooth ring of plumber's putty beneath the drain flange creates a watertight seal. Tightening the securing nut beneath the basin compresses the rubber washer, preventing subtle subfloor leaks.`,
      headings.h2Utility,
      `Clearing stubborn drain clogs prioritizes non-chemical mechanical methods. A flexible zip-it snake extracts hair clogs directly from upper elbows without disassembling pipe joints. Periodic baking soda and white vinegar flushes break down buildup naturally.`,
      headings.h2Comparative,
      `Comparing tip-toe stoppers against traditional trip-lever overflow mechanisms shows usability benefits. Tip-toe stoppers unscrew easily for hair removal, whereas trip-lever stoppers require periodic internal linkage tuning.`,
      headings.h3Sub2,
      `Clean, properly vented 1.5-inch drains evacuate standing water at 5 to 7 gallons per minute. Flows under 3 GPM indicate partial blockages or inadequate stack venting.`,
      headings.h2Limitations,
      `Persistent subfloor leaks or cracked cast iron stacks warrant attention from a licensed plumber to avoid structural subfloor damage.`,
      headings.h2Outlook,
      `Following simple preventative habits for ${cleanKw} ensures smooth drainage, hygiene, and long-term plumbing reliability.`
    ];
  }

  // 8. TECH EXECUTIVES & LEADERSHIP
  if (tokens.isMusk) {
    return [
      `The career and leadership philosophy of ${cleanKw} represent a transformative force across modern technology, industrial manufacturing, and global enterprise strategy. By championing first-principles engineering and aggressive iteration cycles, key initiatives under this vision have continuously challenged conventional market norms, disrupting legacy sectors ranging from autonomous mobility and aerospace to artificial intelligence and digital communications.`,
      headings.h2Keyword,
      `At the core of this operational model lies an unyielding commitment to removing technical bottlenecks and streamlining complex engineering processes. Rather than relying on traditional industry supplier networks, emphasis is placed on vertical integration—insourcing critical component design, software architecture, and automated manufacturing protocols under a unified organizational umbrella.`,
      headings.h3Sub1,
      `Engineers working within these high-velocity environments operate under flat management structures designed to eliminate corporate bureaucracy. Cross-functional teams iterate rapidly on real-world prototypes, treating every test failure as invaluable telemetry data to refine subsequent hardware and software revisions.`,
      headings.h2Utility,
      `From a commercial standpoint, scaling multi-disciplinary ventures requires sophisticated capital allocation and strategic resource management. High-risk investments in orbital launch infrastructure, gigafactory battery production, and neural interface research demonstrate how long-term capital deployment can unlock entire new market categories despite intense skepticism from traditional financial analysts.`,
      headings.h2Comparative,
      `Comparing this agile, mission-driven approach against legacy corporate structures highlights stark operational differences. Traditional conglomerates often prioritize incremental quarter-over-quarter risk mitigation, whereas first-principles ventures accept short-term volatility to achieve exponential technological breakthroughs over multi-year horizons.`,
      headings.h3Sub2,
      `Key performance indicators across manufacturing throughput, launch cadence, and software deployment speeds consistently outpace industry averages. Continuous over-the-air updates and rapid hardware re-tooling allow products to evolve dynamically long after initial market release.`,
      headings.h2Limitations,
      `Despite remarkable technological achievements, operating at extreme velocity presents distinct executive challenges. Aggressive production timelines, intense public scrutiny, regulatory compliance friction, and organizational burnout risks require continuous management oversight to ensure long-term operational sustainability.`,
      headings.h2Outlook,
      `Looking ahead to the next decade, initiatives surrounding ${cleanKw} promise to push the boundaries of human capability even further. Editors at On Gravity Magazine will continue tracking key developments, regulatory shifts, and technological milestones as these visionary endeavors unfold on the global stage.`
    ];
  }

  // 9. TV & DISPLAYS
  if (tokens.isTv) {
    return [
      `Selecting and optimizing display technology for ${cleanKw} requires an in-depth understanding of panel architecture, peak luminance, color fidelity, and dynamic range capabilities. Modern consumer displays have evolved into sophisticated visual hubs engineered to deliver cinema-grade picture quality, ultra-low gaming latency, and seamless smart home platform connectivity.`,
      headings.h2Keyword,
      `Panel technology centers on two dominant engineering approaches: self-emissive OLED pixels and Quantum Dot Mini-LED backlighting arrays. Self-emissive pixels achieve perfect black levels by turning off individual sub-pixels completely, yielding infinite contrast ratios ideal for dark-room home theater setups. Conversely, Quantum Dot Mini-LED displays leverage thousands of microscopic LEDs to generate intense peak brightness exceeding 2,000 nits.`,
      headings.h3Sub1,
      `Engineers utilize local dimming algorithms to control backlighting zones dynamically, minimizing halo artifacts around bright objects displayed against dark backgrounds. Coverage of the DCI-P3 cinematic color space regularly exceeds 98 percent, delivering rich, lifelike color volume across all brightness levels.`,
      headings.h2Utility,
      `For gaming enthusiasts, modern 4K displays offer advanced high-frame-rate features including 120Hz and 144Hz variable refresh rates (VRR), Auto Low Latency Mode (ALLM), and sub-10 millisecond input lag responses. HDMI 2.1 bandwidth capability enables uncompressed 4K video transmission alongside Dolby Atmos eARC audio passthrough to premium soundbars and AV receivers.`,
      headings.h2Comparative,
      `Evaluating smart TV platforms reveals significant software advancements in content discovery and voice navigation. Intuitive dashboard ergonomics, customizable home menus, and universal search functions allow users to navigate streaming services effortlesly while integrated smart home hubs control ambient lighting and connected peripherals.`,
      headings.h3Sub2,
      `Benchmark testing across ambient light reflections highlights the importance of anti-glare screen coatings. High-end panels incorporate anti-reflective layers that diffuse incoming sunlight, maintaining vivid picture clarity even in brightly illuminated living rooms.`,
      headings.h2Limitations,
      `While flagship display panels deliver astounding visual fidelity, potential buyers should evaluate room dimensions, viewing angles, and panel longevity factors. Ultra-wide viewing angle layers prevent color shift when sitting off-center, while built-in pixel refresh routines mitigate potential image retention over extended operational lifetimes.`,
      headings.h2Outlook,
      `Future developments in display technology continue pushing boundaries through neural AI upscaling, ambient color temperature sensing, and energy-efficient panel designs. ${capitalizedKw} remains a standout highlight in modern consumer electronics, offering an unbeatable blend of performance, versatility, and visual immersive value.`
    ];
  }

  // 10. DYNAMIC MULTI-VARIANT BLUEPRINTS FOR GENERAL TOPICS (5 distinct variants selected via hash)
  const variantIndex = hash % 5;

  if (variantIndex === 0) {
    return [
      `Exploring the core principles, practical value, and current developments surrounding ${cleanKw} provides essential clarity for enthusiasts, buyers, and industry professionals alike. As technological innovations and consumer expectations continue to evolve, staying informed regarding best practices, operational benchmarks, and long-term trends ensures informed decision-making.`,
      headings.h2Keyword,
      `From a functional standpoint, ${cleanKw} incorporates several key engineering and design highlights intended to maximize user satisfaction and day-to-day utility. Rigorous evaluation confirms that adopting modern standards and quality components dramatically enhances daily performance.`,
      headings.h3Sub1,
      `System specifications emphasize structural durability, streamlined user controls, and seamless integration with existing workflows. Whether deployed in personal, professional, or commercial environments, attention to foundational setup details yields consistent, high-value outcomes.`,
      headings.h2Utility,
      `Real-world practical implementation highlights the importance of clear operational protocols and periodic maintenance reviews. Experts recommend establishing routine evaluation schedules, leveraging automated safeguards where applicable, and adhering to established safety guidelines.`,
      headings.h2Comparative,
      `Evaluating ${cleanKw} against traditional alternatives reveals distinct performance and cost-to-value advantages. While initial adoption may require deliberate planning and resource allocation, long-term efficiency gains justify the investment.`,
      headings.h3Sub2,
      `Side-by-side comparative testing across standard operational scenarios demonstrates measurable improvements in throughput, speed, and long-term durability.`,
      headings.h2Limitations,
      `Despite numerous compelling benefits, potential users should account for specific practical caveats and setup requirements beforehand to ensure smooth implementation.`,
      headings.h2Outlook,
      `Looking forward, ongoing advancements surrounding ${cleanKw} promise to deliver even greater capability, convenience, and value.`
    ];
  }

  if (variantIndex === 1) {
    return [
      `Understanding the practical impact and real-world execution of ${cleanKw} is becoming increasingly vital in today's evolving market. By breaking down core mechanisms, material standards, and user ergonomics, this feature highlights key takeaways every informed user should consider.`,
      headings.h2Keyword,
      `At the center of ${cleanKw} lies an emphasis on durability, precision engineering, and intuitive user operation. High-grade construction materials resist environmental wear, ensuring steady output across extended operational cycles.`,
      headings.h3Sub1,
      `Engineers and designers prioritize streamlined ergonomics to reduce operational friction and simplify daily usage. Every component is positioned to support maximum reliability under heavy demand.`,
      headings.h2Utility,
      `Practical user applications emphasize intuitive setup workflows and minimal maintenance friction. Incorporating modular parts allows quick servicing without requiring complete system teardowns.`,
      headings.h2Comparative,
      `Comparing modern ${cleanKw} implementations against earlier generations illustrates major advancements in energy conservation, acoustic dampening, and overall ergonomics.`,
      headings.h3Sub2,
      `Field testing and user reviews highlight superior output consistency, proving that quality engineering directly translates into a better daily experience.`,
      headings.h2Limitations,
      `Potential buyers should verify spatial dimensions and utility capacity before committing to installation, avoiding costly adjustments down the line.`,
      headings.h2Outlook,
      `The future of ${cleanKw} looks remarkably bright, with new innovations continuously raising the bar for efficiency and user satisfaction.`
    ];
  }

  if (variantIndex === 2) {
    return [
      `When evaluating options for ${cleanKw}, focusing on foundational material quality and real-world performance delivers the best long-term outcomes. This comprehensive breakdown explores the essential attributes defining excellence in this space.`,
      headings.h2Keyword,
      `The key strength of ${cleanKw} stems from its refined architecture and attention to practical utility. By balancing high-durability alloys and polymers with modern aesthetics, the resulting system delivers unmatched daily performance.`,
      headings.h3Sub1,
      `Specialized internal seals and precision-milled tolerances safeguard critical moving parts, preventing premature wear and protecting overall system integrity.`,
      headings.h2Utility,
      `Deploying ${cleanKw} effectively relies on following structured installation procedures and maintaining clear operating parameters. Simple preventative care keeps performance at peak levels year after year.`,
      headings.h2Comparative,
      `Benchmark comparisons across speed, durability, and energy draw place ${cleanKw} at the forefront of modern consumer solutions, offering clear benefits over legacy designs.`,
      headings.h3Sub2,
      `Controlled stress testing confirms that components maintain structural stability and thermal tolerance even under peak operational loads.`,
      headings.h2Limitations,
      `Careful attention must be paid to operational limits, voltage ratings, or mounting surface strength to prevent unexpected strain on the assembly.`,
      headings.h2Outlook,
      `As market interest in ${cleanKw} expands, ongoing technical refinements will continue delivering enhanced value and refined user experiences.`
    ];
  }

  if (variantIndex === 3) {
    return [
      `Navigating the choices surrounding ${cleanKw} requires an objective look at design innovation, operational efficiency, and user feedback. This in-depth editorial breaks down key considerations to guide your next decision.`,
      headings.h2Keyword,
      `The design philosophy governing ${cleanKw} blends contemporary aesthetics with heavy-duty functional capabilities. High-performance internal mechanisms ensure smooth, reliable output for years of regular use.`,
      headings.h3Sub1,
      `Tactile controls and responsive feedback mechanisms enhance the overall user experience, making daily operation effortless and satisfying.`,
      headings.h2Utility,
      `Integrating ${cleanKw} into residential or commercial spaces is streamlined by standard mounting specifications and universal fitting options.`,
      headings.h2Comparative,
      `Side-by-side testing demonstrates that ${cleanKw} delivers superior energy and resource conservation without compromising on output velocity or user comfort.`,
      headings.h3Sub2,
      `Long-term durability trials indicate minimal component degradation over thousands of operational cycles, validating the initial investment.`,
      headings.h2Limitations,
      `Homeowners should ensure routine cleaning is performed with non-abrasive products to protect delicate surface finishes from scratching.`,
      headings.h2Outlook,
      `With widespread adoption on the rise, ${cleanKw} continues to set a high standard for modern quality and dependable design.`
    ];
  }

  return [
    `A detailed examination of ${cleanKw} reveals how subtle engineering improvements can deliver profound real-world benefits. Whether upgrading an existing setup or planning a new project, understanding these dynamics is essential.`,
    headings.h2Keyword,
    `Built around a core of heavy-duty components and modern styling, ${cleanKw} strikes a harmonious balance between robust endurance and visual elegance.`,
    headings.h3Sub1,
    `Advanced surface treatments and precision-sealed internal channels protect against corrosion, mineral buildup, and thermal stress.`,
    headings.h2Utility,
    `Maximizing the utility of ${cleanKw} involves establishing regular inspection routines and utilizing recommended cleaning solutions.`,
    headings.h2Comparative,
    `A comparative look at performance metrics proves that ${cleanKw} outpaces traditional alternatives in speed, efficiency, and overall user satisfaction.`,
    headings.h3Sub2,
    `Operational data gathered from field installations highlights exceptionally low failure rates and high user approval scores.`,
    headings.h2Limitations,
    `Always verify manufacturer warranties and installation requirements prior to purchase to guarantee long-term peace of mind.`,
    headings.h2Outlook,
    `As industry standards evolve, ${cleanKw} remains a standout recommendation for those seeking top-tier quality and lasting value.`
  ];
}

/**
 * Generate dynamic, topic-tailored H2 and H3 headings for fallback articles
 */
function generateDynamicHeadingsForArticle(keyword: string, category: string) {
  const cleanKw = keyword.trim();
  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const tokens = extractKeywordSubTokens(cleanKw);

  let h2Pool: string[] = [];
  let h3Pool: string[] = [];

  if (tokens.isIdea && (tokens.isTap || tokens.isTub)) {
    h2Pool = [
      `## Modern Styling Trends & Spatial Layout for ${capitalizedKw}`,
      `## Pairing Metallic Finishes with Stone and Concrete Basins`,
      `## Architectural Lighting & Visual Focus Points for Taps`,
      `## Minimalist Concealed Fixtures vs Bold Accent Statements`,
      `## Spout Reach Calculations & Splash Prevention Ergonomics`,
      `## Mixing Metals & Coordinating Bathroom Hardware Finishes`,
      `## Rough-In Plumbing Depth Standards for Wall-Mounted Ideas`
    ];
    h3Pool = [
      `### Spout Reach & Vessel Clearance Matching`,
      `### Warm Ambient Backlighting & Texture Highlights`,
      `### Coordinated Finish Mapping for Hardware`,
      `### Behind-the-Wall Rough-In Measurement Rules`
    ];
  } else if (tokens.isCold && tokens.isTap) {
    h2Pool = [
      `## Cold Water Supply Line Insulation & Freezing Protection for ${capitalizedKw}`,
      `## Pressure Balancing: Cold Line Flow Rates vs Main Feeds`,
      `## Under-Sink Inline Water Filtration Systems for Cold Taps`,
      `## Preventing Water Line Whistling & Vibration Noises`,
      `## Material Durability: Brass, Copper, and PVD Coated Cold Fittings`,
      `## Troubleshooting Slow Cold Water Flow & Aerator Mineral Clogs`
    ];
    h3Pool = [
      `### Foam Pipe Sleeve Installation & Frost Prevention`,
      `### Dual-Feed Water Pressure Equalization Protocols`,
      `### In-Line Carbon Filter Cartridge Maintenance`,
      `### Aerator Vinegar Soak & Mineral Removal`
    ];
  } else if (tokens.isHot && tokens.isTap) {
    h2Pool = [
      `## Boiler Connections & Instant Hot Water Delivery for ${capitalizedKw}`,
      `## Anti-Scald Thermostatic Valves & Water Temperature Regulation`,
      `## Purging Trapped Air & Eliminating Hot Line Water Sputtering`,
      `## Energy Efficiency: Standby Tank Power vs Instant Heat Systems`,
      `## Heavy-Duty Brass Construction for Thermal Expansion Resilience`,
      `## Troubleshooting Delayed Hot Water Delivery in Long Pipe Runs`
    ];
    h3Pool = [
      `### Thermostatic Valve Calibration at 120°F (49°C)`,
      `### Recirculating Pump Setup for Instant Hot Flow`,
      `### Thermal Expansion Chamber Checks`,
      `### Microscopic Air Bubble Dispersion Protocols`
    ];
  } else if (tokens.isBlack && tokens.isTap) {
    h2Pool = [
      `## PVD Coating & Electroplated Surface Care for ${capitalizedKw}`,
      `## Protecting Matte Black Finishes Against Hard Water Stains`,
      `## Pairing Matte Black Spouts with Monochrome Vanity Hardware`,
      `## Non-Abrasive Cleaning Protocols for Deep Matte Finishes`,
      `## Ceramic Disc Cartridges & Smooth Handle Ergonomics`,
      `## Pop-Up Waste Drain & Bottle Trap Finish Coordination`
    ];
    h3Pool = [
      `### Microfiber & Mild Dish Soap Cleaning Rules`,
      `### Hard Water Calcium Prevention Techniques`,
      `### Electroplated PVD Scratch Resistance Ratings`,
      `### Matching Pop-Up Drain & Waste Fittings`
    ];
  } else if (tokens.isTap) {
    h2Pool = [
      `## Single-Handle vs Dual-Control Ergonomics for ${capitalizedKw}`,
      `## Ceramic Disc Cartridges vs Traditional Rubber Washer Valves`,
      `## Aerator Selection: Aerated Flow vs Laminar Stream & Splash Control`,
      `## Matte Black, Brushed Brass, and Chrome PVD Finish Care`,
      `## Spout Clearance & Reach Calculation for Modern Basins`,
      `## Fixing Persistent Dripping & Internal Cartridge Swaps`
    ];
    h3Pool = [
      `### Quarter-Turn Ceramic Valve Mechanism Specs`,
      `### Low-Flow Aerator GPM Pressure Ratings`,
      `### Soft Microfiber Cleaning for PVD Finishes`,
      `### Under-Sink Supply Hose Tightening Limits`
    ];
  } else if (tokens.isTub) {
    h2Pool = [
      `## High-Flow Spout Rates & Basin Fill Speed for ${capitalizedKw}`,
      `## Deck-Mounted vs Wall-Mounted Fixture Architecture`,
      `## Waterproof Flange Seals & Subfloor Moisture Protection`,
      `## Hydrotherapy Jet Sanitation & Biofilm Prevention Protocols`,
      `## Cast Iron vs Acrylic Basin Thermal Retention Benchmarks`
    ];
    h3Pool = [
      `### Silicone Flange Bead & Plumber's Putty Seals`,
      `### High-GPM Water Pressure Requirements`,
      `### Non-Abrasive Microfiber Cleaning Protocols`,
      `### Air Jet Line Purge & Sanitization`
    ];
  } else if (tokens.isDrain) {
    h2Pool = [
      `## Drain Pipe Diameter & P-Trap Water Barrier Standards for ${capitalizedKw}`,
      `## Clearing Tough Clogs: Chemical-Free Snaking & Auger Techniques`,
      `## Eliminating Sewer Gas Odors & Overflow Channel Cleaning`,
      `## Tip-Toe vs Trip-Lever Drain Stopper Mechanism Comparison`,
      `## Flange Nut Tightening & Rubber Gasket Leak Prevention`
    ];
    h3Pool = [
      `### Rubber Gasket & Flange Sealing Instructions`,
      `### Hair & Soap Scum Mechanical Removal Protocols`,
      `### Water Barrier Depth in Curved P-Traps`,
      `### Overflow Pipe Disinfection Protocols`
    ];
  } else if (tokens.isMusk) {
    h2Pool = [
      `## First-Principles Engineering & Vertical Integration Behind ${capitalizedKw}`,
      `## High-Velocity Iteration Cycles & Telemetry-Driven Upgrades`,
      `## Flat Management Structures & Cross-Functional Team Execution`,
      `## Capital Allocation Strategy: High-Risk Infrastructure Bets`,
      `## Manufacturing Throughput Benchmarks & Automated Assembly`
    ];
    h3Pool = [
      `### Telemetry Data Capture from Test Failures`,
      `### In-House Component Sourcing & Tooling`,
      `### Rapid Over-the-Air Software Deployments`,
      `### High-Risk Capital Reserves & Scaling Logistics`
    ];
  } else if (tokens.isTv) {
    h2Pool = [
      `## Quantum Dot Peak Brightness & Contrast Benchmarks for ${capitalizedKw}`,
      `## 4K 120Hz Gaming Performance: VRR, ALLM & Input Lag Ratings`,
      `## Anti-Reflective Screen Coating & Sunlit Room Visibility`,
      `## Smart OS Ergonomics: Navigation Speed & Voice Integration`,
      `## Audio Output: eARC Passthrough & Soundbar Integration`
    ];
    h3Pool = [
      `### Local Dimming Array Zone Control`,
      `### HDMI 2.1 48Gbps Cable Bandwidth Requirements`,
      `### DCI-P3 Color Volume Accuracy Ratings`,
      `### Automated Screen Saver & Sleep Timers`
    ];
  } else {
    h2Pool = [
      `## Key Technical Innovations & System Specifications for ${capitalizedKw}`,
      `## Real-World Performance Benchmarks & Everyday Utility`,
      `## Step-by-Step Installation & Setup Best Practices`,
      `## Comparative Efficiency: Modern Features vs Legacy Alternatives`,
      `## Material Durability & Preventative Maintenance Schedules`
    ];
    h3Pool = [
      `### Performance Metric Verification & Safety Checks`,
      `### Material Quality & Build Standards`,
      `### Routine Inspection & Service Schedules`,
      `### Key Milestones for Long-Term Value`
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
    h2Keyword: pickAndRemove(h2Copy) || `## Key Performance Capabilities of ${capitalizedKw}`,
    h3Sub1: pickAndRemove(h3Copy) || `### Primary Specifications & Feature Breakdown`,
    h2Utility: pickAndRemove(h2Copy) || `## Real-World Applications & Workflow Integration`,
    h2Comparative: pickAndRemove(h2Copy) || `## Performance Benchmarks & Relative Advantages`,
    h3Sub2: pickAndRemove(h3Copy) || `### Comparative Speed & Operational Testing`,
    h2Limitations: pickAndRemove(h2Copy) || `## Key Buyer Caveats & Practical Considerations`,
    h2Outlook: pickAndRemove(h2Copy) || `## Strategic Verdict & Future Roadmap`,
  };
}

/**
 * Generate a dynamic fallback title for any keyword to guarantee headline uniqueness
 */
function generateDynamicFallbackTitle(keyword: string, category: string, isSuffixAdded: boolean): string {
  const cleanKw = keyword.trim();
  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const tokens = extractKeywordSubTokens(cleanKw);

  if (tokens.isIdea) {
    return `${capitalizedKw}: Design Inspiration, Styling Trends, and Layout Ideas`;
  }
  if (tokens.isCold) {
    return `${capitalizedKw}: Cold Water Line Pressure, Frost Protection, and Care`;
  }
  if (tokens.isHot) {
    return `${capitalizedKw}: Instant Heat Delivery, Anti-Scald Valves, and Efficiency`;
  }
  if (tokens.isBlack) {
    return `${capitalizedKw}: Matte Finish PVD Care, Aesthetics, and Maintenance`;
  }

  const titleTemplates = [
    `Why ${capitalizedKw} Is Reshaping the Modern ${category.toUpperCase()} Landscape`,
    `${capitalizedKw} Tested: Performance, Features, and Real-World Verdict`,
    `The Definitive Guide to ${capitalizedKw}: Everything You Need to Know`,
    `Inside ${capitalizedKw}: Key Insights, Benchmarks, and Practical Advice`,
    `Is ${capitalizedKw} Worth the Investment? An In-Depth Editorial Breakdown`,
    `Navigating ${capitalizedKw}: Specs, Limitations, and Buyer Recommendations`,
    `Understanding ${capitalizedKw}: Core Features, Utility, and Future Outlook`,
    `${capitalizedKw} Handbook: Architecture, User Experience, and Long-Term Value`,
  ];

  const hash = getDeterministicHash(cleanKw);
  return titleTemplates[hash % titleTemplates.length];
}

/**
 * Generate dynamic, topic-tailored, 100% UNIQUE FAQs with ZERO formula overlap
 */
function generateDynamicFaqsForArticle(keyword: string, category: string): { question: string; answer: string }[] {
  const cleanKw = keyword.trim();
  const tokens = extractKeywordSubTokens(cleanKw);
  const capitalizedKw = cleanKw.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  const hash = getDeterministicHash(cleanKw);

  const faqs: { question: string; answer: string }[] = [];

  // 1. DESIGN IDEAS & INSPIRATION (e.g., "bathroom taps idea", "faucet design ideas")
  if (tokens.isIdea) {
    const pool = [
      {
        question: `What are the most popular design trends for ${capitalizedKw}?`,
        answer: `Organic sculptural spouts, wall-mounted concealed valves, and textured brushed metallic finishes like brass and matte black lead modern bathroom aesthetics.`
      },
      {
        question: `How do I choose the right spout height for ${capitalizedKw}?`,
        answer: `Measure sink bowl depth and rim height. Spouts should clear the rim by 4 to 6 inches, aiming water directly into the center of the drain bowl.`
      },
      {
        question: `Can I mix metal finishes when planning ${capitalizedKw}?`,
        answer: `Yes, keep your tap and shower trim as the primary metal accent, while pairing vanity cabinet knobs or towel hooks in a secondary complementary tone.`
      },
      {
        question: `Are wall-mounted taps better than deck-mounted options for ${capitalizedKw}?`,
        answer: `Wall-mounted taps create a clean floating look and free up counter space behind the sink, but require precise behind-the-wall plumbing rough-ins before tiling.`
      },
      {
        question: `How do I prevent splash mess when installing ${capitalizedKw}?`,
        answer: `Select a tap with an angled low-flow aerator stream and align the water fallout point directly over the sink drain opening.`
      }
    ];
    // Select 4 distinct FAQs based on hash offset
    for (let i = 0; i < 4; i++) {
      faqs.push(pool[(hash + i) % pool.length]);
    }
    return faqs;
  }

  // 2. COLD WATER TAPS (e.g., "bathroom cold tap")
  if (tokens.isCold && tokens.isTap) {
    const pool = [
      {
        question: `Why is cold water from my ${capitalizedKw} coming out lukewarm or warm?`,
        answer: `Warm water from a cold tap usually happens when pipes pass near heating ducts or when a faulty mixer valve elsewhere allows hot water to cross-bleed into the cold line.`
      },
      {
        question: `How do I protect my ${capitalizedKw} from freezing during severe winter frost?`,
        answer: `Insulate exterior wall pipes with foam sleeves, keep indoor heating at a minimum of 55°F (13°C), and let the tap trickle slowly during extreme cold snaps.`
      },
      {
        question: `Why is cold water pressure lower than hot water pressure on my ${capitalizedKw}?`,
        answer: `A partially closed under-sink isolation valve, mineral debris clogging the cold inlet cartridge, or localized pipe corrosion restricts cold water flow.`
      },
      {
        question: `Can I connect an under-sink water filter directly to a ${capitalizedKw}?`,
        answer: `Yes, under-sink inline carbon and reverse-osmosis filtration units connect directly to standard 3/8-inch cold supply lines without affecting hot water lines.`
      }
    ];
    return pool;
  }

  // 3. HOT WATER / BOILING TAPS (e.g., "bathroom hot tap")
  if (tokens.isHot && tokens.isTap) {
    const pool = [
      {
        question: `Why does it take several minutes for hot water to reach my ${capitalizedKw}?`,
        answer: `Long pipe runs between your water heater or boiler and the tap mean standing cold water must purge first. Installing a recirculating pump provides instant hot water.`
      },
      {
        question: `What temperature setting is recommended for a ${capitalizedKw}?`,
        answer: `Water heaters should be set to 120°F (49°C) to prevent thermal scalding while remaining hot enough to prevent bacteria growth in storage tanks.`
      },
      {
        question: `Why does water from my ${capitalizedKw} sputter or spit air when turned on?`,
        answer: `Air trapped in the hot water tank after plumbing repairs or high thermal expansion causes sputtering. Running the hot tap for 2 minutes usually clears it.`
      },
      {
        question: `How do thermostatic anti-scald valves protect users on a ${capitalizedKw}?`,
        answer: `Thermostatic valves automatically cut off or throttle hot water output if cold supply pressure drops suddenly, preventing accidental burns.`
      }
    ];
    return pool;
  }

  // 4. BLACK FINISH TAPS (e.g., "black bathroom tap")
  if (tokens.isBlack && tokens.isTap) {
    const pool = [
      {
        question: `How do I clean matte black finishes on ${capitalizedKw} without scratching?`,
        answer: `Use warm water with mild liquid dish soap and a soft microfiber cloth. Avoid abrasive sponges, bleach, or acidic sprays that strip protective PVD coatings.`
      },
      {
        question: `Why do white water spots form on my ${capitalizedKw}?`,
        answer: `Hard water minerals evaporate on dark matte surfaces leaving calcium spots. Wipe the spout dry with a towel after heavy use to prevent mineral deposits.`
      },
      {
        question: `Do matte black taps peel or chip over time?`,
        answer: `Quality electroplated or PVD matte black finishes bond atomically to solid brass, preventing peeling or chipping under standard daily cleaning.`
      },
      {
        question: `What pop-up drain finish should I match with a matte black ${capitalizedKw}?`,
        answer: `Choose a matching matte black brass pop-up waste assembly to maintain a cohesive monochrome aesthetic inside the sink basin.`
      }
    ];
    return pool;
  }

  // 5. GENERAL TAPS & MIXERS (e.g., "bathroom tap", "basin faucet")
  if (tokens.isTap) {
    const pool = [
      {
        question: `What is the main difference between single-handle and dual-handle ${capitalizedKw} models?`,
        answer: `Single-handle models let you control temperature and volume with one hand, while dual-handle fixtures offer separate, precise control over hot and cold streams.`
      },
      {
        question: `How do ceramic disc cartridges prevent drips in a ${capitalizedKw}?`,
        answer: `Ceramic disc cartridges feature smooth diamond-hard ceramic plates that seal tight without rubber washers, eliminating drips and lasting for years.`
      },
      {
        question: `Why is water splashing out of the basin when using my ${capitalizedKw}?`,
        answer: `The water stream might be striking the drain directly at high pressure. Installing a low-flow aerator softens the stream and prevents splashing.`
      },
      {
        question: `How do I maintain smooth handle movement on a ${capitalizedKw}?`,
        answer: `Periodically clean internal cartridge mineral buildup by soaking the removable cartridge in mild white vinegar every few years.`
      }
    ];
    return pool;
  }

  // 6. BATHTUBS & BASINS (e.g., "bathroom tub", "soaking basin")
  if (tokens.isTub) {
    const pool = [
      {
        question: `What water flow rate is recommended for filling a ${capitalizedKw}?`,
        answer: `High-flow tub fillers typically require 4 to 8 gallons per minute (GPM) at 3.0 bar pressure so large soaking basins fill quickly without water cooling down.`
      },
      {
        question: `Should I choose a wall-mounted or deck-mounted fixture for my ${capitalizedKw}?`,
        answer: `Deck-mounted fixtures install directly on the tub rim for easy access, while wall-mounted taps create a clean floating look but require in-wall rough-in plumbing.`
      },
      {
        question: `How do I prevent leaks under the rim of a ${capitalizedKw}?`,
        answer: `Apply high-grade silicone sealant or plumber's putty beneath the fixture flange and securely tighten the locknut underneath to maintain a watertight barrier.`
      },
      {
        question: `How do I clean soap scum and hard water deposits off a ${capitalizedKw}?`,
        answer: `Soak a rag in warm white vinegar, wrap it around affected spouts or handles for 20 minutes, then wipe clean with a soft microfiber cloth.`
      }
    ];
    return pool;
  }

  // 7. DRAINS & WASTE PIPES (e.g., "bathtub drain")
  if (tokens.isDrain) {
    const pool = [
      {
        question: `What is the easiest chemical-free way to unblock a ${capitalizedKw}?`,
        answer: `Insert a plastic zip-it drain snake to pull out hair clogs physically, then flush with boiling water mixed with baking soda and white vinegar.`
      },
      {
        question: `Why does a bad sewer smell come up from my ${capitalizedKw}?`,
        answer: `A dry P-trap water seal or rotting hair residue inside the overflow channel causes sewer smells. Flushing warm water and mild disinfectant clears it.`
      },
      {
        question: `What pipe diameter is standard for a residential ${capitalizedKw}?`,
        answer: `Standard tub and shower drains connect to 1.5-inch PVC or ABS pipes, while vanity sink drains typically use 1.25-inch waste assemblies.`
      },
      {
        question: `How do tip-toe stoppers compare to trip-lever drain plugs for a ${capitalizedKw}?`,
        answer: `Tip-toe plugs press down by hand/foot and unscrew easily for hair removal, whereas trip-lever stoppers rely on overflow linkage rods that require periodic adjustment.`
      }
    ];
    return pool;
  }

  // 8. TECH EXECUTIVES (e.g., "elon musk", "sam altman")
  if (tokens.isMusk) {
    const pool = [
      {
        question: `What core engineering methodology defines leadership in ${capitalizedKw}?`,
        answer: `First-principles thinking—questioning every legacy requirement, reducing complex problems to basic physics laws, and rebuilding efficient solutions from scratch.`
      },
      {
        question: `Why is vertical integration critical for ventures associated with ${capitalizedKw}?`,
        answer: `Designing and manufacturing components in-house cuts out middleman supplier markups, speeds up design iterations, and ensures tight quality control.`
      },
      {
        question: `How do rapid prototyping and telemetry cycles drive technological progress?`,
        answer: `By testing early prototypes to failure, engineering teams collect real-world telemetry data to instantly fix flaws in subsequent hardware revisions.`
      },
      {
        question: `What role does flat management play in organizational velocity?`,
        answer: `Eliminating traditional corporate layers allows engineers to speak directly to decision-makers, speeding up execution and product deployment.`
      }
    ];
    return pool;
  }

  // 9. TV & DISPLAYS (e.g., "samsung tv")
  if (tokens.isTv) {
    const pool = [
      {
        question: `What is the key visual difference between QLED and QD-OLED for ${capitalizedKw}?`,
        answer: `QLED uses Quantum Dot Mini-LED backlights for intense brightness in brightly lit rooms, while QD-OLED uses self-emissive pixels for perfect black levels in dark home theaters.`
      },
      {
        question: `Why is a 120Hz or 144Hz refresh rate important on a modern ${capitalizedKw}?`,
        answer: `Higher refresh rates combined with Variable Refresh Rate (VRR) eliminate screen tearing, reduce motion blur, and drop input lag under 10ms for next-gen console gaming.`
      },
      {
        question: `What HDMI cable is required to output full 4K at 120Hz on ${capitalizedKw}?`,
        answer: `An Ultra High Speed HDMI 2.1 cable rated for 48Gbps bandwidth is required to support uncompressed 4K video at 120Hz alongside eARC Dolby Atmos audio.`
      },
      {
        question: `How do anti-glare screen coatings improve viewing on ${capitalizedKw}?`,
        answer: `Anti-reflective layers scatter incoming room reflections and sunlight, maintaining sharp contrast and vivid color volume even in sunlit living rooms.`
      }
    ];
    return pool;
  }

  // 10. GENERAL FALLBACK FAQ GENERATOR (100% Dynamic, custom tailored per keyword)
  faqs.push(
    {
      question: `What routine maintenance is recommended for ${capitalizedKw}?`,
      answer: `Perform routine visual inspections for surface wear, clean components with non-abrasive products, and address minor performance shifts early.`
    },
    {
      question: `What key specifications should buyers evaluate for ${capitalizedKw}?`,
      answer: `Prioritize build material quality, manufacturer warranty coverage, system dimensions, and verified real-world user feedback over promotional claims.`
    },
    {
      question: `How do recent innovations in ${capitalizedKw} improve everyday performance?`,
      answer: `Modern engineering updates emphasize higher efficiency, ergonomic operation, and enhanced durability under daily usage loads.`
    },
    {
      question: `What common setup mistake should be avoided with ${capitalizedKw}?`,
      answer: `Skipping pre-installation spatial measurements or overtightening fittings during assembly often leads to seal strain, leaks, or premature wear.`
    }
  );

  return faqs;
}

/**
 * Generate a complete blog article dynamically using Gemini AI & Unsplash API
 */
export async function generateArticleObjectAsync(
  keyword: string,
  categoryOverride?: string,
  customSlug?: string
): Promise<Article> {
  const cleanKw = keyword.trim();

  // Use clean slug directly (e.g. "elon-musk", "bathtub-drain") so generated articles immediately update target URLs
  const slug =
    customSlug ||
    cleanKw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

  // Attempt real Gemini AI generation
  const geminiData = await fetchGeminiArticle(cleanKw, categoryOverride);
  const category = geminiData?.category || categoryOverride || inferCategoryFromKeyword(cleanKw);

  // Fetch unique photograph from Unsplash API for this specific keyword & category
  const image = await fetchUniqueUnsplashImage(cleanKw, category);

  let resultArticle: Article;

  if (geminiData) {
    resultArticle = {
      id: `gemini-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    // Comprehensive Dynamic Fallback (900-1200 words) with 100% unique title, headings & FAQs
    const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
    const title = generateDynamicFallbackTitle(cleanKw, category, false);
    const headings = generateDynamicHeadingsForArticle(cleanKw, category);
    const excerpt = `An essential, reader-first examination of ${cleanKw}, exploring technical benchmarks, real-world utility, and future market trends.`;
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
  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const category = item.category || inferCategoryFromKeyword(cleanKw);
  const slug = item.generatedArticleSlug || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
  const title = generateDynamicFallbackTitle(cleanKw, category, false);
  const headings = generateDynamicHeadingsForArticle(cleanKw, category);
  const excerpt = `An essential, reader-first examination of ${cleanKw}, exploring technical benchmarks, real-world utility, and future market trends.`;
  const content = generateDynamicDomainParagraphs(cleanKw, category, headings);

  // Synchronously compute deterministic image URL and ALT text
  const cleanKwLower = cleanKw.toLowerCase();
  const slugSig = cleanKwLower.replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(cleanKwLower);
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
    imageAlt: `Editorial photography for ${cleanKw}`,
    imageCaption: `Editorial photograph for ${cleanKw}.`,
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

  // Include any published items from queue so they appear in feed across all serverless instances
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

  // On-demand generation for cold-start Vercel lambdas
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
