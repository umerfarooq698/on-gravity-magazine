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
// SINGLE GEMINI ARTICLE GENERATION PROMPT (EXACT USER SPECIFICATION)
// ============================================================================
export const GEMINI_ARTICLE_PROMPT = `Write a complete, original, publication-ready article of 1100–1400 words.

Requirements:

* Create a clear, engaging title relevant to the topic.
* Start with a short introduction that speaks directly to the reader.
* Focus on genuinely useful information that helps the reader understand, compare, decide, solve a problem, or take action.
* Organize the article with relevant H2 and H3 headings.
* Build the structure specifically around the submitted topic. Do not reuse the same headings or article structure for every topic.
* Every section must cover a new point. Do not explain the same idea again in another section.
* Do not repeat facts, examples, advice, definitions, conclusions, sentences, or arguments just to increase word count.
* Before producing the final output, check the entire article for overlapping ideas and remove or merge repetitive sections.
* Naturally use the supplied primary and secondary keywords where contextually relevant.
* Use keywords in suitable headings when natural, but never force them.
* Do not follow a fixed keyword-density percentage. Prioritize natural language, topical relevance, and readability.
* Write like a knowledgeable local person explaining the subject to a friend.
* Keep the tone conversational, informative, natural, and professional.
* Vary sentence length, paragraph length, wording, and sentence structure.
* Use mostly well-developed paragraphs.
* Use bullet points only when they genuinely make information easier to understand, such as features, steps, comparisons, checks, or specifications.
* Do not overload the article with lists.
* Keep paragraphs focused and avoid filler.
* Do not mention AI or the content-generation process.
* Do not include meta commentary or discuss how the article was written.
* Do not include phrases such as “as an AI” or “this article.”
* Do not use unnatural search-related phrases as headings or filler.
* Add 3–4 relevant FAQs at the end.
* Keep each FAQ answer short, direct, useful, and non-repetitive.
* FAQs must answer useful questions that were not already fully answered in the main content.

Important originality rule:

Treat every generated article as a new piece of content. Do not copy wording, paragraph patterns, introductions, conclusions, heading sequences, examples, or explanations from previously generated articles. Even when topics are similar, approach each article according to its specific subject and reader intent.

Final quality check before output:

1. Remove repeated ideas.
2. Remove filler added only to reach the word count.
3. Merge sections that discuss substantially the same point.
4. Make sure each heading introduces distinct information.
5. Make sure the article reads naturally from beginning to end.
6. Return only the finished publishable article.`;

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

  if (kwWords.length >= 55 && kwWords.length <= 60 && !kwWords.includes("&")) {
    return kwWords;
  }
  if (kwWords.length > 60) {
    let sub = kwWords.slice(0, 58);
    const spaceIdx = sub.lastIndexOf(" ");
    if (spaceIdx >= 55) return sub.slice(0, spaceIdx);
    return sub.slice(0, 57);
  }

  const suffixes = [
    ": Essential Specifications, Engineering and Overview",
    ": Complete Architectural Design and Quality Guide",
    ": Operational Efficiency, Specs and System Guide",
    ": Practical Application, Standards and Overview",
    ": Material Quality, Durability and System Review"
  ];
  const s = suffixes[hashVal % suffixes.length];
  const candidate = (kwWords + s).replace(/&/g, "and");
  if (candidate.length >= 55 && candidate.length <= 60) return candidate;

  return (kwWords + ": Complete Architectural Specs and System Review").slice(0, 57).replace(/&/g, "and");
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

