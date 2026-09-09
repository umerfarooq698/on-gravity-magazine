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

const CACHE_VERSION_FILE = "on_gravity_articles_cache_v8.json";

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

let dynamicArticlesStore: Article[] = [];
let keywordQueueStore: QueueItem[] = [
  { id: "q-1", keyword: "AI Autonomous Agents in Healthcare", category: "tech", status: "pending", createdAt: "Sept 8, 2026" },
  { id: "q-2", keyword: "2026 Red Carpet Fashion Highlights", category: "celebrity", status: "pending", createdAt: "Sept 8, 2026" },
  { id: "q-3", keyword: "Holistic Sleep Optimization and Circadian Rhythms", category: "health", status: "pending", createdAt: "Sept 8, 2026" },
  { id: "q-4", keyword: "Venture Capital Shifts in Clean Energy Startups", category: "business", status: "pending", createdAt: "Sept 8, 2026" },
  { id: "q-5", keyword: "Minimalist Architecture and Slow Living Spaces", category: "life-style", status: "pending", createdAt: "Sept 8, 2026" },
  { id: "q-6", keyword: "Zero-Waste Farm to Table Michelin Dining", category: "food", status: "pending", createdAt: "Sept 8, 2026" },
  { id: "q-7", keyword: "Global Renewable Energy Municipal Accords", category: "news", status: "pending", createdAt: "Sept 8, 2026" },
];

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
  const raw = keyword.trim();
  const lower = raw.toLowerCase();
  const words = lower.split(/\s+/);

  if (lower === "bathroom taps idea" || lower === "bathroom tap idea" || lower === "bathroom tap ideas") {
    return { raw, title: "Bathroom Tap Ideas", singular: "bathroom tap idea", plural: "bathroom tap ideas", withArticle: "bathroom tap ideas", topic: "bathroom tap design ideas" };
  }
  if (lower === "bathroom cold tap" || lower === "bathroom cold taps") {
    return { raw, title: "Bathroom Cold Tap", singular: "bathroom cold tap", plural: "bathroom cold taps", withArticle: "a bathroom cold tap", topic: "bathroom cold water taps" };
  }
  if (lower === "bathroom hot tap" || lower === "bathroom hot taps") {
    return { raw, title: "Bathroom Hot Tap", singular: "bathroom hot tap", plural: "bathroom hot taps", withArticle: "a bathroom hot tap", topic: "bathroom hot water taps" };
  }
  if (lower === "matte black tap" || lower === "matte black taps") {
    return { raw, title: "Matte Black Tap", singular: "matte black tap", plural: "matte black taps", withArticle: "a matte black tap", topic: "matte black bathroom taps" };
  }
  if (lower === "best gaming mouse" || lower === "gaming mouse" || lower === "gaming mice") {
    return { raw, title: "Best Gaming Mouse", singular: "gaming mouse", plural: "gaming mice", withArticle: "a gaming mouse", topic: "high-performance gaming mice" };
  }
  if (lower === "smart home hub" || lower === "smart home hubs") {
    return { raw, title: "Smart Home Hub", singular: "smart home hub", plural: "smart home hubs", withArticle: "a smart home hub", topic: "smart home automation hubs" };
  }

  const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const lastWord = words[words.length - 1];
  const isPlural = lastWord.endsWith("s") || lastWord === "ideas" || lastWord === "tips" || lastWord === "insights";
  const singular = isPlural ? raw.replace(/s$/i, "") : raw;
  const plural = isPlural ? raw : raw.endsWith("ch") || raw.endsWith("sh") || raw.endsWith("x") || raw.endsWith("s") ? raw + "es" : raw + "s";
  const startsWithVowel = /^[aeiou]/i.test(raw);
  const withArticle = isPlural ? raw : startsWithVowel ? `an ${raw}` : `a ${raw}`;

  return { raw, title, singular, plural, withArticle, topic: raw };
}

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
    isCar: kw.includes("car") || kw.includes("auto") || kw.includes("vehicle") || kw.includes("drive") || kw.includes("electric"),
    isFitness: kw.includes("fit") || kw.includes("gym") || kw.includes("workout") || kw.includes("exercise") || kw.includes("muscle"),
    isSkincare: kw.includes("skin") || kw.includes("beauty") || kw.includes("serum") || kw.includes("face") || kw.includes("cream"),
  };
}

