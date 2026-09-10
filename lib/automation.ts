import { Article, ARTICLES } from "@/data/articles";
import { formatMetaDescription } from "@/lib/meta";

export interface QueueItem {
  id: string;
  keyword: string;
  category?: string;
  status: "pending" | "publishing" | "published" | "failed";
  createdAt: string;
  publishedAt?: string;
  generatedArticleSlug?: string;
}

// ============================================================================
// ============================================================================
// SINGLE GEMINI ARTICLE GENERATION PROMPT (NO YEAR, HIGH CTR, LISTICLE SUPPORT)
// ============================================================================
export const GEMINI_ARTICLE_PROMPT = `You are an expert SEO editor and senior journalist for On Gravity Magazine.

Your objective is to write a unique, highly SEO-optimized, publication-ready article based on the submitted keyword/topic.

STRICT TITLE & WRITING INSTRUCTIONS:

1. CLICKABLE SEO TITLE GENERATION:
   - Create an irresistible, click-worthy title (50-65 characters) starting directly with "# ".
   - Incorporate the primary keyword naturally ANYWHERE in the title (beginning, middle, or end). It does NOT need to be at the start.
   - DO NOT include any year (e.g. DO NOT write "2026" or "(2026)").
   - DO NOT overuse the word "Guide". Vary the title formats across reviews, secrets, honest breakdowns, performance checks, and buying advice.
   - Examples of Clickable SEO Titles:
     - Keyword "hp laptop" -> "# 5 Must-Know Secrets Before Buying an HP Laptop"
     - Keyword "dell laptop" -> "# Is the Dell Laptop Worth It? Performance Specs & Real Verdict"
     - Keyword "5 best hp laptops" -> "# 5 Best HP Laptops: Performance, Specs & Top Picks"
     - Keyword "6 best toys for kids" -> "# 6 Best Toys for Kids: Safety Ratings & Fun Features"
   - Make it sound like an engaging magazine cover story that compels readers to click!

2. UNIQUE SEO META SUMMARY / EXCERPT:
   - On the very next line after the title, output "EXCERPT: [Write a unique, punchy 140-155 character meta description summarizing the specific topic, value proposition, and key takeaway of this article]".
   - DO NOT repeat generic sentences. Make the summary 100% unique to this keyword.

3. SEO HEADINGS & LISTICLE OUTLINES:
   - Organize the article using "## " for H2 headings and "### " for H3 subheadings.
   - LISTICLE COUNT RULE: If the keyword specifies a number N (e.g., "5 best...", "6 best..."), you MUST create exactly N distinct item headings (e.g., "## 1. [Item Name]", "## 2. [Item Name]" up to "## N. [Item Name]") and write a full, informative paragraph under EACH item!

4. BULLET POINTS RULE:
   - Use bullet points ONLY when naturally helpful (e.g. key specs, feature comparisons, pros/cons, or checklists).
   - DO NOT include bullet points in every single article. Many articles should be paragraph-only for natural editorial reading flow.

5. HIGH-INTENT CONTENT & DENSITY:
   - Write clear, informative, well-developed paragraphs directly under every H2 and H3 heading.
   - Answer search intent directly in the introduction. Avoid fluff, filler, or repeating points.

6. CONCLUSION:
   - Include a dedicated "## Conclusion" section summarizing key insights, final verdict, and actionable advice.

7. FREQUENTLY ASKED QUESTIONS (FAQs):
   - Include a dedicated "## Frequently Asked Questions" section at the end with 2 to 3 FAQs.
   - Questions must be short and direct. Answers must be concise (1 to 2 sentences max).
   - Format each FAQ clearly as:
     ### Q: [Short Question]
     A: [Short Answer]

8. NATURAL INTERNAL LINKING (OPTIONAL):
   - You may include 1 to 2 markdown internal links like [link text](/target-slug) ONLY if it naturally fits the sentence context for a related article (e.g. [bathroom taps](/bathroom-taps) or [hp laptop](/hp-laptop)).
   - DO NOT force internal links when not relevant. Internal linking is strictly optional and must only occur when a genuine relation exists.

9. ORIGINALITY & NO META-TEXT:
   - Every single generated article must be completely fresh, distinct, and unique.
   - Do not include meta-commentary, AI references, or prompt explanations.

Start directly with # [Generated Title].`;

const CACHE_FILES = [
  "/tmp/on_gravity_articles_cache_permanent.json",
  "/tmp/on_gravity_articles_cache_v12.json",
  "/tmp/on_gravity_articles_cache_v11.json",
  "/tmp/on_gravity_articles_cache_v10.json"
];

