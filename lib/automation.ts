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
 * Fetch a unique high-res photograph dynamically from Unsplash API for a keyword
 */
async function fetchUniqueUnsplashImage(keyword: string, category: string): Promise<{ url: string; caption: string; alt: string }> {
  const accessKey = getUnsplashAccessKey();
  const searchTopic = `${keyword} ${category}`;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTopic)}&per_page=15&orientation=landscape&client_id=${accessKey}`
    );

    if (res.ok) {
      const data = await res.json();
      const results = data?.results;
      if (Array.isArray(results) && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        const photo = results[randomIndex];
        const imageUrl = photo?.urls?.regular || photo?.urls?.full;
        const authorName = photo?.user?.name || "Unsplash Photographer";
        const description = photo?.alt_description || photo?.description || keyword;

        if (imageUrl) {
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

  const randomSig = Math.floor(Math.random() * 10000);
  const fallbacks: Record<string, string> = {
    tech: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80&sig=${randomSig}`,
    celebrity: `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80&sig=${randomSig}`,
    health: `https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80&sig=${randomSig}`,
    business: `https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80&sig=${randomSig}`,
    food: `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80&sig=${randomSig}`,
    news: `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80&sig=${randomSig}`,
    "life-style": `https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80&sig=${randomSig}`,
  };

  return {
    url: fallbacks[category] || fallbacks["tech"],
    caption: `Editorial photograph highlighting ${keyword} for On Gravity Magazine.`,
    alt: `High resolution photography representing ${keyword}`,
  };
}

function inferCategoryFromKeyword(keyword: string): string {
  const kw = keyword.toLowerCase();
  if (kw.includes("celebrity") || kw.includes("actor") || kw.includes("fashion") || kw.includes("movie") || kw.includes("hollywood") || kw.includes("gala")) {
    return "celebrity";
  }
  if (kw.includes("lifestyle") || kw.includes("home") || kw.includes("living") || kw.includes("mindful") || kw.includes("travel") || kw.includes("design")) {
    return "life-style";
  }
  if (kw.includes("health") || kw.includes("medical") || kw.includes("sleep") || kw.includes("diet") || kw.includes("longevity") || kw.includes("fitness")) {
    return "health";
  }
  if (kw.includes("business") || kw.includes("market") || kw.includes("stock") || kw.includes("startup") || kw.includes("finance") || kw.includes("economy")) {
    return "business";
  }
  if (kw.includes("food") || kw.includes("dining") || kw.includes("dish") || kw.includes("recipe") || kw.includes("gourmet") || kw.includes("chef")) {
    return "food";
  }
  if (kw.includes("news") || kw.includes("global") || kw.includes("summit") || kw.includes("accord") || kw.includes("policy") || kw.includes("climate")) {
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
 * Call Gemini 3.6 Flash API to generate rich content + SEO meta title & description + Image ALT text
 */
async function fetchGeminiArticle(keyword: string, categoryOverride?: string): Promise<{
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  imageAlt: string;
  paragraphs: string[];
  category: string;
  tags: string[];
} | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const prompt = `You are the Senior SEO Editor & Editor-in-Chief of "On Gravity Magazine". Write an in-depth, high-ranking magazine article based on the target keyword: "${keyword}".
    Return ONLY a valid JSON object with the following fields:
    {
      "title": "A captivating editorial headline containing '${keyword}'",
      "metaTitle": "SEO Title under 60 chars ending with | On Gravity Magazine",
      "metaDescription": "Compelling SEO meta description under 155 chars optimized for Google search clicks",
      "imageAlt": "Descriptive accessibility and image SEO ALT text for photo of ${keyword}",
      "excerpt": "A compelling 2-sentence summary excerpt",
      "paragraphs": [
        "First comprehensive introductory paragraph engaging the reader...",
        "Second paragraph analyzing key trends, data, or technical details...",
        "Third paragraph with expert perspectives or industry quotes...",
        "Fourth forward-looking concluding paragraph highlighting future impact."
      ],
      "category": "one of: celebrity, life-style, tech, health, business, news, food",
      "tags": ["Tag1", "Tag2", "Tag3"]
    }`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
 * Generate a complete blog article dynamically using Gemini AI & Unsplash API
 */
export async function generateArticleObjectAsync(
  keyword: string,
  categoryOverride?: string,
  customSlug?: string
): Promise<Article> {
  const cleanKw = keyword.trim();
  const slug =
    customSlug ||
    cleanKw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
      "-" +
      Date.now().toString().slice(-4);
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
      category,
      author,
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: `${Math.max(4, Math.ceil(geminiData.paragraphs.join(" ").split(" ").length / 200))} min read`,
      imageUrl: image.url,
      imageAlt: geminiData.imageAlt || image.alt,
      imageCaption: image.caption,
      featured: true,
      trending: true,
      tags: geminiData.tags,
    };
  } else {
    // Structured Fallback
    const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
    const title = `${capitalizedKw}: A Comprehensive Analysis & Future Outlook`;
    const excerpt = `Exploring the latest developments, expert perspectives, and societal impacts surrounding ${cleanKw} in 2026.`;

    const content = [
      `In recent years, the discussion around ${cleanKw} has captured widespread attention from industry pioneers, researchers, and global audiences alike. As technology and culture evolve, understanding the nuances of this subject becomes paramount.`,
      `Experts highlight several key factors driving momentum in ${cleanKw}. From technological integration and shift in consumer behavior to strategic investments, the landscape is transforming at a rapid pace.`,
      `A recent survey conducted by leading analysts revealed that over 68% of organizations and individuals consider ${cleanKw} a crucial focal point for their strategic roadmap over the next three years.`,
      `Looking forward, the integration of intelligent workflows and sustainable practices will further elevate the impact of ${cleanKw}. Editors at On Gravity Magazine will continue monitoring these breakthroughs as they unfold.`
    ];

    resultArticle = {
      id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      slug,
      title,
      metaTitle: `${title} | On Gravity Magazine`,
      metaDescription: excerpt,
      excerpt,
      content,
      category,
      author,
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: "5 min read",
      imageUrl: image.url,
      imageAlt: image.alt,
      imageCaption: image.caption,
      featured: true,
      trending: true,
      tags: [cleanKw.split(" ")[0] || "Featured", category.toUpperCase(), "2026"],
    };
  }

  // Store in memory & cache to disk
  dynamicArticlesStore.unshift(resultArticle);
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

export function getAllArticlesCombined(): Article[] {
  const diskArticles = loadCacheFromDisk();
  const map = new Map<string, Article>();
  for (const art of [...dynamicArticlesStore, ...diskArticles, ...ARTICLES]) {
    if (!map.has(art.slug)) {
      map.set(art.slug, art);
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
