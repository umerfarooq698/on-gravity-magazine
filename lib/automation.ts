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
  const raw = keyword.replace(/&/g, "and").trim();
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
    isTiles: kw.includes("tile") || kw.includes("flooring") || kw.includes("paving") || kw.includes("porcelain") || kw.includes("ceramic") || kw.includes("slate") || kw.includes("marble") || kw.includes("granite"),
    isBathroom: kw.includes("bathroom") || kw.includes("toilet") || kw.includes("seat") || kw.includes("vanity") || kw.includes("basin") || kw.includes("shower") || kw.includes("tub") || kw.includes("sink") || kw.includes("drain"),
    isIdea: kw.includes("idea") || kw.includes("design") || kw.includes("inspiration") || kw.includes("style") || kw.includes("concept") || kw.includes("decor"),
    isCold: kw.includes("cold"),
    isHot: kw.includes("hot") || kw.includes("boiling") || kw.includes("warm"),
    isBlack: kw.includes("black") || kw.includes("dark") || kw.includes("matte"),
    isGold: kw.includes("gold") || kw.includes("brass") || kw.includes("bronze") || kw.includes("copper"),
    isTap: kw.includes("tap") || kw.includes("faucet") || kw.includes("mixer") || kw.includes("spout") || kw.includes("plumbing"),
    isGaming: kw.includes("gaming") || kw.includes("mouse") || kw.includes("keyboard") || kw.includes("gpu") || kw.includes("headset") || kw.includes("console") || kw.includes("pc"),
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
  const cleanKw = keyword.trim().toLowerCase().replace(/&/g, "and");
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

  if (tokens.isBathroom || tokens.isTiles) return { url: `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of bathroom interior and fixtures for ${keyword}.`, alt: `Modern bathroom interior setup` };
  if (tokens.isGaming) return { url: `https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of gaming hardware for ${keyword}.`, alt: `Black computer gaming mouse` };
  if (tokens.isBlack && tokens.isTap) return { url: `https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of matte black bathroom tap.`, alt: `Matte black bathroom tap` };
  if (tokens.isCold && tokens.isTap) return { url: `https://images.unsplash.com/photo-1623111771733-d3ab4d26ce41?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of cold water supply tap.`, alt: `Silver bathroom cold tap` };
  if (tokens.isTap || tokens.isIdea) return { url: `https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph highlighting ${keyword}.`, alt: `Bathroom faucet and basin` };
  if (tokens.isSmartHome) return { url: `https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}`, caption: `Editorial photograph of smart home hub.`, alt: `Smart home hub interface` };

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

function inferCategoryFromKeyword(keyword: string): string {
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
    kw.includes("vanity") ||
    kw.includes("basin") ||
    kw.includes("shower") ||
    kw.includes("mirror") ||
    kw.includes("sink") ||
    kw.includes("kitchen") ||
    kw.includes("sofa") ||
    kw.includes("bed") ||
    kw.includes("chair") ||
    kw.includes("table") ||
    kw.includes("decor") ||
    kw.includes("furniture") ||
    kw.includes("interior")
  ) return "life-style";
  if (kw.includes("health") || kw.includes("sleep") || kw.includes("fitness") || kw.includes("wellness") || kw.includes("skin") || kw.includes("diet") || kw.includes("workout")) return "health";
  if (kw.includes("business") || kw.includes("crypto") || kw.includes("stock") || kw.includes("market") || kw.includes("musk") || kw.includes("invest") || kw.includes("money") || kw.includes("finance")) return "business";
  if (kw.includes("food") || kw.includes("dining") || kw.includes("chef") || kw.includes("coffee") || kw.includes("recipe") || kw.includes("dish") || kw.includes("culinary")) return "food";
  if (kw.includes("news") || kw.includes("climate") || kw.includes("policy") || kw.includes("global") || kw.includes("accord") || kw.includes("world")) return "news";
  return "tech";
}

// ----------------------------------------------------
// STRICT 55-60 CHAR SEO TITLE GENERATOR
// ----------------------------------------------------