async function fetchUniqueUnsplashImage(keyword: string, category: string): Promise<{ url: string; caption: string; alt: string }> {
  const accessKey = getUnsplashAccessKey();
  const cleanKw = keyword.trim().toLowerCase();
  const slugSig = cleanKw.replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(cleanKw);
  const tokens = extractKeywordSubTokens(keyword);

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
              caption: photo.description || photo.alt_description || `Editorial photograph for ${keyword} on On Gravity Magazine.`,
              alt: photo.alt_description || `High resolution photograph of ${keyword}`,
            };
          }
        }
      }
    } catch (e) {
      // Fallback
    }
  }

  if (tokens.isGaming) return { url: `https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of gaming hardware for ${keyword}.`, alt: `Black computer gaming mouse` };
  if (tokens.isBlack && tokens.isTap) return { url: `https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of matte black bathroom tap.`, alt: `Matte black bathroom tap` };
  if (tokens.isCold && tokens.isTap) return { url: `https://images.unsplash.com/photo-1623111771733-d3ab4d26ce41?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of cold water supply tap.`, alt: `Silver bathroom cold tap` };
  if (tokens.isTap || tokens.isIdea) return { url: `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph highlighting ${keyword}.`, alt: `Bathroom faucet and basin` };
  if (tokens.isTub) return { url: `https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of luxury bathtub.`, alt: `Freestanding soaking bathtub` };
  if (tokens.isSmartHome) return { url: `https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of smart home hub.`, alt: `Smart home hub interface` };
  if (tokens.isTv) return { url: `https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph for ${keyword}.`, alt: `4K television display` };

  const categoryPhotoPools: Record<string, string[]> = {
    "life-style": ["photo-1584622650111-993a426fbf0a", "photo-1507652313519-d4e9174996dd"],
    tech: ["photo-1615663245857-ac93bb7c39e7", "photo-1593359677879-a4bb92f829d1"],
    health: ["photo-1506126613408-eca07ce68773", "photo-1540420773420-3366772f4999"],
    celebrity: ["photo-1492684223066-81342ee5ff30", "photo-1515886657613-9f3515b0c78f"],
    business: ["photo-1621416894569-0f39ed31d247", "photo-1486406146926-c627a92ad1ab"],
    food: ["photo-1555396273-367ea4eb4db5", "photo-1504674900247-0877df9cc836"],
    news: ["photo-1470071459604-3b5ec3a7fe05", "photo-1585829365295-ab7cd400c167"],
  };
  const pool = categoryPhotoPools[category] || categoryPhotoPools["tech"];
  const selectedPhotoId = pool[hashVal % pool.length];
  return { url: `https://images.unsplash.com/${selectedPhotoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph highlighting ${keyword}.`, alt: `Photograph of ${keyword}` };
}

function inferCategoryFromKeyword(keyword: string): string {
  const kw = keyword.toLowerCase();
  if (kw.includes("celebrity") || kw.includes("actor") || kw.includes("fashion") || kw.includes("gala")) return "celebrity";
  if (kw.includes("lifestyle") || kw.includes("life-style") || kw.includes("home") || kw.includes("bathtub") || kw.includes("faucet") || kw.includes("tap")) return "life-style";
  if (kw.includes("health") || kw.includes("sleep") || kw.includes("fitness") || kw.includes("wellness")) return "health";
  if (kw.includes("business") || kw.includes("crypto") || kw.includes("stock") || kw.includes("market") || kw.includes("musk")) return "business";
  if (kw.includes("food") || kw.includes("dining") || kw.includes("chef") || kw.includes("coffee")) return "food";
  if (kw.includes("news") || kw.includes("climate") || kw.includes("policy") || kw.includes("global")) return "news";
  return "tech";
}

// ----------------------------------------------------
// DYNAMIC HEADING & MULTI-LAYOUT SYNTHESIZER ENGINE
// ----------------------------------------------------

const ANGLES = [
  "Deconstructing", "Architectural Review of", "Optimizing", "Mastering",
  "The Science Behind", "Unpacking", "Real-World Testing of", "Engineering Standards for",
  "Solving Common Issues with", "Design Trends & Spatial Harmony for", "Comparative Analysis of",
  "Performance Benchmarks for", "Installation Guidelines for", "Preventative Care Rules for"
];