function loadCacheFromDisk(): Article[] {
  if (typeof window !== "undefined") return [];
  const map = new Map<string, Article>();
  try {
    const req = eval("require");
    const fsMod = req("fs");
    if (fsMod) {
      for (const cacheFile of CACHE_FILES) {
        if (fsMod.existsSync(cacheFile)) {
          const data = fsMod.readFileSync(cacheFile, "utf-8");
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            for (const art of parsed) {
              if (art && art.slug && !map.has(art.slug)) {
                map.set(art.slug, art);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    // Ignore
  }
  return Array.from(map.values());
}

function saveCacheToDisk(articles: Article[]) {
  if (typeof window !== "undefined") return;
  try {
    const cacheFile = CACHE_FILES[0];
    const req = eval("require");
    const fsMod = req("fs");
    if (fsMod) {
      fsMod.writeFileSync(cacheFile, JSON.stringify(articles.slice(0, 500)), "utf-8");
    }
  } catch (e) {
    // Ignore
  }
}

const getGeminiApiKey = () => {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    return typeof atob !== "undefined"
      ? atob("QVEuQWI4Uk42SVZwanJURFJwMGcyck9tcEtMdUFfX1ExeXRPdnkyRlpyVVhiWU1zaUl2VlE=")
      : Buffer.from("QVEuQWI4Uk42SVZwanJURFJwMGcyck9tcEtMdUFfX1ExeXRPdnkyRlpyVVhiWU1zaUl2VlE=", "base64").toString("utf-8");
  } catch (e) {
    return "";
  }
};
const getUnsplashAccessKey = () => process.env.UNSPLASH_ACCESS_KEY || "FLqjxtnt8-eGS9mpiB3-GMOvHhVAqT4_lQxyslYLO0A";

let dynamicArticlesStore: Article[] = [];
let keywordQueueStore: QueueItem[] = [];
let autoPublishingActive = false;

export function isAutoPublishingActive(): boolean {
  return autoPublishingActive;
}

export function stopAutoPublishing(): void {
  autoPublishingActive = false;
}

export function startAutoPublishing(): void {
  autoPublishingActive = true;
}

function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function formatNaturalKeyword(keyword: string): {
  raw: string;
  title: string;
  singular: string;
  plural: string;
  withArticle: string;
  topic: string;
} {
  const raw = keyword.replace(/&/g, "and").trim();
  const lower = raw.toLowerCase();
  const words = lower.split(/\s+/);

  const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const lastWord = words[words.length - 1];
  const isPlural = lastWord.endsWith("s") || lastWord === "ideas" || lastWord === "tips" || lastWord === "insights";
  const singular = isPlural ? raw.replace(/s$/i, "") : raw;
  const plural = isPlural ? raw : raw + "s";
  const startsWithVowel = /^[aeiou]/i.test(raw);
  const withArticle = isPlural ? raw : startsWithVowel ? `an ${raw}` : `a ${raw}`;

  return { raw, title, singular, plural, withArticle, topic: raw };
}

export function extractKeywordSubTokens(keyword: string) {
  const kw = keyword.toLowerCase();
  return {
    isTiles: kw.includes("tile") || kw.includes("flooring") || kw.includes("paving"),
    isBathroom: kw.includes("bathroom") || kw.includes("toilet") || kw.includes("seat") || kw.includes("shower") || kw.includes("tub"),
    isCold: kw.includes("cold"),
    isHot: kw.includes("hot"),
    isBlack: kw.includes("black") || kw.includes("matte"),
    isTap: kw.includes("tap") || kw.includes("faucet") || kw.includes("plumbing"),
    isGaming: kw.includes("gaming") || kw.includes("mouse") || kw.includes("keyboard"),
    isSmartHome: kw.includes("smart") || kw.includes("hub") || kw.includes("automation"),
  };
}

export function inferCategoryFromKeyword(keyword: string): string {
  const kw = keyword.toLowerCase();
  if (kw.includes("celebrity") || kw.includes("actor") || kw.includes("fashion") || kw.includes("gala") || kw.includes("style")) return "celebrity";
  if (
    kw.includes("lifestyle") ||
    kw.includes("life-style") ||
    kw.includes("home") ||
    kw.includes("bathroom") ||
    kw.includes("toilet") ||
    kw.includes("seat") ||
    kw.includes("bathtub") ||
    kw.includes("faucet") ||
    kw.includes("tap") ||
    kw.includes("tile") ||
    kw.includes("decor") ||
    kw.includes("furniture") ||
    kw.includes("interior")
  ) return "life-style";
  if (kw.includes("health") || kw.includes("sleep") || kw.includes("fitness") || kw.includes("wellness")) return "health";
  if (kw.includes("business") || kw.includes("crypto") || kw.includes("stock") || kw.includes("market") || kw.includes("invest") || kw.includes("finance")) return "business";
  if (kw.includes("food") || kw.includes("dining") || kw.includes("chef") || kw.includes("coffee") || kw.includes("recipe")) return "food";
  if (kw.includes("news") || kw.includes("climate") || kw.includes("policy") || kw.includes("global") || kw.includes("world")) return "news";
  return "tech";
}

export function formatSeoTitle(rawKeyword: string, hashVal: number = 0): string {
  const clean = rawKeyword.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  let kwWords = clean.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const highCtrTemplates = [
    `${kwWords} Review: 5 Must-Know Secrets Before You Buy`,
    `Is ${kwWords} Worth It? Performance Specs, Pricing and Verdict`,
    `${kwWords} Analysis: Key Features, Top Models and Honest Verdict`,
    `${kwWords} Breakdown: Performance Checks and Expert Advice`,
    `Essential ${kwWords} Insights: Real Testing and Buyer Choice`
  ];

  return highCtrTemplates[Math.abs(hashVal) % highCtrTemplates.length].replace(/&/g, "and");
}

async function fetchUniqueUnsplashImage(keyword: string, category: string, usedUrls: Set<string> = new Set()): Promise<{ url: string; caption: string; alt: string }> {
  const accessKey = getUnsplashAccessKey();
  const cleanKw = keyword.trim().toLowerCase().replace(/&/g, "and");
  const hashVal = getDeterministicHash(cleanKw);
  const slugSig = cleanKw.replace(/[^a-z0-9]+/g, "-");

  if (accessKey) {
    try {
      const pageNum = (hashVal % 3) + 1;
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=30&page=${pageNum}&orientation=landscape&client_id=${accessKey}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const unusedPhotos = data.results.filter((p: any) => {
            const u = p.urls?.regular || p.urls?.full;
            return u && !usedUrls.has(u);
          });
          const photoList = unusedPhotos.length > 0 ? unusedPhotos : data.results;
          const photoIndex = hashVal % photoList.length;
          const photo = photoList[photoIndex];
          const imgUrl = photo.urls?.regular || photo.urls?.full;
          if (imgUrl) {
            return {
              url: imgUrl,
              caption: (photo.description || photo.alt_description || `Editorial photograph for ${keyword} on On Gravity Magazine.`).replace(/&/g, "and"),
              alt: (photo.alt_description || `High resolution photograph of ${keyword}`).replace(/&/g, "and"),
            };
          }
        }
      }
    } catch (e) {
      // Fallback below
    }
  }

  const categoryPhotoPools: Record<string, string[]> = {
    "life-style": [
      "photo-1584622650111-993a426fbf0a",
      "photo-1507652313519-d4e9174996dd",
      "photo-1552321554-5fefe8c9ef14",
      "photo-1620626011761-996317b8d101",
      "photo-1512917774080-9991f1c4c750",
      "photo-1618221195710-dd6b41faaea6",
      "photo-1616486338812-3dadae4b4ace",
      "photo-1600585154340-be6161a56a0c",
      "photo-1600566753376-12c8ab7fb75b"
    ],
    tech: [
      "photo-1615663245857-ac93bb7c39e7",
      "photo-1593359677879-a4bb92f829d1",
      "photo-1517336714731-489689fd1ca8",
      "photo-1498050108023-c5249f4df085",
      "photo-1526374965328-7f61d4dc18c5",
      "photo-1550745165-9bc0b252726f",
      "photo-1531297484001-80022131f5a1",
      "photo-1496181133206-80ce9b88a853"
    ],
    health: [
      "photo-1506126613408-eca07ce68773",
      "photo-1540420773420-3366772f4999",
      "photo-1571019613454-1cb2f99b2d8b",
      "photo-1518611012118-696072aa579a",
      "photo-1498837167922-ddd27525d352"
    ],
    celebrity: [
      "photo-1492684223066-81342ee5ff30",
      "photo-1515886657613-9f3515b0c78f",
      "photo-1509631179647-0177331693ae",
      "photo-1469371670807-013ccf25f16a"
    ],
    business: [
      "photo-1621416894569-0f39ed31d247",
      "photo-1486406146926-c627a92ad1ab",
      "photo-1454165804606-c3d57bc86b40",
      "photo-1507679799987-c73779587ccf"
    ],
    food: [
      "photo-1555396273-367ea4eb4db5",
      "photo-1504674900247-0877df9cc836",
      "photo-1495521821757-a1efb6729352"
    ],
    news: [
      "photo-1470071459604-3b5ec3a7fe05",
      "photo-1585829365295-ab7cd400c167",
      "photo-1504711434969-e33886168f5c"
    ]
  };

  const pool = categoryPhotoPools[category] || categoryPhotoPools["life-style"];
  const photoIndex = hashVal % pool.length;
  const selectedPhotoId = pool[photoIndex];

  return {
    url: `https://images.unsplash.com/${selectedPhotoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}_${hashVal}`,
    caption: `Editorial photograph highlighting ${keyword}.`,
    alt: `Photograph of ${keyword}`
  };
}

export function extractCountFromKeyword(keyword: string): number | null {
  const match = keyword.match(/\b(\d+)\s+(best|top|ways|tips|reasons|models|items|choices|features|laptops|toys|products|ideas|things|tricks)\b/i) ||
                keyword.match(/\b(best|top|ways|tips|reasons|models|items|choices|features|laptops|toys|products|ideas|things|tricks)\s+(\d+)\b/i);
  if (match) {
    const num = parseInt(match[1] || match[2], 10);
    if (num >= 2 && num <= 15) return num;
  }
  return null;
}

// ============================================================================
// CALL GEMINI API WITH MULTI-MODEL FAILOVER AND DYNAMIC RANDOM SEED
// ============================================================================
async function fetchArticleFromGeminiApi(keyword: string): Promise<{
  title: string;
  excerpt: string;
  paragraphs: string[];
  faqs?: { question: string; answer: string }[];
} | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const candidateModels = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b"
  ];

  const randomRunId = Math.random().toString(36).substring(2, 9);
  const count = extractCountFromKeyword(keyword);
  let listicleInstruction = "";
  if (count) {
    listicleInstruction = `\n\nCRITICAL COUNT INSTRUCTION: The keyword asks for "${count}" items. You MUST create exactly ${count} main item headings (using "## 1. [Item]", "## 2. [Item]" up to "## ${count}. [Item]") and write a full, informative paragraph under EACH of the ${count} item headings!`;
  }

  const promptText = `${GEMINI_ARTICLE_PROMPT}${listicleInstruction}\n\nSubmitted Keyword / Topic: "${keyword}"\n[Run ID: ${randomRunId}]`;

  for (const modelName of candidateModels) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: promptText
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.75,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        console.warn(`Gemini API returned status ${response.status} for model ${modelName}. Trying next model...`);
        continue;
      }

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText && typeof candidateText === "string" && candidateText.trim().length > 100) {
        const parsed = parseGeminiMarkdownArticle(candidateText, keyword);
        if (parsed && parsed.paragraphs.length >= 2) {
          return parsed;
        }
      }
    } catch (error) {
      console.error(`Gemini API call failed for model ${modelName}:`, error);
    }
  }

  return null;
}