function getDomainKey(kw: string): string {
  const lower = kw.toLowerCase();
  if (lower.includes("tile") || lower.includes("flooring")) return "tiles";
  if (lower.includes("mouse") || lower.includes("gaming") || lower.includes("keyboard")) return "gaming";
  if (lower.includes("cold")) return "cold_tap";
  if (lower.includes("hot")) return "hot_tap";
  if (lower.includes("black") || lower.includes("matte")) return "black_tap";
  if (lower.includes("tap") || lower.includes("faucet") || lower.includes("tub") || lower.includes("drain")) return "plumbing";
  if (lower.includes("smart") || lower.includes("hub") || lower.includes("tv")) return "smarthome";
  if (lower.includes("crypto") || lower.includes("market") || lower.includes("musk")) return "crypto";
  if (lower.includes("food") || lower.includes("coffee")) return "food";
  if (lower.includes("fashion") || lower.includes("gala")) return "fashion";
  return "general";
}

const DOMAIN_SUFFIXES: Record<string, string[]> = {
  tiles: [
    ": Porcelain Surface Density and Installation",
    ": Grout Line Expansion and Slip Resistance",
    ": Water Absorption and Surface Finish Care"
  ],
  gaming: [
    ": Sensor Precision, Latency and Weight",
    ": Optical Tracking, Polling and Ergonomics",
    ": Ergonomic Grip and Low Latency Control"
  ],
  cold_tap: [
    ": Installation, Aerator Flow and Leak Care",
    ": Line Pressure, Aerators and Flow Control",
    ": Aerator Screen Cleaning and Valve Safety"
  ],
  hot_tap: [
    ": Instant Water Delivery and Heat Safety",
    ": Thermostatic Valve and Pressure Balance",
    ": Instant Water Delivery and Thermal Safety"
  ],
  black_tap: [
    ": PVD Surface Coating Finish and Stain Care",
    ": Hard Water Mineral Protection and Finish",
    ": Non-Abrasive Cleaning and Basin Finish"
  ],
  plumbing: [
    ": Ceramic Disc Valves and Basin Flow Rates",
    ": Installation Seals, Pressure and Control",
    ": Spout Reach and Vessel Clearance"
  ],
  smarthome: [
    ": Matter Protocol and Local Automation",
    ": Mesh Network Range and Device Security",
    ": Zero-Cloud Latency and Sensor Hubs"
  ],
  crypto: [
    ": Liquidity Dynamics and Capital Shifts",
    ": Asset Allocation and Market Metrics"
  ],
  food: [
    ": Michelin Culinary Craft and Farm Prep",
    ": Artisanal Prep and Recipe Insights"
  ],
  fashion: [
    ": Red Carpet Couture and Gala Fashion",
    ": Runway Style and Designer Highlights"
  ],
  general: [
    ": Architectural Specs and Quality Review",
    ": Technical Features and System Efficiency"
  ]
};

const PHRASES_BY_LEN: Record<number, string> = {
  15: ": System Review",
  16: ": Tech Evaluation",
  17: ": System Analytics",
  18: ": Performance Review",
  19: ": Technical Analysis",
  20: ": Structural Overview",
  21: ": Performance and Specs",
  22: ": Architectural Review",
  23: ": Engineering Evaluation",
  24: ": System Features Review",
  25: ": Features and Performance",
  26: ": System Quality and Design",
  27: ": Installation and Valve Care",
  28: ": System Performance and Build",
  29: ": Complete Technical Performance",
  30: ": System Performance and Quality",
  31: ": System Standards and Features",
  32: ": Engineering Standards and Specs",
  33: ": Technical Efficiency and Quality",
  34: ": Engineering Standards and Quality",
  35: ": System Engineering and Performance",
  36: ": Architectural Performance Standards",
  37: ": System Engineering and Craftsmanship",
  38: ": Real-World Durability and Performance",
  39: ": Complete Performance and System Review",
  40: ": Architectural and Engineering Review",
  41: ": Technical Benchmarks and Feature Review",
  42: ": Technical Performance and System Craft",
  43: ": Real-World Engineering and System Review",
  44: ": Architectural Feature and System Standards",
  45: ": Complete Technical and Architectural Setup"
};

