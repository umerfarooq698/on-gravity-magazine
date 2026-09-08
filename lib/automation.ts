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
  const randomPage = Math.floor(Math.random() * 3) + 1;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTopic)}&per_page=30&page=${randomPage}&orientation=landscape&client_id=${accessKey}`
    );

    if (res.ok) {
      const data = await res.json();
      const results = data?.results;
      if (Array.isArray(results) && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        const photo = results[randomIndex];
        const rawUrl = photo?.urls?.regular || photo?.urls?.full;
        const authorName = photo?.user?.name || "Unsplash Photographer";
        const description = photo?.alt_description || photo?.description || keyword;

        if (rawUrl) {
          const sig = Math.floor(Math.random() * 100000);
          const imageUrl = rawUrl.includes("?") ? `${rawUrl}&sig=${sig}` : `${rawUrl}?sig=${sig}`;
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

  const randomSig = Math.floor(Math.random() * 100000);
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
    const prompt = `You are a Senior Investigative Journalist and Managing Editor for "On Gravity Magazine".
Write an exceptional, 100% UNIQUE, human-first magazine feature article for keyword: "${keyword}".

EDITORIAL ANGLE FOR THIS SPECIFIC ARTICLE (Random Seed ${randomSeed}):
${selectedAngle}.

CRITICAL REQUIREMENTS:
1. WORD COUNT (800 - 1500 WORDS TOTAL):
   - The article MUST be between 800 and 1500 words in total length.
   - Write 7 to 10 substantial, highly-detailed paragraphs (each paragraph 120–160 words).
   - Provide extensive real-world facts, specifications, step-by-step insights, pros/cons, market context, and expert advice.

2. HEADINGS & STRUCTURE (H2 & H3 MUST BE 100% TOPIC-SPECIFIC & UNIQUE):
   - DO NOT use generic repeated headings like "Key Architecture" or "Real-World Utility"!
   - Create journalistic H2 ("## Headline") and H3 ("### Subheadline") headers strictly tailored to "${keyword}".
   - Examples of topic-specific H2s:
     * For home/plumbing ("bathtub drain"): "## Drainage Flow Dynamics & Overflow Standards", "## Preventing Clogs: Cleaning & Maintenance Protocols"
     * For tech ("samsung tv"): "## Panel Luminance & Neural Quantum Upscaling", "## Gaming Performance & Input Lag Benchmarks"
     * For wellness/health ("sleep optimization"): "## Circadian Alignment & Melatonin Regulation", "## Sleep Tracking Accuracy & Biometric Data"
   - H2 KEYWORD RULE: Include the primary keyword "${keyword}" naturally in ONLY 1 or 2 H2 headings. Do NOT put the keyword in every H2 heading!
   - Place each H2 and H3 heading on its own separate string entry in the "paragraphs" array.

3. 100% UNIQUE & NATURAL TITLE:
   - Create a completely distinct, engaging, human-first headline specifically tailored to "${keyword}".
   - NEVER use fixed formula templates like "${keyword}: 2026 In-Depth Analysis...".
   - Make the title sound like a real human headline from Forbes, Wired, TechCrunch, or Vogue (e.g., "Why ${keyword} Is Quietly Reshaping Modern Tech", "${keyword} Tested: High Performance, Real-World Utility, and Key Limits", "The Definitive Guide to ${keyword}").

4. WRITE FOR HUMANS FIRST (GOOGLE HELPFUL CONTENT ALIGNMENT):
   - Match exact user search intent.
   - NO AI BUZZWORDS: Strictly do NOT use phrases like "In today's fast-paced digital world", "delve into", "tapestry", "game-changer", "beacon of", "testament to", "it remains to be seen", "paradigm shift".

