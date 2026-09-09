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
    ": Water Absorption and Surface Finish Care",
    ": Ceramic Material Density and Sealing Care",
    ": Slip Resistance Ratings and Installation",
    ": Surface Finish Care and Substrate Testing",
    ": Substrate Moisture Protection and Care",
    ": Wall and Floor Surface Quality Standards"
  ],
  gaming: [
    ": Sensor Precision, Latency and Weight",
    ": Optical Tracking, Polling and Ergonomics",
    ": Ergonomic Grip and Low Latency Control",
    ": Sub-Millisecond Responsiveness and Skates",
    ": Optical Switches and Debounce Delay Care",
    ": Wireless Signal Range and Sensor Tuning"
  ],
  cold_tap: [
    ": Installation, Aerator Flow and Leak Care",
    ": Line Pressure, Aerators and Flow Control",
    ": Aerator Screen Cleaning and Valve Safety",
    ": Ceramic Disc Cartridges and Pressure Care",
    ": Hose Connection Sealing and Frost Care"
  ],
  hot_tap: [
    ": Instant Water Delivery and Heat Safety",
    ": Thermostatic Valve and Pressure Balance",
    ": Instant Water Delivery and Thermal Safety",
    ": Boiler Integration and Anti-Scald Control"
  ],
  black_tap: [
    ": PVD Surface Coating Finish and Stain Care",
    ": Hard Water Mineral Protection and Finish",
    ": Non-Abrasive Cleaning and Basin Finish",
    ": Microfiber Upkeep and Electroplated Finish"
  ],
  plumbing: [
    ": Ceramic Disc Valves and Basin Flow Rates",
    ": Installation Seals, Pressure and Control",
    ": Spout Reach and Vessel Clearance",
    ": Strainer Seals and P-Trap Flow Velocity"
  ],
  smarthome: [
    ": Matter Protocol and Local Automation",
    ": Mesh Network Range and Device Security",
    ": Zero-Cloud Latency and Sensor Hubs",
    ": Thread Antenna Range and Rule Execution"
  ],
  crypto: [
    ": Liquidity Dynamics and Capital Shifts",
    ": Asset Allocation and Market Metrics",
    ": Smart Contract Audits and Protocol Yield"
  ],
  food: [
    ": Michelin Culinary Craft and Farm Prep",
    ": Artisanal Prep and Recipe Insights",
    ": Gourmet Flavor Sourcing and Plating Specs"
  ],
  fashion: [
    ": Red Carpet Couture and Gala Fashion",
    ": Runway Style and Designer Highlights",
    ": Atelier Craftsmanship and Archival Care"
  ],
  general: [
    ": Architectural Specs and Quality Review",
    ": Technical Features and System Efficiency",
    ": Structural Engineering and Quality Review",
    ": Performance Benchmarks and Feature Review",
    ": Modern Design Features and Quality Review"
  ]
};

const PHRASES_BY_LEN: Record<number, string[]> = {
  15: [": System Review", ": Technical Specs", ": Performance Check", ": Quality Analysis", ": Features Review"],
  16: [": Tech Evaluation", ": System Analytics", ": Design Evaluation", ": Structural Specs", ": Benchmark Review"],
  17: [": System Analytics", ": Technical Features", ": Build Quality Check", ": Performance Review", ": Engineering Check"],
  18: [": Performance Review", ": Architectural Build", ": System Specs Review", ": Technical Benchmark", ": Quality Analysis Check"],
  19: [": Technical Analysis", ": Engineering Overview", ": Performance Analytics", ": Structural Evaluation", ": System Features Check"],
  20: [": Structural Overview", ": Material Quality Check", ": Engineering Benchmarks", ": Technical Specs Review", ": Performance Analytics"],
  21: [": Performance and Specs", ": Architectural Overview", ": Technical System Review", ": Structural Specs Check", ": Quality and Efficiency"],
  22: [": Architectural Review", ": Engineering Standards", ": Material Quality Review", ": System Features Overview", ": Technical Performance Check"],
  23: [": Engineering Evaluation", ": Technical Specifications", ": Performance Benchmarks", ": Material Density Review", ": Architectural Standards"],
  24: [": System Features Review", ": Material Engineering Check", ": Performance and Quality", ": Technical System Analysis", ": Structural Specifications"],
  25: [": Features and Performance", ": Engineering Specifications", ": Material Quality and Specs", ": Architectural Build Review", ": Technical System Overview"],
  26: [": System Quality and Design", ": Technical Feature Analysis", ": Structural Engineering Check", ": Performance Benchmarks Review", ": Material Selection Standards"],
  27: [": Installation and Valve Care", ": Technical Efficiency Review", ": Structural Performance Specs", ": Material Quality and Design", ": Engineering Specs Overview"],
  28: [": System Performance and Build", ": Technical Feature Evaluation", ": Material Standards and Review", ": Structural Quality Analytics", ": Architectural Design Review"],
  29: [": Complete Technical Performance", ": Engineering Standards Overview", ": Material Quality and Performance", ": Structural Features Evaluation", ": Architectural Specs Breakdown"],
  30: [": System Performance and Quality", ": Architectural Features and Specs", ": Technical Engineering Overview", ": Material Standards and Quality", ": Durability Benchmarks and Build"],
  31: [": System Standards and Features", ": Architectural Quality and Specs", ": Technical Engineering Standards", ": Structural Integrity and Design", ": Material Performance Benchmarks"],
  32: [": Engineering Standards and Specs", ": Technical Efficiency and Design", ": Material Quality and Specs Review", ": Structural Integrity and Review", ": Architectural Performance Check"],
  33: [": Technical Efficiency and Quality", ": Structural Integrity and Build", ": Material Density and Finish Care", ": Architectural Standards and Specs", ": Performance Benchmarks and Quality"],
  34: [": Engineering Standards and Quality", ": Material Performance and Build Care", ": Surface Resilience and Finish Care", ": Structural Quality and Specs Review", ": Precision Engineering and System"],
  35: [": System Engineering and Performance", ": Material Craftsmanship and Quality", ": Surface Durability and Specs Review", ": Technical Performance and Review", ": Structural Integrity and Finish Care"],
  36: [": Architectural Performance Standards", ": Technical Engineering and Features", ": Structural Integrity and Specs Check", ": Material Durability and Build Quality", ": Engineering Quality and System Review"],
  37: [": System Engineering and Craftsmanship", ": Architectural Specs and Build Quality", ": Technical Performance and Quality Check", ": Structural Engineering and Specs Review", ": Material Resilience and Performance Check"],
  38: [": Real-World Durability and Performance", ": Architectural Feature and Quality Review", ": Technical Specifications and Build Quality", ": Structural Integrity and System Features", ": Engineering Standards and Build Performance"],
  39: [": Complete Performance and System Review", ": Architectural Engineering and Quality Check", ": Technical Feature and Performance Review", ": Structural Integrity and Material Quality", ": Engineering Standards and System Overview"],
  40: [": Architectural and Engineering Review", ": Technical Specifications and Feature Review", ": Structural Performance and Build Quality", ": Material Engineering and Quality Overview", ": Real-World Durability and System Review"],
  41: [": Technical Benchmarks and Feature Review", ": Architectural Integrity and Quality Review", ": Structural Engineering and Specs Overview", ": Material Quality and System Performance Check", ": Complete Engineering and System Analytics"],
  42: [": Technical Performance and System Craft", ": Architectural Features and Quality Specs", ": Structural Integrity and Feature Analytics", ": Real-World Engineering and Performance Check", ": Complete Material Quality and System Review"],
  43: [": Real-World Engineering and System Review", ": Architectural Standards and Quality Specs", ": Technical Specifications and System Overview", ": Structural Performance and Feature Analytics", ": Complete Engineering Standards and Specs"],
  44: [": Architectural Feature and System Standards", ": Technical Specifications and Performance Check", ": Structural Engineering and Material Analytics", ": Real-World Durability and System Standards", ": Complete Material Quality and System Review"],
  45: [": Complete Technical and Architectural Setup", ": Architectural Performance and Quality Specs", ": Technical Specifications and System Analytics", ": Structural Integrity and Performance Review", ": Real-World Engineering and Quality Standards"]
};