export function formatSeoTitle(rawKeyword: string, hashVal: number = 0): string {
  const clean = rawKeyword.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  let kwWords = clean.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  if (kwWords.length >= 55 && kwWords.length <= 60 && !kwWords.includes("&")) {
    return kwWords;
  }
  if (kwWords.length > 60) {
    let sub = kwWords.slice(0, 58);
    const spaceIdx = sub.lastIndexOf(" ");
    if (spaceIdx >= 55) {
      return sub.slice(0, spaceIdx);
    }
    return sub.slice(0, 57);
  }

  const domainKey = getDomainKey(clean);
  const domainSuffixes = DOMAIN_SUFFIXES[domainKey] || DOMAIN_SUFFIXES.general;

  for (let i = 0; i < domainSuffixes.length; i++) {
    const candidate = `${kwWords}${domainSuffixes[(hashVal + i) % domainSuffixes.length]}`;
    if (candidate.length >= 55 && candidate.length <= 60) {
      return candidate.replace(/&/g, "and");
    }
  }

  const needed = 57 - kwWords.length;
  for (let offset = 0; offset <= 4; offset++) {
    const tryLengths = [needed + offset, needed - offset];
    for (const len of tryLengths) {
      if (PHRASES_BY_LEN[len]) {
        const candidate = kwWords + PHRASES_BY_LEN[len];
        if (candidate.length >= 55 && candidate.length <= 60) {
          return candidate.replace(/&/g, "and");
        }
      }
    }
  }

  const fallback = (kwWords + ": Technical Performance and System Craftsmanship").slice(0, 57);
  return fallback.replace(/&/g, "and");
}

// ----------------------------------------------------
// DYNAMIC MULTI-MATRIX UNIQUENESS CONTENT GENERATOR
// ----------------------------------------------------

