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

// Topic to Image Mapper with high-res unsplash photography
function getImageUrlForKeyword(keyword: string, category: string): string {
  const kw = keyword.toLowerCase();
  if (kw.includes("ai") || kw.includes("robot") || kw.includes("tech") || kw.includes("software") || kw.includes("data")) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";
  }
  if (kw.includes("celebrity") || kw.includes("fashion") || kw.includes("carpet") || kw.includes("star") || kw.includes("movie")) {
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";
  }
  if (kw.includes("health") || kw.includes("sleep") || kw.includes("medical") || kw.includes("fitness") || kw.includes("wellness")) {
    return "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80";
  }
  if (kw.includes("business") || kw.includes("finance") || kw.includes("capital") || kw.includes("market") || kw.includes("startup")) {
    return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80";
  }
  if (kw.includes("food") || kw.includes("recipe") || kw.includes("gourmet") || kw.includes("dining") || kw.includes("chef")) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80";
  }
  if (kw.includes("news") || kw.includes("global") || kw.includes("city") || kw.includes("accord") || kw.includes("climate")) {
    return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80";
}

// Category Inferencer from keyword text
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

export function generateArticleObject(keyword: string, categoryOverride?: string): Article {
  const cleanKw = keyword.trim();
  const slug = cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4);
  const category = categoryOverride || inferCategoryFromKeyword(cleanKw);
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const title = `${capitalizedKw}: A Comprehensive Analysis & Future Outlook`;
  const excerpt = `Exploring the latest developments, expert perspectives, and societal impacts surrounding ${cleanKw} in 2026.`;

  const content = [
    `In recent years, the discussion around ${cleanKw} has captured widespread attention from industry pioneers, researchers, and global audiences alike. As technology and culture evolve, understanding the nuances of this subject becomes paramount.`,
    `Experts highlight several key factors driving momentum in ${cleanKw}. From technological integration and shift in consumer behavior to strategic investments, the landscape is transforming at a rapid pace.`,
    `A recent survey conducted by leading analysts revealed that over 68% of organizations and individuals consider ${cleanKw} a crucial focal point for their strategic roadmap over the next three years.`,
    `Looking forward, the integration of intelligent workflows and sustainable practices will further elevate the impact of ${cleanKw}. Editors at On Gravity Magazine will continue monitoring these breakthroughs as they unfold.`
  ];

  const tags = [
    cleanKw.split(" ")[0] || "Featured",
    category.toUpperCase(),
    "2026",
    "Analysis"
  ];

  return {
    id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slug,
    title,
    excerpt,
    content,
    category,
    author,
    publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: "5 min read",
    imageUrl: getImageUrlForKeyword(cleanKw, category),
    imageCaption: `Editorial visualization highlighting key developments in ${cleanKw}.`,
    featured: true,
    trending: true,
    tags,
  };
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

export function publishNextKeyword(): Article | null {
  const pendingIndex = keywordQueueStore.findIndex((item) => item.status === "pending");
  if (pendingIndex === -1) return null;

  const item = keywordQueueStore[pendingIndex];
  item.status = "publishing";

  const newArticle = generateArticleObject(item.keyword, item.category);
  dynamicArticlesStore.unshift(newArticle);

  item.status = "published";
  item.publishedAt = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  item.generatedArticleSlug = newArticle.slug;

  return newArticle;
}

export function publishSpecificKeyword(keyword: string, category?: string): Article {
  const newArticle = generateArticleObject(keyword, category);
  dynamicArticlesStore.unshift(newArticle);

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
  return [...dynamicArticlesStore, ...ARTICLES];
}

export function clearPublishedStore() {
  dynamicArticlesStore = [];
}