const PREFIX_OPTIONS = [
  "Modern ",
  "Premium ",
  "Advanced ",
  "Essential ",
  "Innovative ",
  "High-Grade ",
  "Precision "
];

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

  const candidatePool: string[] = [];

  // 1. Domain Suffix candidates
  for (let i = 0; i < domainSuffixes.length; i++) {
    const s = domainSuffixes[(hashVal + i) % domainSuffixes.length];
    candidatePool.push(`${kwWords}${s}`);
  }

  // 2. Prefix + kwWords + Domain Suffix candidates
  for (let pIdx = 0; pIdx < PREFIX_OPTIONS.length; pIdx++) {
    const prefix = PREFIX_OPTIONS[(hashVal + pIdx) % PREFIX_OPTIONS.length];
    for (let sIdx = 0; sIdx < domainSuffixes.length; sIdx++) {
      const s = domainSuffixes[(hashVal + sIdx) % domainSuffixes.length];
      candidatePool.push(`${prefix}${kwWords}${s}`);
    }
  }

  // 3. Length-matched phrases candidates
  const needed = 57 - kwWords.length;
  for (let offset = 0; offset <= 4; offset++) {
    const tryLengths = [needed + offset, needed - offset];
    for (const len of tryLengths) {
      if (PHRASES_BY_LEN[len]) {
        const phrases = PHRASES_BY_LEN[len];
        for (let p = 0; p < phrases.length; p++) {
          const phrase = phrases[(hashVal + p) % phrases.length];
          candidatePool.push(`${kwWords}${phrase}`);

          for (let prefIdx = 0; prefIdx < PREFIX_OPTIONS.length; prefIdx++) {
            const prefix = PREFIX_OPTIONS[(hashVal + prefIdx) % PREFIX_OPTIONS.length];
            const neededWithPrefix = 57 - (prefix.length + kwWords.length);
            if (PHRASES_BY_LEN[neededWithPrefix]) {
              const prefixPhrases = PHRASES_BY_LEN[neededWithPrefix];
              const pPhrase = prefixPhrases[(hashVal + p) % prefixPhrases.length];
              candidatePool.push(`${prefix}${kwWords}${pPhrase}`);
            }
          }
        }
      }
    }
  }

  const validCandidates = candidatePool.filter(c => c.length >= 55 && c.length <= 60 && !c.includes("&"));

  if (validCandidates.length > 0) {
    return validCandidates[hashVal % validCandidates.length];
  }

  const fallback = (kwWords + ": Technical Performance and System Craftsmanship").slice(0, 57);
  return fallback.replace(/&/g, "and");
}

// ----------------------------------------------------
// DYNAMIC MULTI-MATRIX UNIQUENESS CONTENT GENERATOR
// ----------------------------------------------------