function parseGeminiMarkdownArticle(rawText: string, keyword: string) {
  const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let title = "";
  let explicitExcerpt = "";
  let paragraphs: string[] = [];
  let faqs: { question: string; answer: string }[] = [];

  let inFaqs = false;
  let currentFaqQ = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!title && (line.startsWith("# ") || line.toLowerCase().startsWith("title:"))) {
      title = line.replace(/^#\s+|^Title:\s*/i, "").replace(/&/g, "and");
      continue;
    }

    if (!explicitExcerpt && (line.toLowerCase().startsWith("excerpt:") || line.toLowerCase().startsWith("summary:") || line.toLowerCase().startsWith("meta:"))) {
      explicitExcerpt = line.replace(/^excerpt:|^summary:|^meta:\s*/i, "").replace(/&/g, "and");
      continue;
    }

    if (line.toLowerCase().includes("frequently asked questions") || line.toLowerCase() === "## faqs" || line.toLowerCase().startsWith("## faq")) {
      inFaqs = true;
      continue;
    }

    if (inFaqs) {
      if (line.startsWith("### Q:") || line.startsWith("Q:") || line.startsWith("### ") || line.startsWith("**Q:")) {
        if (currentFaqQ && lines[i + 1]) {
          const ans = lines[i + 1].replace(/^[\*\s]*(A|Answer)\s*[:\.]?\s*/gi, "").replace(/&/g, "and").trim();
          const qClean = currentFaqQ.replace(/^[\*\s]*(Q|Question)\s*[:\.]?\s*/gi, "").replace(/&/g, "and").trim();
          faqs.push({ question: qClean, answer: ans });
          currentFaqQ = "";
        }
        currentFaqQ = line.replace(/^#+\s*/, "").replace(/^[\*\s]*(Q|Question)\s*[:\.]?\s*/gi, "").trim();
      } else if (currentFaqQ) {
        const ans = line.replace(/^[\*\s]*(A|Answer)\s*[:\.]?\s*/gi, "").replace(/&/g, "and").trim();
        const qClean = currentFaqQ.replace(/^[\*\s]*(Q|Question)\s*[:\.]?\s*/gi, "").replace(/&/g, "and").trim();
        faqs.push({ question: qClean, answer: ans });
        currentFaqQ = "";
      }
      continue;
    }

    paragraphs.push(line.replace(/&/g, "and"));
  }

  if (!title) {
    title = formatSeoTitle(keyword);
  } else {
    title = title.replace(/\s*\(?20\d\d\)?\s*/g, " ").replace(/\s+/g, " ").trim();
  }

  const firstBodyPara = paragraphs.find(p => !p.startsWith("#")) || `An in-depth editorial guide covering ${keyword}.`;
  const excerpt = formatMetaDescription(explicitExcerpt || firstBodyPara);

  return { title, excerpt, paragraphs, faqs: faqs.length > 0 ? faqs : undefined };
}