// ============================================================================
// CALL GEMINI API WITH ONLY THE EXACT USER-REQUESTED PROMPT
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
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.5-flash"
  ];

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
                  text: `${GEMINI_ARTICLE_PROMPT}\n\nSubmitted Keyword / Topic: "${keyword}"`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText && typeof candidateText === "string") {
        return parseGeminiMarkdownArticle(candidateText, keyword);
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
  let paragraphs: string[] = [];
  let faqs: { question: string; answer: string }[] = [];

  let inFaqs = false;
  let currentFaqQ = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!title && (line.startsWith("# ") || line.startsWith("Title:"))) {
      title = line.replace(/^#\s+|^Title:\s*/i, "").replace(/&/g, "and");
      continue;
    }

    if (line.toLowerCase().includes("frequently asked questions") || line.toLowerCase() === "## faqs" || line.toLowerCase().startsWith("## faq")) {
      inFaqs = true;
      continue;
    }

    if (inFaqs) {
      if (line.startsWith("### ") || line.startsWith("**Q:") || line.startsWith("Q:")) {
        if (currentFaqQ && lines[i + 1]) {
          const ans = lines[i + 1].replace(/^\*\*A:\*\*\s*|^A:\s*/, "").replace(/&/g, "and");
          faqs.push({ question: currentFaqQ.replace(/&/g, "and"), answer: ans });
          currentFaqQ = "";
        }
        currentFaqQ = line.replace(/^###\s+|^#+\s+|\*\*Q:\*\*\s*|^Q:\s*/, "");
      } else if (currentFaqQ && !line.startsWith("###")) {
        faqs.push({ question: currentFaqQ.replace(/&/g, "and"), answer: line.replace(/^\*\*A:\*\*\s*|^A:\s*/, "").replace(/&/g, "and") });
        currentFaqQ = "";
      }
      continue;
    }

    paragraphs.push(line.replace(/&/g, "and"));
  }

  if (!title) {
    const kwFmt = formatNaturalKeyword(keyword);
    title = `Essential Guide to ${kwFmt.title}`;
  }

  const firstBodyPara = paragraphs.find(p => !p.startsWith("#")) || `An in-depth editorial guide to ${keyword}.`;
  const excerpt = firstBodyPara.replace(/&/g, "and").slice(0, 160);

  return { title, excerpt, paragraphs, faqs: faqs.length > 0 ? faqs : undefined };
}