function getExternalReferenceUrl(keyword: string): { url: string; text: string } {
  const kw = keyword.toLowerCase();
  const kwFmt = formatNaturalKeyword(keyword);

  if (kw.includes("tile") || kw.includes("flooring") || kw.includes("paving")) {
    return { url: "https://en.wikipedia.org/wiki/Tile", text: `${kwFmt.topic} material specifications` };
  }
  if (kw.includes("tap") || kw.includes("faucet") || kw.includes("plumbing") || kw.includes("shower")) {
    return { url: "https://en.wikipedia.org/wiki/Tap_(valve)", text: `${kwFmt.topic} plumbing standards` };
  }
  if (kw.includes("bathroom") || kw.includes("toilet") || kw.includes("seat") || kw.includes("tub")) {
    return { url: "https://en.wikipedia.org/wiki/Bathroom", text: `${kwFmt.topic} architectural guidelines` };
  }
  if (kw.includes("mouse") || kw.includes("gaming") || kw.includes("keyboard") || kw.includes("pc")) {
    return { url: "https://en.wikipedia.org/wiki/Computer_mouse", text: `${kwFmt.topic} hardware benchmarks` };
  }
  if (kw.includes("smart") || kw.includes("hub") || kw.includes("automation")) {
    return { url: "https://en.wikipedia.org/wiki/Home_automation", text: `${kwFmt.topic} protocol documentation` };
  }
  if (kw.includes("crypto") || kw.includes("stock") || kw.includes("invest") || kw.includes("capital")) {
    return { url: "https://en.wikipedia.org/wiki/Cryptocurrency", text: `${kwFmt.topic} market research` };
  }
  if (kw.includes("food") || kw.includes("dining") || kw.includes("chef") || kw.includes("coffee")) {
    return { url: "https://en.wikipedia.org/wiki/Culinary_arts", text: `${kwFmt.topic} culinary guides` };
  }
  if (kw.includes("fashion") || kw.includes("gala") || kw.includes("carpet") || kw.includes("style")) {
    return { url: "https://en.wikipedia.org/wiki/Haute_couture", text: `${kwFmt.topic} design archives` };
  }
  if (kw.includes("sleep") || kw.includes("health") || kw.includes("fitness") || kw.includes("wellness")) {
    return { url: "https://en.wikipedia.org/wiki/Circadian_rhythm", text: `${kwFmt.topic} wellness research` };
  }

  return { url: "https://en.wikipedia.org/wiki/Industrial_design", text: `${kwFmt.topic} technical reference` };
}

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

  const extRef = getExternalReferenceUrl(cleanKw);
  const catSlug = category || "life-style";
  const catName = catSlug.replace(/-/g, " ").toUpperCase();

  const internalRelatedOptions = [
    { title: "Bathroom Seat Ergonomics and Fitting", slug: "bathroom-seat" },
    { title: "Bathroom Cold Water Supply Taps", slug: "bathroom-cold-tap" },
    { title: "Smart Home Automation Protocol Hubs", slug: "smart-home-hub" },
    { title: "First-Principles Technology Feature", slug: "elon-musk" },
  ];
  const relArt = internalRelatedOptions[hashVal % internalRelatedOptions.length];

  // Dynamic Meta Excerpt Synthesis (Pools per domain token)
  let rawExcerptPool: string[] = [
    `An in-depth editorial evaluation of ${topicTitle}, exploring technical benchmarks, real-world utility, and market trends.`,
    `Analyzing current design innovations and performance standards of ${topicTitle} across residential and commercial settings.`,
    `A detailed editorial review of ${topicTitle}, covering material quality, structural specifications, and long-term durability metrics.`,
    `Examining the practical benefits, technical features, and routine maintenance protocols required for high-grade ${topicTitle}.`,
    `Exploring architectural integration, ergonomics, and material specifications for ${topicTitle} in modern interior spaces.`,
    `Comprehensive technical guide to ${topicTitle}, detailing manufacturing quality, installation standards, and lifetime resilience.`
  ];

  if (tokens.isCold && tokens.isTap) {
    rawExcerptPool = [
      `Operating under constant line pressure, bathroom cold water taps demand frost-resistant supply lines, anti-whistle valves, and low-flow aerators.`,
      `Evaluating cold water tap assemblies for bathrooms, focusing on brass body integrity, ceramic disc valves, and pressure control.`,
      `Technical specifications for bathroom cold taps, covering aerator flow rates, thread connections, and leak prevention protocols.`,
      `A complete operational overview of bathroom cold taps, analyzing water conservation features, valve lifespan, and installation care.`,
      `Exploring durability and flow velocity in bathroom cold taps, detailing non-corrosive cartridge design and structural sealing.`
    ];
  } else if (tokens.isHot && tokens.isTap) {
    rawExcerptPool = [
      `Instant water delivery and heat safety dictate bathroom hot tap performance, requiring thermostatic controls and anti-scald valves.`,
      `Technical analysis of bathroom hot taps, covering boiler integration, thermal insulation, and precise temperature regulation.`,
      `Evaluating safety features and heat dissipation in hot water taps, focusing on ceramic cartridges and scalding protection.`,
      `A comprehensive review of modern hot taps, detailing pressure balance valves, flow aerators, and energy-efficient water delivery.`,
      `Examining hot water tap installations, highlighting supply line heat ratings, internal valve seals, and spout insulation.`
    ];
  } else if (tokens.isBlack && tokens.isTap) {
    rawExcerptPool = [
      `Combining bold architectural contrast with electroplated PVD surface resilience, matte black taps require non-abrasive care and microfiber maintenance.`,
      `Technical guide to matte black bathroom taps, analyzing PVD coating adhesion, hard water mineral resistance, and finish upkeep.`,
      `Exploring design elegance and finish durability in matte black taps, detailing scratch-resistant layers and gentle cleaning care.`,
      `A detailed review of matte black tapware, covering electroplating standards, spout clearance, and long-term surface protection.`,
      `Assessing architectural matte black taps, focusing on corrosion resistance, neutral cleaning protocols, and valve performance.`
    ];
  } else if (tokens.isBathroom || tokens.isTiles) {
    rawExcerptPool = [
      `Comprehensive technical evaluation of ${topicTitle}, detailing porcelain density, slip resistance ratings, and installation standards.`,
      `Exploring material selection and surface durability for ${topicTitle}, covering installation guidelines, slip resistance, and maintenance.`,
      `An architectural review of ${topicTitle}, analyzing structural load capacity, substrate preparation, and moisture protection.`,
      `Detailed technical specification of ${topicTitle}, examining wear resilience, ceramic material density, and surface care standards.`,
      `Evaluating ${topicTitle} across modern interior design standards, highlighting grout seal integrity, tile density, and cleaning routines.`,
      `A comprehensive guide to ${topicTitle}, detailing slip ratings, thermal resistance, surface finishing, and long-term care protocols.`,
      `Analyzing spatial harmony and technical features of ${topicTitle}, focusing on substrate integrity, moisture control, and material density.`,
      `In-depth editorial report on ${topicTitle}, covering material selection benchmarks, installation specs, and routine maintenance care.`
    ];
  } else if (tokens.isGaming) {
    rawExcerptPool = [
      `High-performance gaming hardware demands sub-millisecond responsiveness, ergonomic shell design, optical tracking precision, and switch durability.`,
      `Technical analysis of gaming peripherals, examining sensor polling rates, optical switch debounce delay, and ergonomic weight balance.`,
      `Evaluating precision tracking and latency in modern gaming gear, detailing PTFE skate friction, DPI customization, and switch lifespan.`,
      `A comprehensive review of gaming hardware specifications, covering optical sensor accuracy, ergonomic grip, and signal stability.`,
      `Exploring competitive gaming peripherals, focusing on low-latency wireless transmission, switch actuation force, and shell integrity.`
    ];
  } else if (tokens.isSmartHome) {
    rawExcerptPool = [
      `Exploring smart home automation hubs with multi-protocol Matter and Thread antenna arrays, local rule execution engines, and zero-cloud security.`,
      `Technical breakdown of smart home automation hubs, covering mesh network range, local automation speed, and encryption protocols.`,
      `Evaluating smart home control centers, analyzing device interoperability, Thread radio coverage, and local event processing.`,
      `A complete guide to smart home automation hubs, detailing zero-cloud latency, multi-protocol bridges, and system security specs.`,
      `Examining local automation engines in smart hubs, focusing on Matter protocol support, sensor pairing speed, and network stability.`
    ];
  }

  const excerptHashSeed = Math.abs(hashVal * 31 + 7);
  const rawExcerpt = rawExcerptPool[excerptHashSeed % rawExcerptPool.length];
  const excerpt = formatMetaDescription(rawExcerpt, Math.abs(hashVal * 97 + 13));

  // Dynamic Headings Selection
  const h2_1_options = [
    `## ${kwTitle} Material Selection and Quality Standards`,
    `## Core Architectural Features of ${kwTitle}`,
    `## Understanding ${kwTitle} Engineering and Specifications`,
    `## Essential Composition and Standards for ${kwTitle}`,
    `## Design Versatility and Craftsmanship in ${kwTitle}`
  ];
  const h2_1 = h2_1_options[hashVal % h2_1_options.length];

  const h3_1_options = [
    `### ${kwTitle} Surface Finish Inspection`,
    `### Structural Tolerance and Load Verification`,
    `### Technical Specification Checklist`,
    `### Quality Assurance and Material Certification`
  ];
  const h3_1 = h3_1_options[(hashVal + 1) % h3_1_options.length];

  const h2_2_options = [
    `## Practical Utility and Everyday Performance`,
    `## Ergonomics and Spatial Integration of ${kwTitle}`,
    `## Operational Efficiency and Functional Design`,
    `## Practical Application and Real-World Use of ${kwTitle}`
  ];
  const h2_2 = h2_2_options[(hashVal + 2) % h2_2_options.length];

  const h3_2_options = [
    `### Spatial Alignment and Dimension Clearance`,
    `### Layout Optimization and Ergonomic Flow`,
    `### Aesthetic Harmony and Surface Finish Matching`
  ];
  const h3_2 = h3_2_options[(hashVal + 3) % h3_2_options.length];

  const h2_3_options = [
    `## Performance Benchmarks and Long-Term Durability`,
    `## Comparative Stress Testing and Material Strength`,
    `## Environmental Resilience and Lifetime Expectations`,
    `## Load Distribution and Resistance Standards`
  ];
  const h2_3 = h2_3_options[(hashVal + 4) % h2_3_options.length];

  const h3_3_options = [
    `### Thermal Cycling and Moisture Protection`,
    `### Accelerated Wear Testing Results`,
    `### Environmental Exposure and Seal Longevity`
  ];
  const h3_3 = h3_3_options[(hashVal + 5) % h3_3_options.length];

  const h2_4_options = [
    `## Routine Maintenance and Protective Care`,
    `## Cleaning Protocols and Surface Preservation`,
    `## Long-Term Care and Preventive Maintenance`
  ];
  const h2_4 = h2_4_options[(hashVal + 6) % h2_4_options.length];

  const h2_5_options = [
    `## Professional Installation Best Practices and Cost Value`,
    `## Substrate Preparation and Mounting Guidelines for ${kwTitle}`,
    `## Long-Term Investment Value and Warranty Assurance`
  ];
  const h2_5 = h2_5_options[(hashVal + 7) % h2_5_options.length];

  const paragraphs: string[] = [];

  // Intro Paragraphs (2 rich paragraphs - Includes Internal Link 1)
  const introVars1 = [
    `Evaluating the technical architecture, component craftsmanship, and practical utility of ${topicTitle} requires examining core operational parameters, material density, and surface longevity. Making an informed hardware or material selection ensures long-term service reliability, elevated aesthetic value, and seamless daily performance across residential or commercial environments.`,
    `Selecting high-grade ${topicTitle} plays a pivotal role in modern design, functional efficiency, and structural performance. Understanding key manufacturing standards, installation requirements, and long-term durability metrics enables homeowners and trade professionals to make well-founded investment decisions.`,
    `The modern approach to ${topicTitle} combines refined visual appeal with cutting-edge engineering principles. By prioritizing superior raw material selection and rigorous testing protocols, current market iterations deliver exceptional resistance to daily wear while enhancing spatial ergonomics.`,
    `Analyzing the technical specifications and practical benefits of ${topicTitle} highlights significant advancements in material formulation, surface sealants, and user-centric design. Selecting certified options guarantees optimal operational stability and lasting aesthetic harmony.`
  ];
  const introVars2 = [
    `Furthermore, comprehensive market developments in ${topicTitle} emphasize reduced maintenance overhead and superior environmental adaptability. Integrating advanced manufacturing methods ensures that components maintain dimensional accuracy, structural rigidity, and color stability even under challenging environmental exposure.`,
    `In addition to aesthetic elegance, certified ${topicTitle} undergoes stringent quality verification to satisfy international safety and performance benchmarks. Trade experts recommend evaluating load capacity, surface finish resilience, and installation clearance prior to final specification.`,
    `Architectural designers and engineering professionals consistently prioritize ${topicTitle} configurations that offer balanced functional performance and ease of maintenance within contemporary [${catName.toLowerCase()} living spaces](/category/${catSlug}). Detailed technical evaluation safeguards long-term capital investment while streamlining routine service protocols.`
  ];
  paragraphs.push(introVars1[hashVal % introVars1.length]);
  paragraphs.push(introVars2[(hashVal + 1) % introVars2.length]);

  // Section 1: H2_1 + 3 Body + H3_1 + 2 Body (Includes External Link)
  paragraphs.push(h2_1);
  const sec1P1 = [
    `Assessing the structural composition and material density of ${topicTitle} is essential for ensuring long-term resilience under continuous operational stress. Advanced manufacturing processes utilize high-purity raw materials and specialized heat treatments that prevent early material fatigue and surface degradation.`,
    `At the core of high-performance ${topicTitle} lies a commitment to material integrity and precision engineering. Incorporating dense composite layers and anti-corrosive treatments safeguards the assembly against environmental moisture, thermal expansion, and mechanical shock.`,
    `Quality craftsmanship in ${topicTitle} begins with rigorous raw material vetting and strict manufacturing tolerances. Utilizing premium grade alloys or high-fired ceramics guarantees uniform structural strength and superior resistance against surface scratching.`
  ];
  const sec1P2 = [
    `Selecting certified configurations for ${topicTitle} guarantees compliance with international safety and environmental benchmarks. Rigorous factory stress testing confirms consistent load distribution and structural integrity even under demanding commercial conditions. For verified industry benchmarks, inspect the [${extRef.text}](${extRef.url}).`,
    `Furthermore, opting for standardized ${topicTitle} ensures hassle-free compatibility with existing sub-structures and mounting hardware. Precision manufacturing eliminates dimensional variance, streamlining initial fitting and reducing overall labor overhead. Review verified [${extRef.text}](${extRef.url}) for detailed technical parameters.`,
    `Adhering to recognized industry standards during the manufacturing of ${topicTitle} mitigates risks of structural misalignment or premature wear. Verified material certifications, such as [${extRef.text}](${extRef.url}), provide trade installers with complete confidence in long-term field performance.`
  ];
  const sec1P3 = [
    `Engineered for demanding environment applications, modern ${topicTitle} incorporates specialized protective topcoats that repel chemical stains and moisture penetration. This structural barrier protects internal substrate layers from gradual erosion and micro-fractures over decades of active service.`,
    `In addition, raw material refinement in high-tier ${topicTitle} eliminates internal void pockets, resulting in maximum impact absorption and structural stability. Installers benefit from reduced material loss during cutting, shaping, and precision fitting.`
  ];
  paragraphs.push(sec1P1[hashVal % sec1P1.length]);
  paragraphs.push(sec1P2[(hashVal + 1) % sec1P2.length]);
  paragraphs.push(sec1P3[(hashVal + 2) % sec1P3.length]);

  paragraphs.push(h3_1);
  const sec1H3P1 = [
    `Prior to initial installation or assembly of ${topicTitle}, perform a thorough visual and dimensional inspection. Verifying surface levelness, edge alignment, and seal integrity prevents subtle installation flaws and guarantees seamless integration.`,
    `Before finalizing the placement of ${topicTitle}, inspect all contact surfaces and mounting points for micro-imperfections. Ensuring clean, debris-free sub-layers promotes optimal adhesion and prevents unneeded stress concentrations.`
  ];
  const sec1H3P2 = [
    `Conducting a comprehensive pre-assembly checklist for ${topicTitle} helps identify any structural clearance issues early. Checking component tolerances and fastener torque limits preserves warranty coverage and ensures long-term safety.`,
    `Careful preparation before fitting ${topicTitle} includes evaluating environmental humidity and substrate flatness. Achieving proper baseline conditions eliminates flex and guarantees rigid, durable installation.`
  ];
  paragraphs.push(sec1H3P1[(hashVal + 3) % sec1H3P1.length]);
  paragraphs.push(sec1H3P2[(hashVal + 4) % sec1H3P2.length]);

  // Section 2: H2_2 + 3 Body + H3_2 + 2 Body
  paragraphs.push(h2_2);
  const sec2P1 = [
    `User ergonomics and intuitive design shape the real-world efficiency of ${topicTitle}. Products engineered with user-centric contours reduce physical strain during daily interaction, enhancing precision and overall operational comfort across residential and commercial settings.`,
    `Integrating ${topicTitle} into existing layout schemes requires careful consideration of spatial proportions and visual balance. Modern options offer streamlined profiles that complement diverse architectural styles while maximizing functional space.`,
    `Practical usability remains a cornerstone of high-caliber ${topicTitle} design. Ergonomic contours combined with tactile responsiveness provide an intuitive user experience that elevates everyday utility.`
  ];
  const sec2P2 = [
    `Achieving seamless integration of ${topicTitle} within a broader interior or architectural framework demands attention to detail regarding color harmony, tactile textures, and clearance dimensions. Well-designed products blend effortless aesthetics with uncompromised utility.`,
    `When evaluating layout configurations for ${topicTitle}, trade professionals emphasize maintaining adequate operational clearance and accessible service access. Streamlined geometry ensures smooth movement and simplifies routine surface cleaning.`,
    `Modern design trends emphasize clean geometry and versatile finish options for ${topicTitle}. Whether deployed in minimalist contemporary environments or classic traditional spaces, well-engineered units enhance overall ambient value.`
  ];
  const sec2P3 = [
    `Furthermore, spatial harmony achieved with ${topicTitle} enhances property value by creating visual continuity across adjacent room transitions. High-quality finishes reflect light naturally, creating an open, expansive atmosphere.`,
    `Refined aesthetic finishes on ${topicTitle} resist fingerprinting and smudging, keeping surfaces visually immaculate with minimal daily effort. Versatile mounting options allow custom tailoring to match specific design layouts.`
  ];
  paragraphs.push(sec2P1[hashVal % sec2P1.length]);
  paragraphs.push(sec2P2[(hashVal + 1) % sec2P2.length]);
  paragraphs.push(sec2P3[(hashVal + 2) % sec2P3.length]);

  paragraphs.push(h3_2);
  const sec2H3P1 = [
    `Optimizing spatial clearances around ${topicTitle} guarantees comfortable daily operation and unhindered maintenance access. Architectural guidelines recommend measuring minimum boundary distances before securing permanent fasteners.`,
    `Proper alignment of ${topicTitle} within functional zones mitigates physical wear on adjacent fixtures. Precision layout planning prevents awkward corner overlaps and streamlines routine surface wiping.`
  ];
  const sec2H3P2 = [
    `Selecting complementary color palettes and surface textures for ${topicTitle} creates a unified aesthetic theme throughout the living space. Neutral undertones offer timeless appeal while supporting future decor modifications.`,
    `Combining textured or satin finishes on ${topicTitle} adds visual depth and tactile richness to interior spaces. Quality surface treatments maintain color vibrancy without fading under direct ambient lighting.`
  ];
  paragraphs.push(sec2H3P1[(hashVal + 3) % sec2H3P1.length]);
  paragraphs.push(sec2H3P2[(hashVal + 4) % sec2H3P2.length]);

  // Section 3: H2_3 + 3 Body + H3_3 + 2 Body
  paragraphs.push(h2_3);
  const sec3P1 = [
    `Comparative performance benchmarks demonstrate distinct advantages when adopting updated standards for ${topicTitle}. Refined engineering minimizes operational friction, optimizes resource consumption, and extends total service life compared to legacy alternatives.`,
    `Under rigorous accelerated life testing, high-caliber ${topicTitle} retains its structural form and surface finish despite repeated thermal cycling and mechanical load. This resilience translates directly into reduced replacement frequency and lower long-term cost.`,
    `Evaluating stress resistance metrics reveals that modern ${topicTitle} offers superior tensile strength and impact absorption. Specialized protective coatings protect underlying materials against discoloration and chemical staining.`
  ];
  const sec3P2 = [
    `Long-term field data confirms that investing in well-crafted ${topicTitle} yields significant dividends in maintenance savings and operational uptime. Robust construction safeguards internal mechanisms against degradation from environmental exposure.`,
    `Thermal stability testing confirms that ${topicTitle} maintains dimensional accuracy across wide temperature gradients. High structural stability prevents warping, joint cracking, or sealant separation over decades of continuous use.`,
    `By meeting stringent durability benchmarks, ${topicTitle} provides dependable performance under heavy daily traffic or high-frequency usage. Quality manufacturing guarantees that structural integrity remains intact throughout the product lifecycle.`
  ];
  const sec3P3 = [
    `Industrial grade stress testing validates that ${topicTitle} resists impact chipping and surface micro-cracking under heavy point loads. Dense internal matrix structures distribute mechanical forces evenly across the entire surface.`,
    `Environmental exposure evaluations highlight that high-tier ${topicTitle} prevents ultraviolet degradation and surface oxidation, maintaining factory-fresh luster across years of active service.`
  ];
  paragraphs.push(sec3P1[hashVal % sec3P1.length]);
  paragraphs.push(sec3P2[(hashVal + 1) % sec3P2.length]);
  paragraphs.push(sec3P3[(hashVal + 2) % sec3P3.length]);

  paragraphs.push(h3_3);
  const sec3H3P1 = [
    `Thermal shock resistance in ${topicTitle} prevents micro-fissure formation during rapid temperature shifts. High thermal endurance makes these units exceptionally reliable in demanding residential and commercial environments.`,
    `Moisture impermeability ratings confirm that ${topicTitle} inhibits sub-surface water pooling, safeguarding building subfloors against rot and mold cultivation.`
  ];
  const sec3H3P2 = [
    `Extended environmental exposure trials prove that protective topcoats on ${topicTitle} neutralize acidic and alkaline airborne pollutants. Surrounding materials remain protected against chemical degradation.`,
    `Rigorous wear cycle analysis demonstrates that high-grade ${topicTitle} preserves surface friction ratings over extensive usage cycles, guaranteeing consistent slip safety.`
  ];
  paragraphs.push(sec3H3P1[(hashVal + 3) % sec3H3P1.length]);
  paragraphs.push(sec3H3P2[(hashVal + 4) % sec3H3P2.length]);

  // Section 4: H2_4 + 3 Body
  paragraphs.push(h2_4);
  const sec4P1 = [
    `Establishing a regular cleaning schedule using mild, non-abrasive agents protects surface sealants and prevents corrosive mineral or grime buildup on ${topicTitle}. Promptly drying standing moisture preserves pristine surface luster.`,
    `To maintain the pristine condition of ${topicTitle}, avoid aggressive chemical cleaners, acidic sprays, or harsh scouring pads that strip protective coatings. Gentle microfiber care combined with neutral pH cleansers ensures the finish remains unblemished.`,
    `Preventative maintenance protocols for ${topicTitle} focus on routine surface cleaning and periodic seal inspections. Early removal of surface contaminants prevents stubborn staining and preserves physical finish clarity.`
  ];
  const sec4P2 = [
    `Conducting periodic structural inspections every six to twelve months allows early detection of minor seal wear or joint loosening on ${topicTitle}. Replacing worn gaskets or fasteners promptly protects surrounding building structures and maintains full warranty coverage.`,
    `Inspecting underlying mounting seals and hardware connections guarantees that ${topicTitle} operates at peak safety levels. Timely servicing prevents minor wear from expanding into costly structural repairs.`,
    `Adhering to manufacturer care guidelines guarantees that ${topicTitle} retains both its functional capabilities and high resale value. Simple preventative routines ensure reliable performance for years to come.`
  ];
  const sec4P3 = [
    `In addition, applying specialized protective seal conditioners every twelve to eighteen months reinforces original factory coatings on ${topicTitle}. Routine conditioning extends surface hydrophobic qualities and simplifies stain removal.`,
    `Documenting maintenance logs and service checks for ${topicTitle} supports warranty claims and demonstrates diligent property care during resale appraisals.`
  ];
  paragraphs.push(sec4P1[hashVal % sec4P1.length]);
  paragraphs.push(sec4P2[(hashVal + 1) % sec4P2.length]);
  paragraphs.push(sec4P3[(hashVal + 2) % sec4P3.length]);

  // Section 5: H2_5 + 3 Body
  paragraphs.push(h2_5);
  const sec5P1 = [
    `Proper substrate preparation and rigorous adherence to manufacturer mounting specs ensure optimal installation longevity for ${topicTitle}. Ensuring structural sub-layers are flat, clean, and load-certified prevents future flex and joint displacement.`,
    `Engaging certified trade professionals for fitting ${topicTitle} guarantees correct torque settings, seal placement, and expansion joint spacing. Professional execution protects full warranty benefits and eliminates post-installation rework.`
  ];
  const sec5P2 = [
    `Evaluating total cost of ownership reveals that investing in premium ${topicTitle} delivers superior financial value over time. Reduced service frequency and minimal replacement costs offset initial purchase price differentials within the first few years.`,
    `Furthermore, choosing standardized replacement components for ${topicTitle} guarantees easy sourcing and low labor overhead during future maintenance updates.`
  ];
  const sec5P3 = [
    `Ultimately, high-grade ${topicTitle} represents a strategic investment in structural quality and spatial elegance. Certified materials provide peace of mind while elevating overall property standards.`,
    `By combining precision engineering with timeless visual design, ${topicTitle} delivers enduring performance that satisfies demanding trade standards and elevated homeowner expectations.`
  ];
  paragraphs.push(sec5P1[hashVal % sec5P1.length]);
  paragraphs.push(sec5P2[(hashVal + 1) % sec5P2.length]);
  paragraphs.push(sec5P3[(hashVal + 2) % sec5P3.length]);

  // Conclusion Section (MUST STAY BEFORE FAQs - Includes Internal Link 2)
  paragraphs.push("## Conclusion and Summary");
  const conclusionVars1 = [
    `In conclusion, choosing high-quality ${topicTitle} relies on evaluating structural design, material craftsmanship, and practical utility. Consistent care, non-abrasive maintenance, and adherence to technical operating limits preserve peak performance and long-term durability.`,
    `Ultimately, investing in well-engineered ${topicTitle} delivers long-term durability, structural integrity, and superior spatial aesthetics. Proper care, surface protection, and timely maintenance ensure that your setup remains pristine and fully functional over years of regular use.`,
    `To summarize, the long-term success of any ${topicTitle} installation hinges on material selection, spatial ergonomics, and preventive upkeep. Following expert recommendations safeguards your investment and elevates the overall quality of your space.`,
    `In summary, selecting premium ${topicTitle} requires a balanced evaluation of material quality, installation precision, and maintenance routine. By adhering to recommended technical guidelines and routine inspection schedules, users can maximize product lifespan while maintaining optimal performance.`
  ];
  const conclusionVars2 = [
    `By prioritizing certified manufacturing standards, verified load capacities, and regular inspection protocols, trade professionals and homeowners can feel completely confident in their material selection. Quality craftsmanship combined with diligent care ensures that ${topicTitle} remains an outstanding asset for years to come.`,
    `Taking a comprehensive approach to selection, fitting, and upkeep guarantees that your ${topicTitle} installation maintains peak efficiency, aesthetic beauty, and structural safety throughout its extended lifecycle.`,
    `Ultimately, taking a comprehensive approach to selection, fitting, and upkeep ensures that your ${topicTitle} setup maintains peak efficiency and safety, working alongside [${relArt.title.toLowerCase()}](/${relArt.slug}) over an extended operational lifespan.`
  ];
  paragraphs.push(conclusionVars1[hashVal % conclusionVars1.length]);
  paragraphs.push(conclusionVars2[(hashVal + 1) % conclusionVars2.length]);

  // Dynamic FAQs Matrix
  const faqs = generateDynamicFaqs(topicTitle, tokens, hashVal);

  return { title, excerpt, paragraphs, faqs };
}