function generateTopicFallbackArticle(keyword: string, hashVal: number) {
  const kwFmt = formatNaturalKeyword(keyword);
  const topicTitle = kwFmt.title.replace(/&/g, "and");
  const topicRaw = kwFmt.raw.replace(/&/g, "and");
  const tokens = extractKeywordSubTokens(keyword);
  const count = extractCountFromKeyword(keyword) || 5;

  const title = formatSeoTitle(keyword, hashVal);

  if (tokens.isTap) {
    if (tokens.isCold) {
      const coldExcerpt = formatMetaDescription(`Discover everything you need to know about bathroom cold taps, including water pressure guidelines, ceramic disc valves, and anti-corrosive finishes.`);
      const coldParagraphs = [
        `Single cold water taps remain an essential fixture in modern cloakrooms, utility rooms, and traditional twin-basin arrangements. Unlike mixer taps that combine hot and cold streams, a dedicated cold tap connects directly to your mains or cold storage supply, delivering immediate unheated water with maximum flow efficiency.`,
        `## Key Features of High-Performance Cold Taps`,
        `When selecting a cold tap for your bathroom, solid brass construction with electroplated chrome or matte black finishes provides long-term resistance to rust and mineral buildup. Quarter-turn ceramic disc valves replace old rubber washers, preventing annoying drips and allowing smooth, effortless operation.`,
        `## Cold Tap Installation & Water Pressure Considerations`,
        `Most bathroom cold taps operate efficiently across both low-pressure gravity systems (0.2 bar) and high-pressure unvented mains (1.0+ bar). Ensuring proper thread fitting (typically 1/2-inch BSP) and checking spout height relative to basin depth prevents splashback during daily use.`,
        `## Conclusion`,
        `Investing in a well-crafted bathroom cold tap guarantees reliable daily utility, leak-free operation, and an elegant accent for compact washrooms.`
      ];
      const coldFaqs = [
        { question: `Can a bathroom cold tap be installed on a high-pressure system?`, answer: `Yes, solid brass cold taps handle both high-pressure mains and low-pressure gravity feeds without issue.` },
        { question: `Why is my cold tap dripping?`, answer: `Dripping is usually caused by a worn ceramic disc cartridge or degraded washer inside the tap body.` },
        { question: `What is the standard pipe size for a bathroom cold tap?`, answer: `Standard UK and European basin cold taps use a 1/2-inch BSP connection.` }
      ];
      return { title: "Essential Features of a High-Efficiency Bathroom Cold Tap", excerpt: coldExcerpt, paragraphs: coldParagraphs, faqs: coldFaqs };
    } else {
      const tapExcerpt = formatMetaDescription(`An in-depth review of bathroom taps, comparing monobloc basin mixers, wall-mounted spouts, and durable brass construction for modern washrooms.`);
      const tapParagraphs = [
        `Upgrading your bathroom taps is one of the most impactful ways to elevate both the aesthetic and functional quality of your washroom. From sleek monobloc basin mixers to classic pillar taps and luxurious wall-mounted spouts, choosing the right fixture depends on your plumbing system, basin design, and style preferences.`,
        `## Monobloc Mixers vs. Pillar Taps`,
        `Monobloc basin taps blend hot and cold water through a single spout, offering precise temperature control via single or dual levers. Pillar taps, by contrast, feature separate hot and cold spouts, ideal for traditional twin-hole basins or period-style interiors.`,
        `## Materials, Finishes & Valve Technology`,
        `High-grade brass bodies plated in brushed nickel, chrome, or architectural matte black ensure exceptional durability against corrosion and hard water stains. Modern quarter-turn ceramic disc technology replaces traditional rubber washers, eliminating drips and guaranteeing smooth handle rotation.`,
        `## Conclusion`,
        `Selecting the ideal bathroom taps involves balancing your home water pressure, basin compatibility, and desired architectural finish for lasting beauty and performance.`
      ];
      const tapFaqs = [
        { question: `What is the difference between low pressure and high pressure taps?`, answer: `Low pressure taps feature wider internal waterways to allow strong flow from gravity-fed tanks, while high pressure taps suit combi boilers.` },
        { question: `How do I prevent water spots on matte black bathroom taps?`, answer: `Clean regularly with a soft microfibre cloth and warm soapy water, avoiding abrasive chemical cleaners.` },
        { question: `What is a ceramic disc valve in a tap?`, answer: `It uses two rotating ceramic discs that align to control water flow, replacing rubber washers for leak-free durability.` }
      ];
      return { title: "Selecting the Ideal Bathroom Taps: Styles, Finishes and Performance", excerpt: tapExcerpt, paragraphs: tapParagraphs, faqs: tapFaqs };
    }
  }

  if (tokens.isTiles) {
    const tileExcerpt = formatMetaDescription("Explore expert tips on selecting bathroom tiles across porcelain, ceramic, and natural stone for maximum safety, slip ratings, and design.");
    const tileParagraphs = [
      "Bathroom tiles set the tone for your sanctuary. Selecting the right tile material, texture, and scale involves balancing moisture resistance with slip safety and long-term maintenance requirements.",
      "## 1. Porcelain vs Ceramic Bathroom Tiles",
      "Porcelain tiles are fired at higher temperatures, making them dense, non-porous, and exceptionally resistant to water absorption. Ceramic tiles are lighter and easier to cut, making them ideal for vertical accent walls and backsplashes.",
      "## 2. Slip Resistance Ratings (R-Ratings)",
      "Safety is paramount in wet zone areas like shower floors. Select floor tiles with textured matte finishes rated R10 or higher to ensure firm underfoot grip when surfaces are wet.",
      "## 3. Large Format Tiles vs Mosaic Textures",
      "Large format porcelain tiles minimize grout lines, creating an expansive, hotel-suite aesthetic that is easy to wipe clean. Mosaics add rich tactile contrast and natural anti-slip traction under foot.",
      "## 4. Grout Sealing and Water Resistance",
      "Proper epoxy grout selection and sealant application prevent moisture infiltration behind tile backer boards, inhibiting mold growth and maintaining pristine grout lines.",
      "## 5. Lighting and Color Palette Integration",
      "Pairing light-reflecting glossy wall tiles with warm LED vanity illumination expands small washroom spaces, while dark slate floor tiles ground the room with dramatic elegance.",
      "## Conclusion",
      "Combining large format porcelain wall tiles with slip-resistant textured floor tiles provides an optimal blend of low maintenance, safety, and timeless elegance."
    ];
    const tileFaqs = [
      { question: "Which tiles are least slippery when wet in a bathroom?", answer: "Matte porcelain or micro-textured mosaic tiles provide superior slip resistance in wet shower zones." },
      { question: "Do large format bathroom tiles make small washrooms look bigger?", answer: "Yes, fewer grout lines create an uninterrupted visual flow that expands perceived room size." },
      { question: "How often should bathroom tile grout be sealed?", answer: "Standard cementitious tile grout should be sealed annually to prevent moisture absorption and staining." }
    ];
    return { title: "Complete Breakdown of Bathroom Tiles: Durability, Slip Ratings and Style", excerpt: tileExcerpt, paragraphs: tileParagraphs, faqs: tileFaqs };
  }

  const excerpt = formatMetaDescription(`A comprehensive editorial breakdown of ${topicRaw}, evaluating top performance metrics, user reviews, and key buying considerations.`);
  const paragraphs: string[] = [];
  const intros = [
    `Analyzing ${topicRaw} requires evaluating build specifications, practical daily utility, and long-term value.`,
    `When evaluating top options for ${topicRaw}, understanding key feature sets and real-world performance is essential.`,
    `A thorough examination of ${topicRaw} reveals distinct design advantages, performance metrics, and user feedback.`
  ];
  paragraphs.push(intros[hashVal % intros.length]);

  const featureAspects = [
    "evaluating performance metrics and build quality reveals impressive resilience and seamless operational efficiency for daily use.",
    "design ergonomics and material selection stand out, offering user-friendly operation paired with robust long-term durability.",
    "value proposition and efficiency standards exceed expectations, delivering reliable utility across demanding environment setups.",
    "precision crafting and maintenance requirements showcase exceptional engineering standards across all tests.",
    "integration capabilities and operational flow perform smoothly, ensuring peak results without unwanted performance drops.",
    "overall reliability and user feedback consistently highlight satisfaction with build longevity, finish texture, and feature depth."
  ];

  for (let i = 1; i <= count; i++) {
    paragraphs.push(`## ${i}. ${topicTitle} Key Feature #${i}`);
    const aspectText = featureAspects[(hashVal + i) % featureAspects.length];
    paragraphs.push(`When reviewing option #${i} for ${topicRaw}, ${aspectText} Key considerations include material strength, aesthetic alignment, and practical daily utility.`);
  }

  paragraphs.push(`## Conclusion`);
  paragraphs.push(`In summary, choosing the right setup for ${topicRaw} comes down to identifying your specific space requirements, budget, and long-term performance expectations.`);

  const faqs = [
    { question: `What should I look for when selecting ${topicRaw}?`, answer: `Focus on material durability, verified user feedback, and compatibility with your existing setup.` },
    { question: `How can I maintain long-term performance for ${topicRaw}?`, answer: `Perform regular maintenance checks and follow manufacturer care instructions.` },
    { question: `Is upgrading to a premium model of ${topicRaw} worth the cost?`, answer: `Premium models typically offer superior materials, extended warranties, and better overall durability.` }
  ];

  return { title, excerpt, paragraphs, faqs };
}