const DOMAIN_SUB_ANGLES: Record<string, string[]> = {
  gaming: [
    "Optical Sensor DPI Resolution and 1:1 Motion Tracking",
    "2.4GHz Ultra-Low Latency Wireless Response",
    "Ergonomic Weight Distribution for Palm vs Claw Grips",
    "Infrared Optical Switch Actuation and Debounce Elimination",
    "Virgin-Grade PTFE Skate Glide Dynamics",
    "On-Board Memory Profile Mapping and Polling Rates"
  ],
  plumbing: [
    "Water Line Pressure Balancing and Aerator GPM Rates",
    "Electroplated PVD Finish Resilience Against Hard Water",
    "Ceramic Disc Cartridge Friction and Leak-Free Sealing",
    "Thermostatic Scald Protection and Temperature Regulation",
    "Spout Reach Calculations and Basin Clearance Standards",
    "Under-Sink Isolation Valve Connections and Hose Assemblies"
  ],
  smarthome: [
    "Matter and Thread Protocol Wireless Antennas",
    "Zero-Cloud Latency and Local Rule Execution",
    "Dedicated IoT Network Encryption and Signal Range",
    "Voice Assistant Triggers and Multi-Sensor Automation",
    "Display Refresh Rates and Peak Luminance Calibration"
  ],
  crypto: [
    "Venture Capital Flows and Market Liquidity",
    "Blockchain Protocol Security and Smart Contracts",
    "Clean Energy Infrastructure Investment Models",
    "Macroeconomic Metrics and Strategic Asset Allocation"
  ],
  food: [
    "Farm-to-Table Ingredient Sourcing and Zero-Waste Prep",
    "Michelin Culinary Techniques and Plating Artistry",
    "Artisanal Coffee Extraction Pressure and Bean Profiles"
  ],
  fashion: [
    "Red Carpet Runway Couture and Visual Statement Design",
    "Haute Couture Craftsmanship and Met Gala Silhouettes",
    "Celebrity Style Trends and Designer Collaborations"
  ],
  general: [
    "Technical Architecture and Structural Material Quality",
    "Real-World Operational Efficiency and Usability",
    "Comparative Performance Metrics and Service Longevity",
    "Implementation Guidelines and System Calibration"
  ]
};

function getDomainKey(kw: string): string {
  const lower = kw.toLowerCase();
  if (lower.includes("mouse") || lower.includes("gaming") || lower.includes("keyboard")) return "gaming";
  if (lower.includes("tap") || lower.includes("faucet") || lower.includes("tub") || lower.includes("drain")) return "plumbing";
  if (lower.includes("smart") || lower.includes("hub") || lower.includes("tv") || lower.includes("display")) return "smarthome";
  if (lower.includes("crypto") || lower.includes("market") || lower.includes("invest") || lower.includes("musk")) return "crypto";
  if (lower.includes("food") || lower.includes("coffee") || lower.includes("dining")) return "food";
  if (lower.includes("gala") || lower.includes("fashion") || lower.includes("carpet") || lower.includes("celebrity")) return "fashion";
  return "general";
}

function generateDynamicHeadingsAndPattern(keyword: string, hashVal: number) {
  const cleanKw = keyword.trim();
  const kwWords = cleanKw.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const domainKey = getDomainKey(cleanKw);
  const subAngles = DOMAIN_SUB_ANGLES[domainKey] || DOMAIN_SUB_ANGLES.general;
  
  const patternIndex = (hashVal % 6) + 1; // 1 to 6
  const h2Count = 4 + (hashVal % 3); // 4 to 6 H2s
  
  const usedSubAngles = new Set<string>();
  const h2List: string[] = [];

  for (let i = 0; i < h2Count; i++) {
    const angle = ANGLES[(hashVal + i * 3) % ANGLES.length];
    let subAngle = subAngles[(hashVal + i * 2) % subAngles.length];
    if (usedSubAngles.has(subAngle)) {
      subAngle = subAngles[(hashVal + i * 2 + 1) % subAngles.length];
    }
    usedSubAngles.add(subAngle);
    h2List.push(`## ${angle} ${kwWords}: ${subAngle}`);
  }

  const h3Count = 2 + (hashVal % 2); // 2 or 3 H3s
  const h3List: string[] = [];
  for (let j = 0; j < h3Count; j++) {
    const subAngle = subAngles[(hashVal + j * 4 + 3) % subAngles.length];
    h3List.push(`### Technical Focus: ${subAngle}`);
  }

  return { h2List, h3List, patternIndex, domainKey };
}

