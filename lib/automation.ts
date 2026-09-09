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

const CACHE_VERSION_FILE = "on_gravity_articles_cache_v12.json";

function loadCacheFromDisk(): Article[] {
  if (typeof window !== "undefined") return [];
  try {
    const cacheFile = "/tmp/" + CACHE_VERSION_FILE;
    const req = eval("require");
    const fsMod = req("fs");
    if (fsMod && fsMod.existsSync(cacheFile)) {
      const data = fsMod.readFileSync(cacheFile, "utf-8");
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
    const cacheFile = "/tmp/" + CACHE_VERSION_FILE;
    const req = eval("require");
    const fsMod = req("fs");
    if (fsMod) {
      fsMod.writeFileSync(cacheFile, JSON.stringify(articles.slice(0, 100)), "utf-8");
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
// STRICT 55-60 CHAR SEO TITLE GENERATOR
// ----------------------------------------------------

function getDomainKey(kw: string): string {
  const lower = kw.toLowerCase();
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
  const clean = rawKeyword.replace(/&/g, "and").trim();
  let kwWords = clean.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  if (kwWords.length >= 55 && kwWords.length <= 60) {
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
      return candidate;
    }
  }

  const needed = 57 - kwWords.length;
  for (let offset = 0; offset <= 3; offset++) {
    const tryLengths = [needed + offset, needed - offset];
    for (const len of tryLengths) {
      if (PHRASES_BY_LEN[len]) {
        const candidate = kwWords + PHRASES_BY_LEN[len];
        if (candidate.length >= 55 && candidate.length <= 60) {
          return candidate;
        }
      }
    }
  }

  return (kwWords + ": Technical Performance and System Craftsmanship").slice(0, 57);
}

// ----------------------------------------------------
// SHORT HEADINGS & HIGHLY INFORMATIVE PARAGRAPH ENGINE
// ----------------------------------------------------

const SHORT_H2_MAP: Record<string, string[]> = {
  gaming: [
    "## Optical Sensor Precision and 1:1 Tracking",
    "## 2.4GHz Wireless Latency and Polling Rates",
    "## Ergonomic Weight and Grip Dynamics",
    "## Optical Switches and Debounce Care",
    "## Virgin-Grade PTFE Skate Maintenance"
  ],
  cold_tap: [
    "## Water Line Pressure and Aerator Flow",
    "## Ceramic Disc Cartridges and Anti-Whistle",
    "## Under-Sink Hose and Valve Connections",
    "## Winter Frost Protection and Pipe Care",
    "## Aerator Scale Cleaning and Vinegar Care"
  ],
  hot_tap: [
    "## Thermostatic Anti-Scald Safety Valves",
    "## Boiler Tank Pressure and Instant Delivery",
    "## Thermal Expansion and Relief Engineering",
    "## Braided Stainless Hose Connections"
  ],
  black_tap: [
    "## PVD Matte Finish and Hard Water Protection",
    "## Non-Abrasive Cleaning and Microfiber Care",
    "## Solid Brass Anti-Corrosion Engineering",
    "## Basin Spout Height and Vessel Clearance"
  ],
  plumbing: [
    "## Water Line Pressure and Aerator Flow Rates",
    "## Ceramic Disc Valve Sealing and Cartridges",
    "## Under-Sink Isolation Valve Setup",
    "## Leak Prevention and Gasket Seals"
  ],
  smarthome: [
    "## Matter and Thread Wireless Antennas",
    "## Zero-Cloud Local Rule Execution",
    "## IoT Network Encryption and Range",
    "## Multi-Sensor Automation Triggers"
  ],
  crypto: [
    "## Venture Capital and Liquidity Trends",
    "## Smart Contract Security Architecture",
    "## Macroeconomic Asset Allocation",
    "## Zero-Knowledge Cryptography Models"
  ],
  food: [
    "## Farm-to-Table Zero-Waste Culinary Prep",
    "## Michelin Sourcing and Plating Aesthetics",
    "## Artisanal Coffee Extraction Pressure",
    "## Organic Ingredient Storage Rules"
  ],
  fashion: [
    "## Met Gala Haute Couture and Silhouettes",
    "## Red Carpet Runway Craftsmanship",
    "## Sustainable Silk and Vintage Archival Care",
    "## Celebrity Style and Designer Trends"
  ],
  general: [
    "## Structural Engineering and Material Quality",
    "## Real-World Usability and Ergonomics",
    "## Performance Benchmarks and Service Life",
    "## Maintenance Protocols and Best Practices"
  ]
};

const SHORT_H3_MAP: Record<string, string[]> = {
  gaming: ["### DPI Sensitivity and Lift-Off Distance", "### Dongle Placement and Signal Range"],
  cold_tap: ["### Aerator Screen Cleaning Steps", "### Shutoff Valve Adjustment Guide"],
  hot_tap: ["### Thermostatic Valve Calibration", "### Relief Valve Safety Checks"],
  black_tap: ["### Microfiber Drying Routine", "### Deck Plate Sealing and Gaskets"],
  plumbing: ["### Cartridge Replacement Steps", "### Pressure Relief Valve Checks"],
  smarthome: ["### Thread Border Router Setup", "### Local Automation Logic"],
  crypto: ["### Security Audit Verification", "### Liquidity Pool Dynamics"],
  food: ["### Extraction Pressure Benchmarks", "### Plating Precision Methods"],
  fashion: ["### Atelier Craftsmanship Rules", "### Archival Fabric Preservation"],
  general: ["### System Inspection Checklist", "### Routine Service Schedules"]
};

function generateDynamicDomainContent(keyword: string, category: string, hashVal: number): { title: string; excerpt: string; paragraphs: string[]; faqs: { question: string; answer: string }[] } {
  const kwFmt = formatNaturalKeyword(keyword);
  const tokens = extractKeywordSubTokens(keyword);
  const title = formatSeoTitle(keyword, hashVal);
  const cleanKw = keyword.trim();
  const domainKey = getDomainKey(cleanKw);

  const h2List = SHORT_H2_MAP[domainKey] || SHORT_H2_MAP.general;
  const h3List = SHORT_H3_MAP[domainKey] || SHORT_H3_MAP.general;

  let excerptRaw = `An in-depth editorial evaluation of ${kwFmt.topic}, exploring technical benchmarks, real-world utility, and market trends.`;
  if (tokens.isGaming) {
    excerptRaw = `High-performance gaming mice demand sub-millisecond wireless responsiveness, ultra-lightweight shell ergonomics, and optical tracking precision.`;
  } else if (tokens.isCold && tokens.isTap) {
    excerptRaw = `Operating under constant line pressure, bathroom cold water taps demand frost-resistant supply lines, anti-whistle valves, and low-flow aerators.`;
  } else if (tokens.isHot && tokens.isTap) {
    excerptRaw = `Engineered for thermal expansion resilience and anti-scald safety, instant hot water taps combine boiler integration with precise temperature control.`;
  } else if (tokens.isBlack && tokens.isTap) {
    excerptRaw = `Combining bold architectural contrast with electroplated PVD surface resilience, matte black taps require non-abrasive care and microfiber maintenance.`;
  } else if (tokens.isSmartHome) {
    excerptRaw = `Exploring smart home hubs with multi-protocol Matter and Thread antenna arrays, local rule execution engines, and zero-cloud-latency security.`;
  }

  const excerpt = formatMetaDescription(excerptRaw);

  const paragraphs: string[] = [];

  // Paragraph 1: Rich Comprehensive Intro
  paragraphs.push(`Evaluating the technical architecture, component craftsmanship, and practical utility of ${kwFmt.topic} requires examining core operational specifications, maintenance requirements, and user ergonomics. Making an informed hardware selection ensures long-term service reliability, high efficiency, and seamless daily performance.`);

  if (tokens.isCold && tokens.isTap) {
    paragraphs.push(h2List[0]);
    paragraphs.push(`Standard domestic water lines operate between 40 and 60 PSI of static pressure. High-grade bathroom cold water taps incorporate low-flow aerators that inject air into the stream, creating a full, splash-free wash pattern while maintaining an efficient flow rate of 1.2 to 1.5 gallons per minute (GPM).`);
    paragraphs.push(`Over months of regular use, dissolved minerals like calcium and magnesium carbonate accumulate inside the aerator wire mesh. This scale causes side-spraying, uneven flow, or reduced pressure. Cleaning the aerator is simple: unscrew the spout housing, soak the mesh screen in warm white vinegar for 30 minutes to dissolve mineral deposits, and rinse thoroughly before reinstalling.`);
    
    paragraphs.push(h3List[0] || "### Aerator Screen Cleaning Steps");
    paragraphs.push(`Always verify that the rubber aerator washer is properly aligned inside the spout threading during reassembly. Hand-tighten the housing firmly to prevent slow perimeter drips while operating under full line pressure.`);

    paragraphs.push(h2List[1]);
    paragraphs.push(`Modern cold taps feature quarter-turn ceramic disc cartridges engineered with high-hardness alumina ceramic plates. As the tap handle turns, the polished ceramic plates slide past each other, opening or closing the fluid passage instantly without physical rubber washer compression.`);
    paragraphs.push(`High-pitched whistling noises during tap operation usually indicate water velocity turbulence across a partially opened ceramic disc or a vibrating shutoff valve under high line pressure. Adjusting the under-sink shutoff valve or replacing worn internal cartridge seals eliminates acoustic vibration immediately.`);

    paragraphs.push(h2List[2]);
    paragraphs.push(`Connecting under-sink plumbing correctly prevents hidden water leaks inside vanity cabinets. Cold water taps connect to isolation shutoff valves using 3/8-inch female compression flexible braided stainless steel supply lines. Hand-tighten coupling nuts first, then apply a quarter turn with an adjustable wrench to seal without damaging internal rubber O-rings.`);
    paragraphs.push(`Positioning a catch bucket beneath shutoff valves during cartridge replacement prevents residual line water from spilling onto wooden cabinet floors, protecting vanity structures from moisture damage.`);

    paragraphs.push(h2List[3]);
    paragraphs.push(`Cold water pipes routed along exterior uninsulated walls face freezing risks during severe winter cold snaps. Water expanding as it freezes inside metallic pipes can rupture joints or crack valve bodies. Installing foam pipe insulation sleeves along exposed cold supply lines provides essential thermal protection.`);
    paragraphs.push(`During sub-zero weather snaps, opening vanity cabinet doors allows ambient room heat to reach under-sink plumbing. Leaving cold taps running at a microscopic trickle maintains continuous fluid motion, preventing ice crystals from locking the line solid.`);

  } else if (tokens.isBlack && tokens.isTap) {
    paragraphs.push(h2List[0]);
    paragraphs.push(`Matte black taps deliver striking architectural contrast and modern visual appeal to contemporary bathrooms. Producing a resilient matte black surface requires Physical Vapor Deposition (PVD) electroplating, where titanium or zirconium particles bond atomically to solid brass in a vacuum chamber.`);
    paragraphs.push(`Hard water minerals represent the main maintenance challenge for dark fixtures, as white calcium spots show clearly against matte surfaces. Avoid cleaning matte black taps with acidic descalers, bleach, or aggressive chemical sprays that can strip the protective clear coat and turn black surfaces dull or cloudy.`);

    paragraphs.push(h3List[0] || "### Microfiber Drying Routine");
    paragraphs.push(`Establishing a quick daily drying routine preserves the pristine matte look. Wiping the handle and spout dry with a soft microfiber cloth after each use removes standing water droplets before minerals can dry into permanent rings.`);

    paragraphs.push(h2List[1]);
    paragraphs.push(`Clean matte black fixtures weekly using warm water mixed with a few drops of mild liquid dish soap. Gently wipe down the faucet spout and base using a non-abrasive microfiber towel or soft sponge, then rinse thoroughly with fresh water and buff dry immediately.`);
    paragraphs.push(`Never scrub matte black taps with abrasive green scouring pads, steel wool, or hard bristle brushes. Micro-scratches caused by abrasive cleaning strip the matte PVD sheen, exposing raw metal beneath to air and moisture.`);

    paragraphs.push(h2List[2]);
    paragraphs.push(`Beneath the matte exterior, high-end taps feature lead-free solid brass valve bodies. Solid brass offers outstanding corrosion resistance against chlorinated municipal water and withstands heavy internal line pressures over decades of daily family use.`);
    paragraphs.push(`Lead-free brass waterways ensure that cold and hot water passing through the fixture remains pure, clean, and free from metallic taste or harmful lead leaching.`);

    paragraphs.push(h2List[3]);
    paragraphs.push(`Selecting proper spout height and reach prevents water splashing over countertop rims. For standard undermount basins, a spout height of 4 to 6 inches provides comfortable hand-washing space while containing water spray inside the sink.`);
    paragraphs.push(`When pairing a matte black tap with a tall freestanding vessel sink, select a tall vessel tap offering 9 to 11 inches of spout clearance. Position the spout so water drops directly over the drain opening.`);

  } else if (tokens.isGaming) {
    paragraphs.push(h2List[0]);
    paragraphs.push(`High-performance gaming mice combine ultra-lightweight shell ergonomics with pixel-perfect optical tracking and sub-millisecond wireless responsiveness. Selecting a gaming mouse requires evaluating sensor architecture, switch durability, mouse weight, and glide dynamics.`);
    paragraphs.push(`Modern optical sensors like the PixArt 3395 capture thousands of surface images per second using infrared LED illumination, translating physical mouse movement into cursor movement with 1:1 precision. Advanced sensors eliminate hardware smoothing, angle snapping, and acceleration.`);

    paragraphs.push(h3List[0] || "### DPI Sensitivity and Lift-Off Distance");
    paragraphs.push(`While manufacturers advertise extreme sensitivity figures up to 30,000 DPI, competitive esports players prefer 800 or 1600 DPI. Lower DPI combined with low in-game sensitivity provides superior control for precise crosshair adjustments in competitive shooter titles.`);

    paragraphs.push(h2List[1]);
    paragraphs.push(`Modern 2.4GHz wireless gaming mice deliver latency equal to or faster than traditional wired mice. Frequency-hopping wireless protocols transmit data packets every 1 millisecond at standard 1000Hz polling rates.`);
    paragraphs.push(`To prevent wireless signal interference from Wi-Fi routers, place the USB wireless dongle within 20cm of your mousepad using the included extension cable. High-polling modes (2000Hz to 8000Hz) further reduce input delay down to 0.125ms for ultra-smooth motion on high-refresh-rate 240Hz monitors.`);

    paragraphs.push(h2List[2]);
    paragraphs.push(`Mouse weight directly affects wrist stamina and aiming velocity during intense gaming sessions. Ultra-lightweight mice weighing under 60 grams reduce movement inertia, allowing faster flick-shots and effortless direction changes without wrist fatigue.`);
    paragraphs.push(`Match mouse shape to your grip style: palm grip players benefit from ergonomic contoured shells supporting the entire hand, claw grip gamers prefer medium hump profiles for palm contact, and fingertip users require compact symmetrical mice.`);

    paragraphs.push(h2List[3]);
    paragraphs.push(`Optical mouse switches use infrared light beams for actuation rather than physical metal contacts. This eliminates mechanical wear and prevents double-clicking issues while executing clicks in under 0.2 milliseconds.`);
    paragraphs.push(`Virgin-grade PTFE (Teflon) skates on the mouse underside ensure frictionless glide across cloth or glass pads. Wiping PTFE feet periodically with isopropyl alcohol removes dust and maintains smooth tracking motion.`);

  } else {
    paragraphs.push(h2List[0]);
    paragraphs.push(`Evaluating ${cleanKw} requires examining component craftsmanship, structural design, user ergonomics, and long-term operational performance. Selecting high-caliber hardware guarantees reliable service, efficiency, and overall satisfaction.`);
    paragraphs.push(`High-quality manufacturing materials form the foundation of dependable engineering. Premium brass, stainless alloys, and reinforced polymers prevent physical degradation and mechanical wear under continuous daily use.`);

    paragraphs.push(h3List[0] || "### System Inspection Checklist");
    paragraphs.push(`Proper material selection ensures resistance against environmental stress, temperature fluctuations, and surface friction, protecting hardware investments for years to come.`);

    paragraphs.push(h2List[1]);
    paragraphs.push(`User ergonomics and intuitive design shape real-world operational efficiency. Products engineered with user-centric controls reduce physical strain, enhance precision, and streamline daily routines.`);
    paragraphs.push(`Testing hardware under practical conditions highlights key performance trade-offs between compact sizing, power efficiency, and long-term comfort, helping buyers select ideal configurations.`);

    paragraphs.push(h2List[2]);
    paragraphs.push(`Comparing modern engineering benchmarks against legacy standards demonstrates substantial gains in energy efficiency, speed, and durability. Advanced manufacturing techniques reduce maintenance overhead while optimizing performance.`);
    paragraphs.push(`Adhering to recommended operating limits and load specifications prevents premature component fatigue, maintaining consistent output throughout the product lifecycle.`);

    paragraphs.push(h2List[3]);
    paragraphs.push(`Routine maintenance and preventative inspections preserve peak functionality. Inspecting key wear points every few months, applying appropriate lubricants, and replacing worn seals promptly protects manufacturer warranties.`);
    paragraphs.push(`Following structured care protocols extends equipment service life, protects internal components, and guarantees smooth, trouble-free utility.`);
  }

  // Add Conclusion and Summary before FAQs
  paragraphs.push("## Conclusion and Summary");
  if (tokens.isCold && tokens.isTap) {
    paragraphs.push(`Investing in a well-engineered bathroom cold tap equipped with ceramic disc cartridges and low-flow aerators ensures efficient water control and reliable performance. Following routine aerator maintenance and winter pipe care protects your plumbing setup for years to come.`);
  } else if (tokens.isBlack && tokens.isTap) {
    paragraphs.push(`Matte black bathroom taps offer striking visual style when cared for with proper non-abrasive methods. Simple microfiber cleaning and post-use drying keep PVD electroplated finishes looking pristine and free from mineral spots.`);
  } else if (tokens.isGaming) {
    paragraphs.push(`Selecting the ideal gaming mouse relies on balancing optical tracking precision, wireless response times, and ergonomic weight balance. Choosing durable optical switches and high-grade PTFE skates ensures smooth, competitive gameplay.`);
  } else {
    paragraphs.push(`Choosing high-quality ${kwFmt.topic} depends on evaluating structural design, material craftsmanship, and practical utility. Consistent care and adherence to technical operating limits preserve peak performance and long-term durability.`);
  }

  let faqs = [
    { question: `What key specifications should I check when choosing ${kwFmt.topic}?`, answer: `Focus on build material quality, technical compatibility, energy or fluid efficiency, and manufacturer warranty coverage before making your selection.` },
    { question: `How do I maintain peak performance for ${kwFmt.topic} over time?`, answer: `Follow non-abrasive cleaning protocols, conduct routine inspections every few months, and replace worn internal seals or components promptly.` },
    { question: `Why is modern hardware superior to legacy alternatives for ${kwFmt.topic}?`, answer: `Modern iterations incorporate advanced materials and refined engineering, offering higher efficiency, longer durability, and smoother operation.` },
    { question: `Where can I find additional technical guides for ${kwFmt.topic}?`, answer: `Consult manufacturer documentation, specialized technical reviews, and editorial dispatches on On Gravity Magazine for expert advice.` }
  ];

  if (tokens.isGaming) {
    faqs = [
      { question: `What DPI and polling rate is optimal for competitive gaming mice?`, answer: `For FPS and competitive gaming, 1600 DPI combined with a 1000Hz to 4000Hz polling rate provides optimal tracking accuracy and minimal input latency.` },
      { question: `How do I maintain and clean PTFE skates on a gaming mouse?`, answer: `Wipe PTFE skates gently with an isopropyl alcohol swab to remove dust and oils, ensuring frictionless glide across cloth or glass mousepads.` },
      { question: `Are optical switches better than traditional mechanical mouse switches?`, answer: `Optical switches use infrared light beams for actuation, eliminating physical contact wear and preventing double-clicking issues over millions of clicks.` }
    ];
  } else if (tokens.isCold && tokens.isTap) {
    faqs = [
      { question: `Why is water flow restricted in a bathroom cold tap?`, answer: `Mineral scale buildup in the aerator screen or a partially closed under-sink isolation valve is usually responsible. Clean aerator mesh in vinegar to restore full flow.` },
      { question: `What standard flow rate (GPM) should a cold tap have?`, answer: `Water-saving bathroom cold taps operate between 1.2 and 1.5 GPM, delivering comfortable pressure while conserving household water.` },
      { question: `How do I stop a bathroom cold tap from making a whistling noise?`, answer: `Whistling is caused by high water pressure vibrating worn ceramic discs. Replace the internal cartridge and check isolation valve adjustments.` }
    ];
  } else if (tokens.isBlack && tokens.isTap) {
    faqs = [
      { question: `How do I clean matte black taps without damaging the finish?`, answer: `Clean with warm water and mild dish soap using a soft microfiber cloth. Avoid bleach, acidic descalers, or scouring pads that strip electroplated PVD layers.` },
      { question: `Do matte black taps show water spots and limescale easily?`, answer: `Hard water can leave white mineral spots. Drying the tap with a soft cloth after use prevents mineral buildup and keeps the finish pristine.` }
    ];
  }

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
  const cleanKw = item.keyword;
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