function generateDynamicDomainContent(keyword: string, category: string, hashVal: number): {
  title: string;
  excerpt: string;
  paragraphs: string[];
  faqs: { question: string; answer: string }[];
} {
  const cleanKw = keyword.replace(/&/g, "and").trim();
  const kwFmt = formatNaturalKeyword(cleanKw);
  const tokens = extractKeywordSubTokens(cleanKw);
  const title = formatSeoTitle(cleanKw, hashVal);
  const topicTitle = kwFmt.topic.replace(/&/g, "and");
  const kwTitle = kwFmt.title.replace(/&/g, "and");

  // Meta Excerpt Synthesis
  let rawExcerpt = `An in-depth editorial evaluation of ${topicTitle}, exploring technical benchmarks, real-world utility, and market trends.`;
  if (tokens.isBathroom || tokens.isTiles) {
    rawExcerpt = `Comprehensive technical evaluation of ${topicTitle}, detailing porcelain density, slip resistance ratings, and installation standards.`;
  } else if (tokens.isCold && tokens.isTap) {
    rawExcerpt = `Operating under constant line pressure, bathroom cold water taps demand frost-resistant supply lines, anti-whistle valves, and low-flow aerators.`;
  } else if (tokens.isBlack && tokens.isTap) {
    rawExcerpt = `Combining bold architectural contrast with electroplated PVD surface resilience, matte black taps require non-abrasive care and microfiber maintenance.`;
  } else if (tokens.isGaming) {
    rawExcerpt = `High-performance gaming hardware demands sub-millisecond responsiveness, ergonomic shell design, optical tracking precision, and switch durability.`;
  } else if (tokens.isSmartHome) {
    rawExcerpt = `Exploring smart home automation hubs with multi-protocol Matter and Thread antenna arrays, local rule execution engines, and zero-cloud security.`;
  }
  const excerpt = formatMetaDescription(rawExcerpt);

  // Dynamic Headings Selection
  const h2_1_options = [
    `## ${kwTitle} Material Selection and Quality Standards`,
    `## Core Architectural Features of ${kwTitle}`,
    `## Understanding ${kwTitle} Engineering and Specifications`,
    `## Essential Composition and Standards for ${kwTitle}`,
    `## Design Versatility and Craftsmanship in ${kwTitle}`,
    `## Structural Integrity and Material Science of ${kwTitle}`,
    `## Premium Material Grades and Manufacturing for ${kwTitle}`,
    `## Technical Specifications and Material Quality of ${kwTitle}`
  ];
  const h2_1 = h2_1_options[hashVal % h2_1_options.length];

  const h3_1_options = [
    `### ${kwTitle} Surface Finish Inspection`,
    `### Structural Tolerance and Load Verification`,
    `### Technical Specification Checklist`,
    `### Quality Assurance and Material Certification`,
    `### Dimension Precision and Alignment Protocol`,
    `### Pre-Installation Inspection Guidelines`
  ];
  const h3_1 = h3_1_options[(hashVal + 1) % h3_1_options.length];

  const h2_2_options = [
    `## Practical Utility and Everyday Performance`,
    `## Ergonomics and Spatial Integration of ${kwTitle}`,
    `## Operational Efficiency and Functional Design`,
    `## Practical Application and Real-World Use of ${kwTitle}`,
    `## User Experience and System Integration`,
    `## Modern Ergonomics and Spatial Harmony`,
    `## Aesthetic Impact and Functional Utility of ${kwTitle}`,
    `## Spatial Dynamics and Integration Best Practices`
  ];
  const h2_2 = h2_2_options[(hashVal + 2) % h2_2_options.length];

  const h2_3_options = [
    `## Performance Benchmarks and Long-Term Durability`,
    `## Comparative Stress Testing and Material Strength`,
    `## Environmental Resilience and Lifetime Expectations`,
    `## Load Distribution and Resistance Standards`,
    `## Technical Efficiency and Wear Resistance`,
    `## Long-Term Cost Efficiency and Reliability`,
    `## Durability Analysis under Daily Operating Stress`,
    `## Lifecycle Expectations and Hardware Performance`
  ];
  const h2_3 = h2_3_options[(hashVal + 3) % h2_3_options.length];

  const h2_4_options = [
    `## Routine Maintenance and Protective Care`,
    `## Cleaning Protocols and Surface Preservation`,
    `## Long-Term Care and Preventive Maintenance`,
    `## Service Life Optimization for ${kwTitle}`,
    `## Inspection Schedules and Seal Care Protocols`,
    `## Preserving Finish and Structural Quality`,
    `## Surface Cleaning and Preventative Care Protocols`,
    `## Upkeep Standards for Maximum Longevity`
  ];
  const h2_4 = h2_4_options[(hashVal + 4) % h2_4_options.length];

  const paragraphs: string[] = [];

  // Intro Paragraph Matrix (6 variations)
  const introVars = [
    `Evaluating the technical architecture, component craftsmanship, and practical utility of ${topicTitle} requires examining core operational parameters, material density, and surface longevity. Making an informed hardware or material selection ensures long-term service reliability, elevated aesthetic value, and seamless daily performance across residential or commercial environments.`,
    `Selecting high-grade ${topicTitle} plays a pivotal role in modern design, functional efficiency, and structural performance. Understanding key manufacturing standards, installation requirements, and long-term durability metrics enables homeowners and trade professionals to make well-founded investment decisions.`,
    `The modern approach to ${topicTitle} combines refined visual appeal with cutting-edge engineering principles. By prioritizing superior raw material selection and rigorous testing protocols, current market iterations deliver exceptional resistance to daily wear while enhancing spatial ergonomics.`,
    `Analyzing the technical specifications and practical benefits of ${topicTitle} highlights significant advancements in material formulation, surface sealants, and user-centric design. Selecting certified options guarantees optimal operational stability and lasting aesthetic harmony.`,
    `Investing in premium ${topicTitle} involves balancing aesthetic preferences with rigorous engineering standards. From structural load capacity to non-abrasive surface finishes, modern configurations offer versatile solutions tailored to demanding usage demands.`,
    `A comprehensive editorial review of ${topicTitle} demonstrates how material innovation and precision manufacturing transform everyday spaces. Highlighting key installation guidelines and performance benchmarks ensures sustained functionality and minimal maintenance requirements.`
  ];
  paragraphs.push(introVars[hashVal % introVars.length]);

  // Section 1: H2_1 + Body 1 + Body 2
  paragraphs.push(h2_1);
  const sec1P1Vars = [
    `Assessing the structural composition and material density of ${topicTitle} is essential for ensuring long-term resilience under continuous operational stress. Advanced manufacturing processes utilize high-purity raw materials and specialized heat treatments that prevent early material fatigue and surface degradation.`,
    `At the core of high-performance ${topicTitle} lies a commitment to material integrity and precision engineering. Incorporating dense composite layers and anti-corrosive treatments safeguards the assembly against environmental moisture, thermal expansion, and mechanical shock.`,
    `Quality craftsmanship in ${topicTitle} begins with rigorous raw material vetting and strict manufacturing tolerances. Utilizing premium grade alloys or high-fired ceramics guarantees uniform structural strength and superior resistance against surface scratching.`,
    `Modern technical standards for ${topicTitle} demand certified compliance with environmental and structural safety protocols. Advanced surface sealants and dense core backing prevent moisture penetration and preserve physical stability over years of service.`
  ];
  paragraphs.push(sec1P1Vars[(hashVal + 1) % sec1P1Vars.length]);

  const sec1P2Vars = [
    `Selecting certified configurations for ${topicTitle} guarantees compliance with international safety and environmental benchmarks. Rigorous factory stress testing confirms consistent load distribution and structural integrity even under demanding conditions.`,
    `Furthermore, opting for standardized ${topicTitle} ensures hassle-free compatibility with existing sub-structures and mounting hardware. Precision manufacturing eliminates dimensional variance, streamlining initial fitting and reducing overall labor overhead.`,
    `Adhering to recognized industry standards during the manufacturing of ${topicTitle} mitigates risks of structural misalignment or premature wear. Verified material certifications provide trade installers with complete confidence in long-term field performance.`,
    `High-caliber manufacturing for ${topicTitle} emphasizes uniform grain alignment and protective surface sealers. These measures inhibit moisture absorption and prevent chemical erosion over decades of continuous use.`
  ];
  paragraphs.push(sec1P2Vars[(hashVal + 2) % sec1P2Vars.length]);

  // Subsection 1: H3_1 + Body
  paragraphs.push(h3_1);
  const sec1H3Vars = [
    `Prior to initial installation or assembly of ${topicTitle}, perform a thorough visual and dimensional inspection. Verifying surface levelness, edge alignment, and seal integrity prevents subtle installation flaws and guarantees seamless integration.`,
    `Before finalizing the placement of ${topicTitle}, inspect all contact surfaces and mounting points for micro-imperfections. Ensuring clean, debris-free sub-layers promotes optimal adhesion and prevents unneeded stress concentrations.`,
    `Conducting a comprehensive pre-assembly checklist for ${topicTitle} helps identify any structural clearance issues early. Checking component tolerances and fastener torque limits preserves warranty coverage and ensures long-term safety.`,
    `Careful preparation before fitting ${topicTitle} includes evaluating environmental humidity and substrate flatness. Achieving proper baseline conditions eliminates flex and guarantees rigid, durable installation.`
  ];
  paragraphs.push(sec1H3Vars[(hashVal + 3) % sec1H3Vars.length]);

  // Section 2: H2_2 + Body 1 + Body 2
  paragraphs.push(h2_2);
  const sec2P1Vars = [
    `User ergonomics and intuitive design shape the real-world efficiency of ${topicTitle}. Products engineered with user-centric contours reduce physical strain during daily interaction, enhancing precision and overall operational comfort across residential and commercial settings.`,
    `Integrating ${topicTitle} into existing layout schemes requires careful consideration of spatial proportions and visual balance. Modern options offer streamlined profiles that complement diverse architectural styles while maximizing functional space.`,
    `Practical usability remains a cornerstone of high-caliber ${topicTitle} design. Ergonomic contours combined with tactile responsiveness provide an intuitive user experience that elevates everyday utility.`,
    `Modern engineering for ${topicTitle} emphasizes seamless functional flow and spatial harmony. Designing with user comfort in mind reduces operational friction and improves overall satisfaction.`
  ];
  paragraphs.push(sec2P1Vars[(hashVal + 4) % sec2P1Vars.length]);

  const sec2P2Vars = [
    `Achieving seamless integration of ${topicTitle} within a broader interior or architectural framework demands attention to detail regarding color harmony, tactile textures, and clearance dimensions. Well-designed products blend effortless aesthetics with uncompromised utility.`,
    `When evaluating layout configurations for ${topicTitle}, trade professionals emphasize maintaining adequate operational clearance and accessible service access. Streamlined geometry ensures smooth movement and simplifies routine surface cleaning.`,
    `Modern design trends emphasize clean geometry and versatile finish options for ${topicTitle}. Whether deployed in minimalist contemporary environments or classic traditional spaces, well-engineered units enhance overall ambient value.`,
    `Refined aesthetic finishes on ${topicTitle} resist fingerprinting and smudging, keeping surfaces visually immaculate with minimal daily effort. Versatile mounting options allow custom tailoring to match specific design layouts.`
  ];
  paragraphs.push(sec2P2Vars[(hashVal + 5) % sec2P2Vars.length]);

  // Section 3: H2_3 + Body 1 + Body 2
  paragraphs.push(h2_3);
  const sec3P1Vars = [
    `Comparative performance benchmarks demonstrate distinct advantages when adopting updated standards for ${topicTitle}. Refined engineering minimizes operational friction, optimizes resource consumption, and extends total service life compared to legacy alternatives.`,
    `Under rigorous accelerated life testing, high-caliber ${topicTitle} retains its structural form and surface finish despite repeated thermal cycling and mechanical load. This resilience translates directly into reduced replacement frequency and lower long-term cost.`,
    `Evaluating stress resistance metrics reveals that modern ${topicTitle} offers superior tensile strength and impact absorption. Specialized protective coatings protect underlying materials against discoloration and chemical staining.`,
    `Engineered for demanding service conditions, ${topicTitle} exhibits outstanding wear resistance under daily commercial or residential usage. Superior material density protects against impact micro-cracks.`
  ];
  paragraphs.push(sec3P1Vars[(hashVal + 6) % sec3P1Vars.length]);

  const sec3P2Vars = [
    `Long-term field data confirms that investing in well-crafted ${topicTitle} yields significant dividends in maintenance savings and operational uptime. Robust construction safeguards internal mechanisms against degradation from environmental exposure.`,
    `Thermal stability testing confirms that ${topicTitle} maintains dimensional accuracy across wide temperature gradients. High structural stability prevents warping, joint cracking, or sealant separation over decades of continuous use.`,
    `By meeting stringent durability benchmarks, ${topicTitle} provides dependable performance under heavy daily traffic or high-frequency usage. Quality manufacturing guarantees that structural integrity remains intact throughout the product lifecycle.`,
    `Structural analysis highlights that high-density manufacturing lowers maintenance intervals for ${topicTitle}. Reinforced structural ribs and precision-machined joints absorb shock loads without deformities.`
  ];
  paragraphs.push(sec3P2Vars[(hashVal + 7) % sec3P2Vars.length]);

  // Section 4: H2_4 + Body 1 + Body 2
  paragraphs.push(h2_4);
  const sec4P1Vars = [
    `Establishing a regular cleaning schedule using mild, non-abrasive agents protects surface sealants and prevents corrosive mineral or grime buildup on ${topicTitle}. Promptly drying standing moisture preserves pristine surface luster.`,
    `To maintain the pristine condition of ${topicTitle}, avoid aggressive chemical cleaners, acidic sprays, or harsh scouring pads that strip protective coatings. Gentle microfiber care combined with neutral pH cleansers ensures the finish remains unblemished.`,
    `Preventative maintenance protocols for ${topicTitle} focus on routine surface cleaning and periodic seal inspections. Early removal of surface contaminants prevents stubborn staining and preserves physical finish clarity.`,
    `Simple routine cleaning practices significantly extend the attractive appearance of ${topicTitle}. Utilizing soft cotton cloths and mild soap solutions prevents micro-abrasions on clear topcoats.`
  ];
  paragraphs.push(sec4P1Vars[(hashVal + 8) % sec4P1Vars.length]);

  const sec4P2Vars = [
    `Conducting periodic structural inspections every six to twelve months allows early detection of minor seal wear or joint loosening on ${topicTitle}. Replacing worn gaskets or fasteners promptly protects surrounding building structures and maintains full warranty coverage.`,
    `Inspecting underlying mounting seals and hardware connections guarantees that ${topicTitle} operates at peak safety levels. Timely servicing prevents minor wear from expanding into costly structural repairs.`,
    `Adhering to manufacturer care guidelines guarantees that ${topicTitle} retains both its functional capabilities and high resale value. Simple preventative routines ensure reliable performance for years to come.`,
    `Regular technical maintenance for ${topicTitle} preserves system integrity and prevents unneeded hardware downtime. Documenting periodic service checks ensures full compliance with warranty terms.`
  ];
  paragraphs.push(sec4P2Vars[(hashVal + 9) % sec4P2Vars.length]);

  // Conclusion Section (MUST BE BEFORE FAQs)
  paragraphs.push("## Conclusion and Summary");
  const conclusionVars = [
    `In conclusion, choosing high-quality ${topicTitle} relies on evaluating structural design, material craftsmanship, and practical utility. Consistent care, non-abrasive maintenance, and adherence to technical operating limits preserve peak performance and long-term durability.`,
    `Ultimately, investing in well-engineered ${topicTitle} delivers long-term durability, structural integrity, and superior spatial aesthetics. Proper care, surface protection, and timely maintenance ensure that your setup remains pristine and fully functional over years of regular use.`,
    `To summarize, the long-term success of any ${topicTitle} installation hinges on material selection, spatial ergonomics, and preventive upkeep. Following expert recommendations safeguards your investment and elevates the overall quality of your space.`,
    `In summary, selecting premium ${topicTitle} requires a balanced evaluation of material quality, installation precision, and maintenance routine. By adhering to recommended technical guidelines and routine inspection schedules, users can maximize product lifespan while maintaining optimal performance.`
  ];
  paragraphs.push(conclusionVars[(hashVal + 10) % conclusionVars.length]);

  // FAQs Matrix
  const faqs = [
    {
      question: `What key specifications should I check when choosing ${topicTitle}?`,
      answer: `Focus on build material quality, technical compatibility, energy or fluid efficiency, and manufacturer warranty coverage before making your selection.`
    },
    {
      question: `How do I maintain peak performance for ${topicTitle} over time?`,
      answer: `Follow non-abrasive cleaning protocols, conduct routine inspections every few months, and replace worn internal seals or components promptly.`
    },
    {
      question: `Why is modern hardware superior to legacy alternatives for ${topicTitle}?`,
      answer: `Modern iterations incorporate advanced materials and refined engineering, offering higher efficiency, longer durability, and smoother operation.`
    },
    {
      question: `Where can I find additional technical guides for ${topicTitle}?`,
      answer: `Consult manufacturer documentation, specialized technical reviews, and editorial dispatches on On Gravity Magazine for expert advice.`
    }
  ];

  return { title, excerpt, paragraphs, faqs };
}