export async function generateArticleObjectAsync(
  rawKeyword: string,
  categoryOverride?: string,
  slugOverride?: string,
  clientSlugs?: string[]
): Promise<Article> {
  const cleanKw = rawKeyword.replace(/&/g, "and").trim();
  const baseSlug = slugOverride || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  let slug = baseSlug;

  if (!slugOverride) {
    const allExisting = getAllArticlesCombined();
    const serverSlugs = allExisting.map((a) => a.slug);
    const combinedSlugs = Array.from(new Set([...serverSlugs, ...(clientSlugs || [])]));

    const numbers: number[] = [];
    const escapedBase = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${escapedBase}(-\\d+)?$`);

    for (const s of combinedSlugs) {
      if (s === baseSlug) {
        numbers.push(1);
      } else if (regex.test(s)) {
        const match = s.match(new RegExp(`^${escapedBase}-(\\d+)$`));
        if (match && match[1]) {
          numbers.push(parseInt(match[1], 10));
        }
      }
    }

    if (numbers.length > 0) {
      const maxNum = Math.max(...numbers);
      slug = `${baseSlug}-${maxNum + 1}`;
    }
  }

  const hashVal = getDeterministicHash(`${cleanKw}-${slug}`);
  const category = categoryOverride || inferCategoryFromKeyword(cleanKw);

  const AUTHORS = [
    { name: "Marcus Vance", role: "Senior Technology Editor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { name: "Elena Rostova", role: "Pop Culture Lead", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { name: "Sophia Chen", role: "Lifestyle and Wellness Columnist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  ];
  const author = AUTHORS[hashVal % AUTHORS.length];
  const image = await fetchUniqueUnsplashImage(cleanKw, category);

  // 1. Attempt to fetch directly from Gemini using ONLY GEMINI_ARTICLE_PROMPT
  let generatedData = await fetchArticleFromGeminiApi(cleanKw);

  // 2. If Gemini API is unconfigured/offline, use dynamic topic fallback
  if (!generatedData) {
    generatedData = generateTopicFallbackArticle(cleanKw, hashVal);
  }

  const { title, excerpt, paragraphs, faqs } = generatedData;

  const resultArticle: Article = {
    id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug,
    title,
    metaTitle: `${title} | On Gravity Magazine`,
    metaDescription: excerpt,
    excerpt,
    content: paragraphs,
    faqs,
    category,
    author,
    publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: `${Math.max(5, Math.ceil(paragraphs.join(" ").split(" ").length / 150))} min read`,
    imageUrl: image.url,
    imageAlt: image.alt,
    imageCaption: image.caption,
    featured: true,
    trending: true,
    tags: [cleanKw.split(" ")[0] || "Featured", category.toUpperCase(), "Editorial"],
  };

  dynamicArticlesStore = [resultArticle, ...dynamicArticlesStore.filter((a) => a.slug !== resultArticle.slug)];
  saveCacheToDisk(dynamicArticlesStore);

  return resultArticle;
}

export function getKeywordQueue(): QueueItem[] { return keywordQueueStore; }

export function clearKeywordQueue(): void {
  keywordQueueStore = [];
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

export async function publishNextKeywordAsync(clientSlugs?: string[]): Promise<Article | null> {
  const pendingIndex = keywordQueueStore.findIndex((item) => item.status === "pending");
  if (pendingIndex === -1) return null;

  const item = keywordQueueStore[pendingIndex];
  item.status = "publishing";

  const newArticle = await generateArticleObjectAsync(item.keyword, item.category, undefined, clientSlugs);

  item.status = "published";
  item.publishedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  item.generatedArticleSlug = newArticle.slug;

  return newArticle;
}

export async function publishQueueItemByIdAsync(id: string, clientSlugs?: string[]): Promise<Article | null> {
  const item = keywordQueueStore.find((i) => i.id === id);
  if (!item) return null;

  item.status = "publishing";

  const newArticle = await generateArticleObjectAsync(item.keyword, item.category, undefined, clientSlugs);

  item.status = "published";
  item.publishedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  item.generatedArticleSlug = newArticle.slug;

  return newArticle;
}

export async function publishSpecificKeywordAsync(keyword: string, category?: string, clientSlugs?: string[]): Promise<Article> {
  const newArticle = await generateArticleObjectAsync(keyword, category, undefined, clientSlugs);

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
  const cleanKw = item.keyword.replace(/&/g, "and");
  const category = item.category || inferCategoryFromKeyword(cleanKw);
  const slug = item.generatedArticleSlug || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(`${cleanKw}-${slug}-${item.id}`);

  const AUTHORS = [
    { name: "Marcus Vance", role: "Senior Technology Editor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { name: "Elena Rostova", role: "Pop Culture Lead", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { name: "Sophia Chen", role: "Lifestyle and Wellness Columnist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  ];
  const author = AUTHORS[hashVal % AUTHORS.length];
  const { title, excerpt, paragraphs, faqs } = generateTopicFallbackArticle(cleanKw, hashVal);
  const slugSig = cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: `queue-${item.id}`,
    slug,
    title,
    metaTitle: `${title} | On Gravity Magazine`,
    metaDescription: excerpt,
    excerpt,
    content: paragraphs,
    faqs,
    category,
    author,
    publishedAt: item.publishedAt || item.createdAt,
    readTime: "6 min read",
    imageUrl: `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}_${hashVal}`,
    imageAlt: `Editorial photography for ${title}`,
    imageCaption: `Editorial photograph for ${title}.`,
    featured: true,
    trending: true,
    tags: [cleanKw.split(" ")[0] || "Featured", category.toUpperCase(), "Editorial"],
  };
}

export function sanitizeOrMigrateArticle(art: Article): Article {
  if (!art || !art.slug) return art;

  const cleanKw = art.slug.replace(/-\d+$/, "").replace(/-/g, " ");

  if (!art.title || !art.title.trim()) {
    art.title = cleanKw.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  art.title = art.title.replace(/&/g, "and");
  art.metaTitle = `${art.title} | On Gravity Magazine`;

  if (!art.excerpt || !art.excerpt.trim()) {
    art.excerpt = `An in-depth editorial guide covering ${cleanKw} with practical insights and expert analysis.`;
  }
  art.excerpt = art.excerpt.replace(/&/g, "and");
  art.metaDescription = art.excerpt;

  if (Array.isArray(art.content)) {
    art.content = art.content.map(p => p.replace(/&/g, "and"));
  }

  return art;
}

export function getAllArticlesCombined(): Article[] {
  const diskArticles = loadCacheFromDisk();
  const map = new Map<string, Article>();

  for (const art of [...dynamicArticlesStore, ...diskArticles, ...ARTICLES]) {
    if (art && art.slug) {
      const sanitized = sanitizeOrMigrateArticle(art);
      if (!map.has(sanitized.slug)) map.set(sanitized.slug, sanitized);
    }
  }

  for (const qItem of keywordQueueStore) {
    if (qItem.status === "published" && qItem.generatedArticleSlug) {
      if (!map.has(qItem.generatedArticleSlug)) {
        const built = buildArticleFromQueueItem(qItem);
        const sanitized = sanitizeOrMigrateArticle(built);
        map.set(qItem.generatedArticleSlug, sanitized);
      }
    }
  }

  return Array.from(map.values());
}

export async function getArticleBySlugAsync(slug: string): Promise<Article | undefined> {
  const all = getAllArticlesCombined();
  const found = all.find((a) => a.slug === slug || a.id === slug);
  if (found) return sanitizeOrMigrateArticle(found);

  const rawKeyword = slug.replace(/-\d+$/, "").replace(/-/g, " ");
  if (!rawKeyword.trim()) return undefined;

  try {
    const newlyGen = await generateArticleObjectAsync(rawKeyword, undefined, slug);
    return sanitizeOrMigrateArticle(newlyGen);
  } catch (err) {
    console.error("On-demand article generation failed:", err);
  }

  return undefined;
}

export function clearPublishedStore() {
  dynamicArticlesStore = [];
  if (typeof window === "undefined") {
    try {
      const req = eval("require");
      const fsMod = req("fs");
      if (fsMod) {
        for (const cacheFile of CACHE_FILES) {
          if (fsMod.existsSync(cacheFile)) {
            fsMod.unlinkSync(cacheFile);
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }
}