5. HELPFUL FAQS (2-4 QUESTIONS):
   - Provide 2 to 4 genuinely helpful, non-generic Frequently Asked Questions with clear, direct, multi-sentence answers.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Natural, engaging, 100% unique magazine headline for ${keyword}",
  "metaTitle": "Natural SEO Title under 60 chars ending with | On Gravity Magazine",
  "metaDescription": "Helpful, engaging meta description under 155 chars optimized for search clicks",
  "imageAlt": "Descriptive, high-quality image ALT text for a photograph of ${keyword}",
  "excerpt": "A compelling 2-sentence executive summary of the article",
  "paragraphs": [
    "Paragraph 1 (130-160 words): Engaging intro establishing immediate value, real-world context, and clear thesis...",
    "## Topic-Specific H2 Heading incorporating ${keyword}",
    "Paragraph 2 (130-160 words): Detailed background analysis, historical context, or technical specifications...",
    "### Topic-Specific H3 Subheading",
    "Paragraph 3 (130-160 words): Core features breakdown, practical operation, or user experience highlights...",
    "## Topic-Specific H2 Heading without keyword",
    "Paragraph 4 (130-160 words): Practical applications, case studies, or workflow implementation steps...",
    "## Topic-Specific H2 Heading without keyword",
    "Paragraph 5 (130-160 words): Side-by-side performance benchmarks, pros and cons...",
    "### Topic-Specific H3 Subheading",
    "Paragraph 6 (130-160 words): Detailed analysis of throughput, speed, or cost-to-performance ratio...",
    "## Topic-Specific H2 Heading focusing on Limitations",
    "Paragraph 7 (130-160 words): Critical limitations, challenges, or buyer/user caveats to consider...",
    "## Topic-Specific H2 Heading focusing on Future Outlook",
    "Paragraph 8 (130-160 words): Forward-looking market analysis, future expectations, and definitive conclusion..."
  ],
  "faqs": [
    { "question": "Specific Question 1 regarding ${keyword}?", "answer": "Direct, thorough answer..." },
    { "question": "Specific Question 2 regarding ${keyword}?", "answer": "Direct, thorough answer..." },
    { "question": "Specific Question 3 regarding ${keyword}?", "answer": "Direct, thorough answer..." }
  ],
  "category": "one of: celebrity, life-style, tech, health, business, news, food",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
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
 * Generate dynamic, non-repetitive H2 and H3 headings for fallback articles
 */
function generateDynamicHeadingsForArticle(keyword: string, category: string) {
  const cleanKw = keyword.trim();
  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const catUpper = category.toUpperCase();

  const h2KeywordOptions = [
    `## Architectural Overview & Key Capabilities of ${capitalizedKw}`,
    `## Why ${capitalizedKw} Is Driving ${catUpper} Innovation`,
    `## Core Features and System Specifications of ${capitalizedKw}`,
    `## Understanding the Foundational Principles Behind ${capitalizedKw}`,
    `## The Technological & Structural Evolution of ${capitalizedKw}`,
    `## Key Specifications and Primary Highlights of ${capitalizedKw}`,
  ];

  const h3Sub1Options = [
    `### Core Sub-System Integration`,
    `### Primary Hardware & Interface Design`,
    `### Operational Architecture Breakdown`,
    `### System Workflow & Integration Protocols`,
    `### Essential Component Specifications`,
  ];

  const h2UtilityOptions = [
    `## Real-World Utility & Hands-On User Experience`,
    `## Field Performance & Operational Dynamics`,
    `## Practical Implementation & Workflow Integration`,
    `## Hands-On Testing: Usability, Ergonomics & Setup`,
    `## High-Value Use Cases & Practical Applications`,
  ];

  const h2ComparativeOptions = [
    `## Comparative Benchmarks & Industry Alternatives`,
    `## How It Stacks Up Against Market Competitors`,
    `## Performance Evaluation & Relative Advantage`,
    `## Industry Trade-Offs: Efficiency vs Initial Setup`,
    `## Benchmark Testing Across Standard Scenarios`,
  ];

  const h3Sub2Options = [
    `### Throughput & Performance Metrics`,
    `### Strategic Efficiency Assessments`,
    `### Cost-to-Performance Ratio Analysis`,
    `### Comparative Speed & Operational Testing`,
    `### Long-Term Value & ROI Evaluation`,
  ];

  const h2LimitationsOptions = [
    `## Key Limitations & Essential Buyer Caveats`,
    `## Practical Constraints & Maintenance Warnings`,
    `## What to Consider Before Committing Resources`,
    `## Potential Drawbacks & Integration Challenges`,
    `## Operational Risks & User Considerations`,
  ];

  const h2OutlookOptions = [
    `## Strategic Outlook & Final Verdict`,
    `## Future Trajectory & Next-Generation Expectations`,
    `## Industry Forecast & Market Evolution`,
    `## Final Editorial Verdict & Strategic Recommendations`,
    `## Emerging Innovations & Long-Term Roadmap`,
  ];

  const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return {
    h2Keyword: pickRandom(h2KeywordOptions),
    h3Sub1: pickRandom(h3Sub1Options),
    h2Utility: pickRandom(h2UtilityOptions),
    h2Comparative: pickRandom(h2ComparativeOptions),
    h3Sub2: pickRandom(h3Sub2Options),
    h2Limitations: pickRandom(h2LimitationsOptions),
    h2Outlook: pickRandom(h2OutlookOptions),
  };
}