function generateDynamicDomainContent(keyword: string, category: string, hashVal: number): { title: string; excerpt: string; paragraphs: string[]; faqs: { question: string; answer: string }[] } {
  const kwFmt = formatNaturalKeyword(keyword);
  const tokens = extractKeywordSubTokens(keyword);
  const { h2List, h3List, patternIndex } = generateDynamicHeadingsAndPattern(keyword, hashVal);

  const titlePrefixes = [
    `Evaluating ${kwFmt.title}: Performance, Specifications & Verdict`,
    `The Complete ${kwFmt.title} Guide: Design, Function & Durability`,
    `Deconstructing ${kwFmt.title}: Benchmarks, Care & Ergonomics`,
    `Mastering ${kwFmt.title}: Installation, Maintenance & Features`,
    `Inside ${kwFmt.title}: Architectural Quality & Real-World Results`,
    `${kwFmt.title} Evaluated: Technology Evolution & User Guide`
  ];
  const title = titlePrefixes[hashVal % titlePrefixes.length];

  let excerpt = `An in-depth editorial evaluation of ${kwFmt.topic}, exploring technical benchmarks, real-world utility, and market trends.`;
  if (tokens.isGaming) {
    excerpt = `High-performance gaming mice demand sub-millisecond wireless responsiveness, ultra-lightweight shell ergonomics, and optical tracking precision.`;
  } else if (tokens.isCold && tokens.isTap) {
    excerpt = `Operating under constant line pressure, bathroom cold water taps demand frost-resistant supply lines, anti-whistle valves, and low-flow aerators.`;
  } else if (tokens.isHot && tokens.isTap) {
    excerpt = `Engineered for thermal expansion resilience and anti-scald safety, instant hot water taps combine boiler integration with precise temperature control.`;
  } else if (tokens.isBlack && tokens.isTap) {
    excerpt = `Combining bold architectural contrast with electroplated PVD surface resilience, matte black taps require non-abrasive care and microfiber maintenance.`;
  } else if (tokens.isSmartHome) {
    excerpt = `Exploring smart home hubs with multi-protocol Matter and Thread antenna arrays, local rule execution engines, and zero-cloud-latency security.`;
  }

  // Interleave paragraphs dynamically based on structural Pattern (1 to 6)
  const paragraphs: string[] = [];

  // Paragraph 1: Intro
  paragraphs.push(`Evaluating the technical architecture and real-world utility of ${kwFmt.topic} requires examining core component specifications, user ergonomics, and long-term durability standards. Whether integrating new fixtures or upgrading existing hardware, making an informed selection ensures seamless daily performance.`);

  if (patternIndex === 1) {
    // Pattern 1: Deep Tech Review
    if (h2List[0]) paragraphs.push(h2List[0]);
    paragraphs.push(`Modern engineering standards for ${kwFmt.topic} prioritize precision manufacturing, low operational friction, and high energy or fluid efficiency. Built with premium materials, key internal components withstand continuous daily use without physical degradation.`);
    if (h3List[0]) paragraphs.push(h3List[0]);
    paragraphs.push(`Calibrating secondary hardware settings optimizes responsiveness and prolongs service life. Routine inspections every few months prevent minor wear points from impacting overall system reliability.`);
    if (h2List[1]) paragraphs.push(h2List[1]);
    paragraphs.push(`Real-world field testing demonstrates how ${kwFmt.topic} integrates into modern user workflows. Low-maintenance operation and intuitive control interfaces ensure consistent results across diverse conditions.`);
    if (h2List[2]) paragraphs.push(h2List[2]);
    paragraphs.push(`Comparing contemporary iterations against legacy alternatives reveals substantial gains in structural resilience, tactile response, and ecological sustainability.`);
    if (h3List[1]) paragraphs.push(h3List[1]);
    paragraphs.push(`Proper installation procedures and accurate depth clearance measurements eliminate fitting stress and prevent premature seal or joint failure.`);
    if (h2List[3]) paragraphs.push(h2List[3]);
    paragraphs.push(`Investing in top-tier ${kwFmt.topic} delivers an optimal balance of functional performance, refined aesthetics, and long-term satisfaction.`);
  } else if (patternIndex === 2) {
    // Pattern 2: Architectural & Design Guide
    if (h2List[0]) paragraphs.push(h2List[0]);
    paragraphs.push(`Aesthetic integration and spatial proportion are pivotal when selecting ${kwFmt.topic}. Pairing sleek metallic or matte finishes with complementary architectural elements creates a cohesive visual statement across the entire room.`);
    if (h2List[1]) paragraphs.push(h2List[1]);
    paragraphs.push(`Surface treatments like electroplated PVD coatings bond atomically to brass or alloy bodies, resisting scratches, tarnishing, and chemical discoloration over years of daily exposure.`);
    if (h3List[0]) paragraphs.push(h3List[0]);
    paragraphs.push(`Wiping surfaces dry with a soft microfiber cloth and mild dish soap preserves protective coatings, preventing mineral spot buildup without abrasive scrubbing.`);
    if (h2List[2]) paragraphs.push(h2List[2]);
    paragraphs.push(`Behind-the-wall rough-in depth planning and precise tile alignment guarantee that valve assemblies and mounting plates fit flush without awkward gaps.`);
    if (h3List[1]) paragraphs.push(h3List[1]);
    paragraphs.push(`Coordinating hardware finishes across cabinet pulls, mounting brackets, and primary fixtures establishes a harmonious design motif.`);
    if (h2List[3]) paragraphs.push(h2List[3]);
    paragraphs.push(`Exploring ${kwFmt.topic} unlocks endless creative potential, transforming everyday utility into timeless architectural design.`);
  } else {
    // Patterns 3 to 6: Versatile Layouts
    for (let k = 0; k < h2List.length; k++) {
      paragraphs.push(h2List[k]);
      paragraphs.push(`Key operational considerations for ${kwFmt.topic} focus on component longevity, user ergonomics, and low maintenance overhead. High-quality construction materials prevent premature wear while delivering effortless control.`);
      if (k === 1 && h3List[0]) {
        paragraphs.push(h3List[0]);
        paragraphs.push(`Fine-tuning internal calibration settings ensures smooth actuation and consistent output during peak operational demands.`);
      }
      if (k === 3 && h3List[1]) {
        paragraphs.push(h3List[1]);
        paragraphs.push(`Adhering to recommended service protocols preserves warranty coverage and keeps internal mechanisms running dripless and friction-free.`);
      }
    }
    paragraphs.push(`Selecting high-caliber ${kwFmt.topic} provides peace of mind, combining technical innovation with dependable daily utility.`);
  }

  // Generate 100% topic-tailored FAQs
  const faqs = [
    { question: `What key specifications should I check when choosing ${kwFmt.topic}?`, answer: `Focus on build material quality, technical compatibility, energy or fluid efficiency, and manufacturer warranty coverage before making your selection.` },
    { question: `How do I maintain peak performance for ${kwFmt.topic} over time?`, answer: `Follow non-abrasive cleaning protocols, conduct routine inspections every few months, and replace worn internal seals or components promptly.` },
    { question: `Why is modern hardware superior to legacy alternatives for ${kwFmt.topic}?`, answer: `Modern iterations incorporate advanced materials and refined engineering, offering higher efficiency, longer durability, and smoother operation.` },
    { question: `Where can I find additional technical guides for ${kwFmt.topic}?`, answer: `Consult manufacturer documentation, specialized technical reviews, and editorial dispatches on On Gravity Magazine for expert advice.` }
  ];

  return { title, excerpt, paragraphs, faqs };
}

