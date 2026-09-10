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

8. ORIGINALITY & NO META-TEXT:
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
    `${kwWords} Review (2026): 5 Must-Know Secrets Before You Buy`,
    `${kwWords} Buyer Guide (2026): Tested Specs, Pricing and Verdict`,
    `Is ${kwWords} Worth It? Full Performance and Reliability Review`,
    `The Ultimate ${kwWords} Guide (2026): Best Features and Real Truth`,
    `${kwWords} Breakdown: Top Models, Key Specs and Expert Advice`
  ];

  return highCtrTemplates[Math.abs(hashVal) % highCtrTemplates.length].replace(/&/g, "and");
}

async function fetchUniqueUnsplashImage(keyword: string, category: string): Promise<{ url: string; caption: string; alt: string }> {
  const accessKey = getUnsplashAccessKey();
  const cleanKw = keyword.trim().toLowerCase().replace(/&/g, "and");
  const slugSig = cleanKw.replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(cleanKw);

  if (accessKey) {
    try {
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=10&orientation=landscape&client_id=${accessKey}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const photo = data.results[hashVal % data.results.length];
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
      // Fallback
    }
  }

  const categoryPhotoPools: Record<string, string[]> = {
    "life-style": ["photo-1584622650111-993a426fbf0a", "photo-1507652313519-d4e9174996dd"],
    tech: ["photo-1615663245857-ac93bb7c39e7", "photo-1593359677879-a4bb92f829d1"],
    health: ["photo-1506126613408-eca07ce68773", "photo-1540420773420-3366772f4999"],
    celebrity: ["photo-1492684223066-81342ee5ff30", "photo-1515886657613-9f3515b0c78f"],
    business: ["photo-1621416894569-0f39ed31d247", "photo-1486406146926-c627a92ad1ab"],
    food: ["photo-1555396273-367ea4eb4db5", "photo-1504674900247-0877df9cc836"],
    news: ["photo-1470071459604-3b5ec3a7fe05", "photo-1585829365295-ab7cd400c167"],
  };
  const pool = categoryPhotoPools[category] || categoryPhotoPools["life-style"];
  const selectedPhotoId = pool[hashVal % pool.length];
  return { url: `https://images.unsplash.com/${selectedPhotoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph highlighting ${keyword}.`, alt: `Photograph of ${keyword}` };
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
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash"
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

      if (!response.ok) continue;

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText && typeof candidateText === "string" && candidateText.trim().length > 100) {
        const parsed = parseGeminiMarkdownArticle(candidateText, keyword);
        if (parsed && parsed.paragraphs.length >= 3) {
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

    // Extract title from # Heading or Title: line
    if (!title && (line.startsWith("# ") || line.toLowerCase().startsWith("title:"))) {
      title = line.replace(/^#\s+|^Title:\s*/i, "").replace(/&/g, "and");
      continue;
    }

    // Extract explicit EXCERPT: or SUMMARY: or META: line
    if (!explicitExcerpt && (line.toLowerCase().startsWith("excerpt:") || line.toLowerCase().startsWith("summary:") || line.toLowerCase().startsWith("meta:"))) {
      explicitExcerpt = line.replace(/^excerpt:|^summary:|^meta:\s*/i, "").replace(/&/g, "and");
      continue;
    }

    // Detect FAQ section - DO NOT push FAQ headings/lines into main paragraphs
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
    // Remove any accidental year numbers (e.g. 2026, (2026)) per user instructions
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
  const count = extractCountFromKeyword(keyword) || 5;

  const title = formatSeoTitle(keyword, hashVal);
  const excerpt = formatMetaDescription(`A comprehensive editorial breakdown of ${topicRaw}, evaluating top performance metrics, user reviews, and key buying considerations.`);

  const paragraphs: string[] = [
    `Exploring ${topicRaw} requires a clear understanding of core features, design quality, and practical daily utility. Having structured guidance ensures you make an informed choice with total confidence.`
  ];

  for (let i = 1; i <= count; i++) {
    paragraphs.push(`## ${i}. Top Selected Choice #${i} for ${topicTitle}`);
    paragraphs.push(`This featured option excels in build craftsmanship, user satisfaction, and daily reliability. Evaluating its key specifications alongside real-world feedback reveals why it remains a top choice in its category.`);
  }

  paragraphs.push(`## Conclusion`);
  paragraphs.push(`In summary, selecting the ideal setup for ${topicRaw} comes down to balancing verified build quality, user requirements, and long-term value.`);

  const faqs = [
    { question: `What is the most important factor when choosing ${topicRaw}?`, answer: `Focus on core build quality and how well it fits your daily requirements.` },
    { question: `How do I ensure long-term reliability for ${topicRaw}?`, answer: `Follow standard guidelines and conduct periodic maintenance checks.` },
    { question: `Is upgrading to a higher tier of ${topicRaw} worth it?`, answer: `Higher tier models offer better durability, materials, and long-term performance.` }
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
    tags: [cleanKw.split(" ")[0] || "Featured", category.toUpperCase(), "2026"],
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
    imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`,
    imageAlt: `Editorial photography for ${title}`,
    imageCaption: `Editorial photograph for ${title}.`,
    featured: true,
    trending: true,
    tags: [cleanKw.split(" ")[0] || "Featured", category.toUpperCase(), "2026"],
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