function generateDynamicFaqs(
  topicTitle: string,
  tokens: ReturnType<typeof extractKeywordSubTokens>,
  hashVal: number
): { question: string; answer: string }[] {
  let faqPool: { question: string; answer: string }[] = [];

  if (tokens.isTap || tokens.isCold || tokens.isHot || tokens.isBlack) {
    faqPool = [
      {
        question: `What water pressure range is optimal for ${topicTitle}?`,
        answer: `Most modern tap assemblies perform best between 1.5 and 3.0 bar line pressure, delivering steady flow rates without excessive splash.`
      },
      {
        question: `How do ceramic disc cartridges improve the operation of ${topicTitle}?`,
        answer: `Ceramic disc cartridges replace traditional rubber washers, providing smooth quarter-turn control and preventing frustrating drips or leaks.`
      },
      {
        question: `What routine cleaning prevents mineral buildup on ${topicTitle}?`,
        answer: `Wiping the fixture daily with a dry microfiber cloth prevents hard water limescale from etching into the outer surface finish.`
      },
      {
        question: `How do I maintain the finish on matte black or PVD coated ${topicTitle}?`,
        answer: `Avoid abrasive scrubbing pads and harsh chemical descalers; warm soapy water and soft cloths preserve electroplated and PVD coatings indefinitely.`
      },
      {
        question: `What should I do if aerator flow becomes restricted on ${topicTitle}?`,
        answer: `Unscrew the spout aerator screen, soak it in a vinegar solution to dissolve mineral deposits, and rinse thoroughly before reassembling.`
      },
      {
        question: `Are flexible hose connectors included with standard ${topicTitle} fittings?`,
        answer: `Most quality tap sets include braided stainless steel flexi-tails with standard female connectors for simplified plumbing installation.`
      },
      {
        question: `How does thermostatic control protect users of ${topicTitle}?`,
        answer: `Thermostatic valves automatically balance incoming hot and cold lines, maintaining constant output temperatures and eliminating scalding risk.`
      },
      {
        question: `What causes tap whistling or supply line noise in ${topicTitle}?`,
        answer: `High line pressure or loose internal valve washers typically cause acoustic vibrations, which can be resolved using pressure reducing valves.`
      }
    ];
  } else if (tokens.isTiles || tokens.isBathroom) {
    faqPool = [
      {
        question: `How does material density impact the durability of ${topicTitle}?`,
        answer: `Higher material density reduces porosity, preventing moisture absorption and ensuring the surface withstands heavy daily foot traffic without cracking.`
      },
      {
        question: `What slip resistance rating is recommended for ${topicTitle}?`,
        answer: `For wet zones like bathrooms or kitchens, look for a R10 or higher slip resistance rating to maintain safe traction under wet conditions.`
      },
      {
        question: `How frequently should protective sealant be applied to ${topicTitle}?`,
        answer: `Applying a high-grade penetrating sealant every 12 to 18 months protects grout lines and tile surfaces from deep discoloration and water ingress.`
      },
      {
        question: `Can ${topicTitle} be installed over existing subfloor heating systems?`,
        answer: `Yes, dense porcelain and ceramic materials conduct heat efficiently, making them an ideal surface choice for underfloor radiant heating setups.`
      },
      {
        question: `What is the optimal grout joint width when laying ${topicTitle}?`,
        answer: `Rectified edge tiles allow for tight 1.5mm to 2mm grout lines, whereas standard unrectified edges require a 3mm to 4mm joint for thermal expansion.`
      },
      {
        question: `How do I remove stubborn hard water stains from ${topicTitle}?`,
        answer: `Use a mild pH-neutral stone and tile cleaner combined with a soft microfiber pad, avoiding harsh acidic formulas that degrade protective finishes.`
      },
      {
        question: `What is the difference between glazed and unglazed ${topicTitle}?`,
        answer: `Glazed surfaces offer an extra liquid-impermeable protective layer, while unglazed options provide uniform color throughout the entire material body.`
      },
      {
        question: `How do I prevent grout line cracking around ${topicTitle}?`,
        answer: `Ensure the underlying substrate is completely rigid and dry before tiling, and use flexible polymer-modified grout to absorb subtle structural vibrations.`
      },
      {
        question: `Are ${topicTitle} suitable for both wall and floor applications?`,
        answer: `Floor-rated options can always be installed on walls, but lighter wall-specific tiles should not be used on floors due to lower impact resistance.`
      },
      {
        question: `How does water absorption rate affect outdoor or wet zone ${topicTitle}?`,
        answer: `Tiles with a water absorption rate under 0.5 percent resist frost damage and prevent internal moisture retention in high-humidity areas.`
      }
    ];
  } else if (tokens.isGaming) {
    faqPool = [
      {
        question: `What DPI and polling rate settings work best for ${topicTitle}?`,
        answer: `A polling rate of 1000Hz combined with 800 to 1600 DPI offers optimal tracking precision and minimal input delay for competitive gaming.`
      },
      {
        question: `How do optical switches differ from mechanical switches in ${topicTitle}?`,
        answer: `Optical switches use light beams to register clicks, eliminating physical contact debounce delay and drastically increasing switch longevity.`
      },
      {
        question: `What sensor technology powers precision tracking in ${topicTitle}?`,
        answer: `Modern high-end sensors feature 1-to-1 raw tracking with zero hardware acceleration, smoothing, or pixel skipping across high-speed swipes.`
      },
      {
        question: `How does overall weight affect user ergonomics in ${topicTitle}?`,
        answer: `Lightweight designs under 65 grams reduce wrist fatigue during extended gaming sessions, enabling faster reflex adjustments.`
      },
      {
        question: `What cable or wireless connection mode yields lowest latency for ${topicTitle}?`,
        answer: `Modern 2.4GHz wireless dongles match 1ms wired polling performance, offering unrestricted mouse movement without latency penalties.`
      }
    ];
  } else if (tokens.isSmartHome) {
    faqPool = [
      {
        question: `Does ${topicTitle} support local execution without active internet connection?`,
        answer: `Yes, local automation engines process routines directly on the hub hardware, ensuring instantaneous response even during internet outages.`
      },
      {
        question: `How does Matter protocol integration simplify pairing with ${topicTitle}?`,
        answer: `Matter establishes a universal connectivity standard, allowing seamless interoperability across Apple Home, Google Home, and Alexa ecosystems.`
      },
      {
        question: `What wireless range and mesh capability does ${topicTitle} offer?`,
        answer: `Using Thread radio mesh technology, each mains-powered node extends overall signal range and strengthens network stability.`
      },
      {
        question: `How are firmware updates managed across connected devices on ${topicTitle}?`,
        answer: `Background OTA updates patch security vulnerabilities and deliver new automation features without interrupting active routine schedules.`
      }
    ];
  } else {
    faqPool = [
      {
        question: `What key factors determine the overall build quality of ${topicTitle}?`,
        answer: `Raw material purity, precision manufacturing tolerances, and compliance with certified safety benchmarks define superior quality.`
      },
      {
        question: `How can I maximize the operational lifespan of ${topicTitle}?`,
        answer: `Adhere to manufacturer operating limits, conduct periodic inspections, and perform non-abrasive cleaning routines regularly.`
      },
      {
        question: `Are installation accessories and mounting hardware included with ${topicTitle}?`,
        answer: `Standard packages include essential mounting hardware, but verifying specific structural substrate requirements prior to fitting is recommended.`
      },
      {
        question: `How does modern engineering improve energy efficiency in ${topicTitle}?`,
        answer: `Updated architectural design reduces thermal loss, minimizes friction, and optimizes resource consumption compared to legacy models.`
      },
      {
        question: `What warranty coverage typically applies to certified ${topicTitle}?`,
        answer: `Leading manufacturers provide comprehensive multi-year warranties covering structural integrity and core component defects.`
      },
      {
        question: `How do I verify that ${topicTitle} meets local safety and environmental standards?`,
        answer: `Check for recognized certification stamps such as ISO, CE, or UL on product technical documentation and packaging labels.`
      }
    ];
  }

  const selectedFaqs: { question: string; answer: string }[] = [];
  const usedIndices = new Set<number>();
  const primeSeeds = [hashVal, hashVal * 13 + 3, hashVal * 29 + 11, hashVal * 47 + 17];

  for (let i = 0; i < 4; i++) {
    const seed = Math.abs(primeSeeds[i]);
    let idx = seed % faqPool.length;
    let tries = 0;
    while (usedIndices.has(idx) && tries < faqPool.length) {
      idx = (idx + 1) % faqPool.length;
      tries++;
    }
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      const item = faqPool[idx];
      selectedFaqs.push({
        question: item.question.replace(/&/g, "and"),
        answer: item.answer.replace(/&/g, "and")
      });
    }
  }

  return selectedFaqs;
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
  let hashSeed = cleanKw;

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
      const nextNum = maxNum + 1;
      slug = `${baseSlug}-${nextNum}`;
    }
  }
  hashSeed = `${cleanKw}-${slug}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

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
  const allExisting = getAllArticlesCombined();
  const existingTitles = new Set(allExisting.map((a) => a.title));
  const existingMetas = new Set(allExisting.map((a) => a.metaDescription));

  let attempt = 0;
  let title = "";
  let excerpt = "";
  let paragraphs: string[] = [];
  let faqs: { question: string; answer: string }[] = [];
  let currentHash = hashVal;

  while (attempt < 50) {
    const gen = generateDynamicDomainContent(cleanKw, category, currentHash);
    if (!existingTitles.has(gen.title) && !existingMetas.has(gen.excerpt)) {
      title = gen.title;
      excerpt = gen.excerpt;
      paragraphs = gen.paragraphs;
      faqs = gen.faqs;
      break;
    }
    attempt++;
    currentHash = getDeterministicHash(`${hashSeed}-attempt-${attempt}-${Math.random()}`);
  }

  if (!title) {
    const fallbackGen = generateDynamicDomainContent(cleanKw, category, hashVal + Date.now());
    title = fallbackGen.title;
    excerpt = fallbackGen.excerpt;
    paragraphs = fallbackGen.paragraphs;
    faqs = fallbackGen.faqs;
  }

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
  const kwFmt = formatNaturalKeyword(cleanKw);
  const category = item.category || inferCategoryFromKeyword(cleanKw);
  const slug = item.generatedArticleSlug || cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const hashVal = getDeterministicHash(`${cleanKw}-${slug}-${item.id}`);

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

export function sanitizeOrMigrateArticle(art: Article): Article {
  if (!art || !art.slug) return art;

  const cleanKw = art.slug.replace(/-\d+$/, "").replace(/-/g, " ");
  const kwFmt = formatNaturalKeyword(cleanKw);
  const tokens = extractKeywordSubTokens(cleanKw);
  const hashVal = getDeterministicHash(art.slug);

  // Check if FAQs are missing or using old static template
  const isOldFaq = !art.faqs || art.faqs.length === 0 || 
    art.faqs.some(f => f.question.includes("What key specifications should I check") || f.question.includes("Why is modern hardware superior"));

  if (isOldFaq) {
    art.faqs = generateDynamicFaqs(kwFmt.title, tokens, hashVal);
  }

  // Ensure Title is 55-60 chars and 0 ampersands
  if (!art.title || art.title.length < 55 || art.title.length > 60 || art.title.includes("&")) {
    art.title = formatSeoTitle(cleanKw, hashVal);
    art.metaTitle = `${art.title} | On Gravity Magazine`;
  }

  // Ensure Meta Description is strictly 140 chars and 0 ampersands
  if (!art.metaDescription || art.metaDescription.length !== 140 || art.metaDescription.includes("&")) {
    const rawMeta = art.excerpt || `Editorial report on ${kwFmt.title}`;
    art.metaDescription = formatMetaDescription(rawMeta, hashVal);
    art.excerpt = art.metaDescription;
  }

  // Clean ampersands from content paragraphs and ensure length is 1200-1500 words with links
  if (Array.isArray(art.content)) {
    art.content = art.content.map(p => p.replace(/&/g, "and"));
    const fullText = art.content.join(" ");
    const bodyWords = art.content.filter(p => !p.startsWith("#")).join(" ").split(/\s+/).filter(w => w.length > 0).length;
    const hasExternalLink = fullText.includes("http://") || fullText.includes("https://");

    if (bodyWords < 1100 || !hasExternalLink) {
      const gen = generateDynamicDomainContent(cleanKw, art.category || "life-style", hashVal);
      art.content = gen.paragraphs;
    }
  } else {
    const gen = generateDynamicDomainContent(cleanKw, art.category || "life-style", hashVal);
    art.content = gen.paragraphs;
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
}