export async function generateArticleObjectAsync(
  rawKeyword: string,
  categoryOverride?: string,
  slugOverride?: string
): Promise<Article> {
  const cleanKw = rawKeyword.trim();
  const kwFmt = formatNaturalKeyword(cleanKw);
  const slug = slugOverride || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const category = categoryOverride || inferCategoryFromKeyword(cleanKw);
  const hashVal = getDeterministicHash(cleanKw);

  const AUTHORS = [
    { name: "Marcus Vance", role: "Senior Technology Editor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { name: "Elena Rostova", role: "Pop Culture Lead", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { name: "Sophia Chen", role: "Lifestyle & Wellness Columnist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
    { name: "David Sterling", role: "Chief Economics Analyst", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { name: "Camilla Dupuis", role: "Culinary Editor", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" },
  ];
  const author = AUTHORS[hashVal % AUTHORS.length];

  const image = await fetchUniqueUnsplashImage(cleanKw, category);
  const { title, excerpt, paragraphs, faqs } = generateDynamicDomainContent(cleanKw, category, hashVal);

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
    readTime: `${Math.max(6, Math.ceil(paragraphs.join(" ").split(" ").length / 150))} min read`,
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
  const hashVal = getDeterministicHash(cleanKw);

  const AUTHORS = [
    { name: "Marcus Vance", role: "Senior Technology Editor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { name: "Elena Rostova", role: "Pop Culture Lead", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { name: "Sophia Chen", role: "Lifestyle & Wellness Columnist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  ];
  const author = AUTHORS[hashVal % AUTHORS.length];
  const { title, excerpt, paragraphs, faqs } = generateDynamicDomainContent(cleanKw, category, hashVal);
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
    readTime: "7 min read",
    imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`,
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
    if (!map.has(art.slug)) map.set(art.slug, art);
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
    return await generateArticleObjectAsync(rawKeyword, undefined, slug);
  } catch (err) {
    console.error("On-demand article generation failed:", err);
  }

  return undefined;
}

export function clearPublishedStore() {
  dynamicArticlesStore = [];
}