export async function generateArticleObjectAsync(
  rawKeyword: string,
  categoryOverride?: string,
  slugOverride?: string
): Promise<Article> {
  const cleanKw = rawKeyword.replace(/&/g, "and").trim();
  const baseSlug = slugOverride || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  let slug = baseSlug;
  let hashSeed = cleanKw;

  if (!slugOverride) {
    const allExisting = getAllArticlesCombined();
    const existingMatches = allExisting.filter(
      (a) => a.slug === baseSlug || a.slug.match(new RegExp(`^${baseSlug}-\\d+$`))
    );
    if (existingMatches.length > 0) {
      const nextNum = existingMatches.length + 1;
      slug = `${baseSlug}-${nextNum}`;
      hashSeed = `${cleanKw}-${nextNum}-${Date.now()}`;
    }
  } else {
    hashSeed = `${cleanKw}-${slugOverride}-${Date.now()}`;
  }

  const kwFmt = formatNaturalKeyword(cleanKw);
  const category = categoryOverride || inferCategoryFromKeyword(cleanKw);
  const hashVal = getDeterministicHash(hashSeed);

  const AUTHORS = [
    { name: "Marcus Vance", role: "Senior Technology Editor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { name: "Elena Rostova", role: "Pop Culture Lead", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { name: "Sophia Chen", role: "Lifestyle and Wellness Columnist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
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
  const cleanKw = item.keyword.replace(/&/g, "and");
  const kwFmt = formatNaturalKeyword(cleanKw);
  const category = item.category || inferCategoryFromKeyword(cleanKw);
  const slug = item.generatedArticleSlug || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(cleanKw);

  const AUTHORS = [
    { name: "Marcus Vance", role: "Senior Technology Editor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { name: "Elena Rostova", role: "Pop Culture Lead", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { name: "Sophia Chen", role: "Lifestyle and Wellness Columnist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
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

  const rawKeyword = slug.replace(/-\d+$/, "").replace(/-/g, " ");
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