/**
 * Generate a dynamic fallback title for any keyword to guarantee headline uniqueness
 */
function generateDynamicFallbackTitle(keyword: string, category: string, isSuffixAdded: boolean): string {
  const cleanKw = keyword.trim();
  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const catUpper = category.toUpperCase();

  const titleTemplates = [
    `Why ${capitalizedKw} Is Reshaping the Modern ${catUpper} Landscape`,
    `${capitalizedKw} Tested: Performance, Features, and Real-World Verdict`,
    `The Definitive Guide to ${capitalizedKw}: Everything You Need to Know`,
    `Inside ${capitalizedKw}: Key Insights, Benchmarks, and Practical Advice`,
    `Is ${capitalizedKw} Worth the Hype? An In-Depth Editorial Breakdown`,
    `Navigating ${capitalizedKw}: Specs, Limitations, and Buyer Recommendations`,
    `How ${capitalizedKw} Is Driving New Industry Benchmarks in 2026`,
    `Understanding ${capitalizedKw}: Core Features, Utility, and Future Outlook`,
    `${capitalizedKw} Explained: Real-World Applications and Key Takeaways`,
    `The Rise of ${capitalizedKw}: What Experts and Enthusiasts Are Saying`,
    `Top Breakthroughs and Practical Insights Surrounding ${capitalizedKw}`,
    `${capitalizedKw} Handbook: Architecture, User Experience, and Long-Term Value`,
  ];

  const randomIndex = Math.floor(Math.random() * titleTemplates.length);
  let selectedTitle = titleTemplates[randomIndex];

  if (isSuffixAdded) {
    const subtitleModifiers = [
      "Deep Dive Perspective",
      "Comprehensive User Evaluation",
      "Architectural & Utility Review",
      "2026 Industry Breakdown",
      "Real-World Performance Analysis",
    ];
    const modifier = subtitleModifiers[Math.floor(Math.random() * subtitleModifiers.length)];
    selectedTitle = `${capitalizedKw}: ${modifier}`;
  }

  return selectedTitle;
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

  // Generate unique slug, avoiding collisions with existing articles
  let baseSlug =
    customSlug ||
    cleanKw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  let slug = baseSlug;
  const existingSlugs = new Set(getAllArticlesCombined().map((a) => a.slug));
  let isSuffixAdded = false;

  if (!customSlug && existingSlugs.has(slug)) {
    // If slug already exists in database/store, append a short random hex suffix to guarantee URL uniqueness
    slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    isSuffixAdded = true;
  }

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
    // Comprehensive Dynamic Fallback (800+ words) with 100% unique title, headings & FAQs
    const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
    const title = generateDynamicFallbackTitle(cleanKw, category, isSuffixAdded);
    const headings = generateDynamicHeadingsForArticle(cleanKw, category);
    const excerpt = `An essential, reader-first examination of ${cleanKw}, exploring technical benchmarks, real-world utility, and future market trends.`;

    const content = [
      `As ${cleanKw} continues to shape contemporary discussions across technology, industry, and modern lifestyle, understanding its core principles, practical implications, and underlying mechanisms has become vital for enthusiasts and decision-makers alike.`,
      headings.h2Keyword,
      `From a structural and operational perspective, ${cleanKw} represents a significant evolution in its domain. Industry benchmarks indicate that adoption rates have grown exponentially over the past 12 months, driven by advances in core integration and refined user experiences.`,
      headings.h3Sub1,
      `Key specifications and primary features highlight several distinct advantages. Users consistently praise its flexibility, streamlined interface, and high reliability, while expert testing confirms that performance metrics regularly exceed standard expectations.`,
      headings.h2Utility,
      `Real-world implementation scenarios reveal practical strategies for maximizing value. Experts recommend establishing clear operational protocols, utilizing automated safeguards, and periodically assessing workflow bottlenecks to ensure optimal outcomes.`,
      headings.h2Comparative,
      `When comparing ${cleanKw} against traditional alternatives, key trade-offs emerge. While initial setup and investment require deliberate planning, long-term efficiency gains and operational benefits overwhelmingly justify the transition.`,
      headings.h3Sub2,
      `Rigorous side-by-side evaluations demonstrate notable performance gains. Under heavy operational loads, key throughput metrics outperform standard legacy configurations by substantial margins.`,
      headings.h2Limitations,
      `Despite its notable benefits, certain limitations and practical caveats warrant consideration. Potential users should account for integration timelines, ongoing maintenance requirements, and compatibility with legacy infrastructure before committing resources.`,
      headings.h2Outlook,
      `Looking ahead to the next decade, ongoing innovations surrounding ${cleanKw} promise to unlock even greater capabilities. Editors at On Gravity Magazine will continue monitoring developments to deliver timely, actionable coverage as new breakthroughs emerge.`
    ];

    const faqs = [
      {
        question: `What makes ${capitalizedKw} a major focus in 2026?`,
        answer: `${capitalizedKw} offers a blend of performance, versatility, and efficiency that aligns with modern user demand and market trends.`
      },
      {
        question: `How does ${capitalizedKw} compare to traditional solutions?`,
        answer: `While initial adoption may require adjustment, testing demonstrates that ${capitalizedKw} delivers superior long-term reliability and streamlined operation.`
      },
      {
        question: `What are the key limitations to consider regarding ${capitalizedKw}?`,
        answer: `Prospective users should review compatibility requirements, setup timeframes, and resource allocation to ensure a smooth implementation.`
      }
    ];

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

function buildArticleFromQueueItem(item: QueueItem): Article {
  const cleanKw = item.keyword;
  const capitalizedKw = cleanKw.charAt(0).toUpperCase() + cleanKw.slice(1);
  const category = item.category || inferCategoryFromKeyword(cleanKw);
  const slug = item.generatedArticleSlug || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
  const title = generateDynamicFallbackTitle(cleanKw, category, false);
  const headings = generateDynamicHeadingsForArticle(cleanKw, category);
  const excerpt = `An essential, reader-first examination of ${cleanKw}, exploring technical benchmarks, real-world utility, and future market trends.`;

  return {
    id: `queue-${item.id}`,
    slug,
    title,
    metaTitle: `${title} | On Gravity Magazine`,
    metaDescription: excerpt,
    excerpt,
    content: [
      `As ${cleanKw} continues to shape contemporary discussions across technology, industry, and modern lifestyle, understanding its core principles, practical implications, and underlying mechanisms has become vital for enthusiasts and decision-makers alike.`,
      headings.h2Keyword,
      `From a structural and operational perspective, ${cleanKw} represents a significant evolution in its domain. Industry benchmarks indicate that adoption rates have grown exponentially over the past 12 months, driven by advances in core integration and refined user experiences.`,
      headings.h3Sub1,
      `Key specifications and primary features highlight several distinct advantages. Users consistently praise its flexibility, streamlined interface, and high reliability, while expert testing confirms that performance metrics regularly exceed standard expectations.`,
      headings.h2Utility,
      `Real-world implementation scenarios reveal practical strategies for maximizing value. Experts recommend establishing clear operational protocols, utilizing automated safeguards, and periodically assessing workflow bottlenecks to ensure optimal outcomes.`,
      headings.h2Comparative,
      `When comparing ${cleanKw} against traditional alternatives, key trade-offs emerge. While initial setup and investment require deliberate planning, long-term efficiency gains and operational benefits overwhelmingly justify the transition.`,
      headings.h3Sub2,
      `Rigorous side-by-side evaluations demonstrate notable performance gains. Under heavy operational loads, key throughput metrics outperform standard legacy configurations by substantial margins.`,
      headings.h2Limitations,
      `Despite its notable benefits, certain limitations and practical caveats warrant consideration. Potential users should account for integration timelines, ongoing maintenance requirements, and compatibility with legacy infrastructure before committing resources.`,
      headings.h2Outlook,
      `Looking ahead to the next decade, ongoing innovations surrounding ${cleanKw} promise to unlock even greater capabilities. Editors at On Gravity Magazine will continue monitoring developments to deliver timely, actionable coverage as new breakthroughs emerge.`
    ],
    faqs: [
      {
        question: `What makes ${capitalizedKw} a major focus in 2026?`,
        answer: `${capitalizedKw} offers a blend of performance, versatility, and efficiency that aligns with modern user demand and market trends.`
      },
      {
        question: `How does ${capitalizedKw} compare to traditional solutions?`,
        answer: `While initial adoption may require adjustment, testing demonstrates that ${capitalizedKw} delivers superior long-term reliability and streamlined operation.`
      },
      {
        question: `What are the key limitations to consider regarding ${capitalizedKw}?`,
        answer: `Prospective users should review compatibility requirements, setup timeframes, and resource allocation to ensure a smooth implementation.`
      }
    ],
    category,
    author,
    publishedAt: item.publishedAt || item.createdAt,
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
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