function generateTopicFallbackArticle(keyword: string, hashVal: number) {
  const kwFmt = formatNaturalKeyword(keyword);
  const topicTitle = kwFmt.topic.replace(/&/g, "and");
  const category = inferCategoryFromKeyword(keyword);

  let title = `Everything You Need to Know About ${kwFmt.title}`;
  let excerpt = `An in-depth editorial guide exploring ${topicTitle}, featuring practical advice, performance benchmarks, and expert recommendations.`;
  let paragraphs: string[] = [];
  let faqs: { question: string; answer: string }[] = [];

  const isLaptop = keyword.toLowerCase().includes("laptop") || keyword.toLowerCase().includes("computer") || keyword.toLowerCase().includes("pc");
  const isToy = keyword.toLowerCase().includes("toy") || keyword.toLowerCase().includes("kid") || keyword.toLowerCase().includes("child");

  if (isLaptop) {
    title = `Navigating ${kwFmt.title}: Performance, Specifications, and Buyer Guide`;
    excerpt = `A comprehensive overview of ${topicTitle}, evaluating processing power, display quality, real-world battery life, and overall value.`;
    paragraphs = [
      `Navigating the modern computing landscape for ${topicTitle} can quickly get confusing with all the technical jargon, hardware specs, and configuration options available today. Whether you are upgrading your daily work machine, picking a laptop for school, or looking for high-performance portability, getting clear guidance makes your buying decision effortless.`,
      `## Processing Power and Thermal Architecture`,
      `Performance starts with the core silicon under the hood. Modern laptops balance processor clock speeds with efficient thermal design to ensure high performance without loud fan noise or overheating. Pay close attention to multi-core benchmarks and thermal dissipation headroom when evaluating your daily workload.`,
      `### Key Hardware Specifications to Evaluate`,
      `* System RAM: 16GB is the modern baseline for smooth multitasking and future-proof productivity.`,
      `* SSD Storage: High-speed NVMe drives ensure fast boot times and instant application launches.`,
      `* Display Fidelity: IPS or OLED panels offer vibrant color accuracy and wide viewing angles.`,
      `* Battery Efficiency: Look for high watt-hour ratings that sustain full working days off the wall charger.`,
      `## Real-World Usability: Keyboard, Trackpad, and Build Quality`,
      `Specs on paper don't tell the full story—tactile feel and daily usability matter just as much. A well-engineered chassis constructed from aluminum or reinforced alloys provides durability against daily wear, while key travel and trackpad responsiveness directly affect typing comfort over long working sessions.`,
      `## Final Verdict: Finding Your Ideal Configuration`,
      `Ultimately, choosing the right ${topicTitle} comes down to balancing processing needs, battery portability, and display quality. Investing in a balanced setup ensures reliable long-term performance and seamless software execution.`
    ];
    faqs = [
      { question: `What is the most important spec when buying ${topicTitle}?`, answer: `Focus on RAM (at least 16GB) and high-speed NVMe SSD storage for snappy everyday multitasking.` },
      { question: `How long should a good ${topicTitle} last?`, answer: `With proper care and modern hardware specs, a quality laptop typically delivers 4 to 6 years of reliable service.` },
      { question: `Is battery life more important than raw speed?`, answer: `For portability and mobile work, efficient power management is often far more useful than peak benchmark scores.` }
    ];
  } else if (isToy) {
    title = `Choosing the Best ${kwFmt.title}: Safety, Engagement, and Growth`;
    excerpt = `A practical guide for parents and gift-givers on choosing ${topicTitle}, focusing on child safety, age-appropriate fun, and creative development.`;
    paragraphs = [
      `Selecting the right ${topicTitle} for growing children can feel overwhelming given the endless choices on store shelves today. Beyond bright colors and entertainment value, parents and caregivers want options that encourage imagination, support developmental milestones, and stand up to energetic play.`,
      `## Developmental Benefits and Open-Ended Play`,
      `The best playthings engage a child's natural curiosity and problem-solving skills. Open-ended designs that allow kids to build, create, or imagine storylines foster independent thinking and fine motor development far better than single-function electronic novelties.`,
      `### Essential Safety and Quality Checks`,
      `* Non-Toxic Materials: Ensure paints, plastics, and fabrics are certified BPA-free and lead-safe.`,
      `* Age-Appropriate Design: Verify age ratings to avoid small parts that pose choking hazards for toddlers.`,
      `* Structural Durability: Look for sturdy seams, reinforced joints, and impact-resistant materials.`,
      `* Easy Maintenance: Machine-washable fabrics and wipeable surfaces simplify routine cleanup.`,
      `## Balancing Fun and Educational Value`,
      `Finding the sweet spot between entertainment and learning keeps children coming back to play day after day. Look for toys that encourage active physical movement, social sharing with friends, or hands-on tactile exploration.`,
      `## Final Summary: Making a Thoughtful Choice`,
      `Investing in high-quality, safe, and engaging options for ${topicTitle} creates lasting childhood memories while supporting healthy growth and creative exploration.`
    ];
    faqs = [
      { question: `How do I know if ${topicTitle} is safe for my child's age?`, answer: `Always check manufacturer age labels and safety certification marks (such as ASTM or CE) on the packaging.` },
      { question: `Are non-electronic options better for child development?`, answer: `Simple, non-electronic items encourage active imagination and open-ended creative play.` },
      { question: `How do I clean and sanitize ${topicTitle} safely?`, answer: `Wipe hard plastic surfaces with mild soap and warm water; washable plush items can be laundered on gentle cycle.` }
    ];
  } else {
    paragraphs = [
      `If you've been exploring ${topicTitle} lately, having reliable and practical information helps you navigate choices with total confidence. In this guide, we break down what really matters—from core features and practical applications to long-term quality and user recommendations.`,
      `## Understanding the Essentials of ${topicTitle}`,
      `Quality starts at the foundation. Before committing to a purchase or project, take time to evaluate key specifications, material craftsmanship, and overall functional utility. Focusing on proven quality ensures long-term satisfaction.`,
      `### Key Features to Prioritize`,
      `* Quality Craftsmanship: Ensures long-term reliability and resistance against early wear.`,
      `* Practical Ergonomics: Designed for intuitive, seamless integration into your daily routine.`,
      `* Ease of Upkeep: Simple care guidelines ensure effortless long-term performance.`,
      `## Comparing Options for Your Specific Needs`,
      `Finding the ideal match isn't just about choosing top specifications—it's about selecting what aligns best with your lifestyle, space, and personal preferences. Compare models and read user feedback before deciding.`,
      `## Final Recommendation`,
      `By balancing verified craftsmanship, real-world utility, and practical maintenance, you can choose ${topicTitle} with total confidence and enjoy reliable value for years to come.`
    ];
    faqs = [
      { question: `What should I consider first when evaluating ${topicTitle}?`, answer: `Focus on core build quality, user feedback, and how well it fits your specific daily requirements.` },
      { question: `How do I maintain ${topicTitle} long-term?`, answer: `Follow basic manufacturer guidelines and conduct periodic checks to prevent wear before it starts.` },
      { question: `Is premium quality worth the extra cost for ${topicTitle}?`, answer: `Investing in higher craftsmanship typically yields superior durability, performance, and peace of mind.` }
    ];
  }

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
