const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const QUEUE_FILE = path.join(__dirname, '..', 'keywords_queue.json');
const ARTICLES_FILE = path.join(__dirname, '..', 'data', 'articles.ts');

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1j0pU46wUz-k676ypU4rzXgaF6ybqjaq5thgMnnW_2v4/export?format=csv";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || Buffer.from("QVEuQWI4Uk42SVZwanJURFJwMGcyck9tcEtMdUFfX1ExeXRPdnkyRlpyVVhiWU1zaUl2VlE=", "base64").toString("utf-8");
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "FLqjxtnt8-eGS9mpiB3-GMOvHhVAqT4_lQxyslYLO0A";

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash"
];

function getDeterministicHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function autoClassifyCategory(keyword) {
  const k = keyword.toLowerCase().trim();
  // Food & Beverage
  if (/\b(food|recipe|recipes|cookie|cookies|cake|chocolate|taco|tacos|coffee|brew|brewing|french press|espresso|tea|dish|dishes|restaurant|burger|snack|dining|culinary|chef|bakery|bake|meal|eating|drink|drinks|bars)\b/i.test(k)) return "food";
  // Celebrity & Pop Culture
  if (/\b(movie|movies|film|actor|actress|singer|celebrity|husband|wife|instagram|net worth|star|dating|hollywood|cinema|song|album|revival|band|concert|grammy|oscar|treaty oak|delevingne|hackman|ridley|gadot|jones)\b/i.test(k)) return "celebrity";
  // Tech & Software
  if (/\b(tech|technology|ai|software|hardware|salary|code|developer|laptop|laptops|computer|phone|gadget|gadgets|app|apps|cyber|crypto|robot|radiology tech)\b/i.test(k)) return "tech";
  // Health & Wellness
  if (/\b(due date|due date calculator|pregnancy|pregnant|health|wellness|fitness|workout|medical|doctor|therapy|diet|weight|symptom|symptoms|remedy|remedies|muscle|vitamin|disease|sativa|indica|cbd|cannabis|strain)\b/i.test(k)) return "health";
  // Business & Finance
  if (/\b(business|finance|stock|stocks|market|markets|investing|investment|startup|money|bank|banking|insurance|crypto market|economy|corporate|enterprise|rent|appartments|apartments)\b/i.test(k)) return "business";
  // News & Public Guides & Events
  if (/\b(news|rage room|event|events|calendar|breaking|politics|court|crime|police|city|government|election|law|legal|social security|security office|dmv|passport office)\b/i.test(k)) return "news";
  // Lifestyle / Home / Decor / Maintenance
  return "life-style";
}

const VALID_CATEGORIES = new Set(["celebrity", "life-style", "tech", "health", "business", "news", "food"]);

function normalizeCategory(cat) {
  const c = (cat || "life-style").toLowerCase().trim().replace(/\s+/g, '-');
  // Map common misspellings / variants to valid site slugs
  if (c === "lifestyle") return "life-style";
  if (VALID_CATEGORIES.has(c)) return c;
  return "life-style";
}

function parseCsvLines(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
    const keyword = parts[0];
    const explicitCat = parts[1];
    if (keyword && keyword.length > 1) {
      const rawCategory = (explicitCat && explicitCat.length > 1)
        ? explicitCat.toLowerCase().replace(/\s+/g, '-')
        : autoClassifyCategory(keyword);
      items.push({ keyword, category: normalizeCategory(rawCategory) });
    }
  }
  return items;
}

async function syncWithGoogleSheet(queueData) {
  try {
    console.log("Syncing queue with Google Sheet live CSV...");
    const res = await fetch(GOOGLE_SHEET_CSV_URL);
    if (res.ok) {
      const csvText = await res.text();
      const sheetItems = parseCsvLines(csvText);
      const existingKeywords = new Set(queueData.map(q => q.keyword.toLowerCase().trim()));

      const BANNED_KEYWORDS = new Set(["sativa vs indica", "e-hentai", "e hentai", "hentai"]);
      let addedCount = 0;
      for (const item of sheetItems) {
        const cleanKw = item.keyword.toLowerCase().trim();
        if (BANNED_KEYWORDS.has(cleanKw)) continue;
        if (!existingKeywords.has(cleanKw)) {
          queueData.push({
            id: `kw-${queueData.length + 1}`,
            keyword: item.keyword,
            category: normalizeCategory(item.category),
            status: 'pending'
          });
          existingKeywords.add(cleanKw);
          addedCount++;
        }
      }
      if (addedCount > 0) {
        console.log(`Synced ${addedCount} new keyword(s) from Google Sheet into queue!`);
      } else {
        console.log("No new keywords found in Google Sheet.");
      }
    }
  } catch (err) {
    console.warn("Could not sync Google Sheet (using current queue):", err.message);
  }
  return queueData;
}

function extractCountFromKeyword(keyword) {
  const match = keyword.match(/\b(\d+)\s+(best|top|ways|tips|reasons|models|items|choices|features|laptops|toys|products|ideas|things|tricks)\b/i) ||
                keyword.match(/\b(best|top|ways|tips|reasons|models|items|choices|features|laptops|toys|products|ideas|things|tricks)\s+(\d+)\b/i);
  if (match) {
    const num = parseInt(match[1] || match[2], 10);
    if (num >= 2 && num <= 15) return num;
  }
  return null;
}

function formatSeoTitle(rawKeyword, hashVal = 0) {
  const clean = rawKeyword.replace(/&/g, "and").replace(/\s+/g, " ").trim();
  const words = clean.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  const kwWords = words.join(" ");

  const highCtrTemplates = [
    `${kwWords} Ergonomics and Studio Lighting Setup`,
    `Why ${kwWords} Precision Matters for Daily Use`,
    `${kwWords} Performance Specs and Workstation Uses`,
    `An Honest Breakdown of ${kwWords} Key Features`,
    `${kwWords} Aesthetics, Lumens and Salon Workflows`,
    `How to Choose the Right ${kwWords} for Your Space`,
    `${kwWords} Technical Specifications and Real Review`,
    `Is ${kwWords} Worth It? Performance Checks Tested`,
    `Essential ${kwWords} Feature Analysis and Specs`,
    `${kwWords} Placement Guidelines and Studio Comfort`
  ];

  let selected = highCtrTemplates[Math.abs(hashVal) % highCtrTemplates.length].replace(/&/g, "and");
  if (selected.length < 55) {
    selected = `${kwWords} Design Ideas and Architectural Styling Guide`;
  }
  if (selected.length > 60) {
    selected = selected.substring(0, 57) + "...";
  }
  return selected;
}

async function fetchUnsplashImage(keyword, category, usedPhotoIds) {
  const cleanKw = keyword.trim().toLowerCase().replace(/&/g, "and");
  const slugSig = slugify(cleanKw);
  const hashVal = getDeterministicHash(`${cleanKw}-${Date.now()}`);

  const words = cleanKw.split(/\s+/).filter((w) => w.length > 2 && w !== "and" && w !== "for" && w !== "the");
  const firstWord = words[0] || cleanKw;
  const secondWord = words[1] || "";
  const firstTwoWords = `${firstWord} ${secondWord}`.trim();

  const searchQueries = [
    cleanKw,
    firstTwoWords,
    firstWord
  ];

  if (category === "celebrity") searchQueries.push(`${firstTwoWords} hollywood cinema`, "hollywood red carpet premiere", "cinema star portrait");
  if (category === "food") searchQueries.push(`${firstTwoWords} food dish`, "gourmet food dish cuisine", "delicious restaurant dish");
  if (category === "tech") searchQueries.push(`${firstTwoWords} technology`, "modern workstation hardware technology", "computer tech device");
  if (category === "life-style") searchQueries.push(`${firstTwoWords} interior decor`, "modern home interior design decor", "luxury room lifestyle");
  if (category === "health") searchQueries.push(`${firstTwoWords} wellness`, "health exercise fitness wellness", "healthy lifestyle workout");
  if (category === "business") searchQueries.push(`${firstTwoWords} business`, "corporate finance office business", "modern office workspace");
  if (category === "news") searchQueries.push(`${firstTwoWords} news`, "global news journalism press event", "city architecture building");

  if (UNSPLASH_ACCESS_KEY) {
    for (const q of searchQueries) {
      if (!q || q.length < 2) continue;
      try {
        const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=15&page=1&orientation=landscape&order_by=relevant&client_id=${UNSPLASH_ACCESS_KEY}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const unused = data.results.filter(p => p.id && !usedPhotoIds.has(p.id));
            const candidateList = unused.length > 0 ? unused : data.results;

            // Score each candidate photo for genuine topic and keyword relevance
            const scoredCandidates = candidateList.map(p => {
              const textContent = ((p.description || "") + " " + (p.alt_description || "") + " " + (p.tags ? p.tags.map(t => t.title).join(" ") : "")).toLowerCase();
              let score = 0;
              // Exact phrase match
              if (textContent.includes(cleanKw)) score += 100;
              // Individual keyword word matches
              words.forEach(w => {
                if (textContent.includes(w)) score += 30;
              });
              // Prefer landscape photos with descriptive metadata
              if (p.description || p.alt_description) score += 10;
              return { photo: p, score, textContent };
            });

            // Sort by highest keyword relevance score first
            scoredCandidates.sort((a, b) => b.score - a.score);
            const bestMatch = scoredCandidates[0]?.photo;

            if (bestMatch) {
              const rawUrl = bestMatch.urls?.regular || bestMatch.urls?.full;
              const photoId = bestMatch.id;
              if (rawUrl && photoId) {
                usedPhotoIds.add(photoId);
                const uniqueUrl = rawUrl.includes("?") ? `${rawUrl}&sig=${slugSig}_${Date.now()}` : `${rawUrl}?sig=${slugSig}_${Date.now()}`;
                const altText = (bestMatch.alt_description || bestMatch.description || `Editorial photography for ${cleanKw}`).replace(/&/g, "and");
                const finalAlt = altText.length > 10 ? `${altText} - ${cleanKw}` : `High-resolution editorial photography illustrating ${cleanKw}`;
                console.log(`Matched highest-scored keyword relevant photo for query "${q}": ${photoId} (Score: ${scoredCandidates[0].score}, Alt: "${altText}")`);
                return {
                  url: uniqueUrl,
                  caption: (bestMatch.description || bestMatch.alt_description || `Editorial photograph for ${cleanKw} on On Gravity Magazine.`).replace(/&/g, "and"),
                  alt: finalAlt.replace(/&/g, "and")
                };
              }
            }
          }
        }
      } catch (e) {
        console.warn(`Unsplash API fetch failed for query "${q}":`, e.message);
      }
    }
  }

  const categoryPhotoPools = {
    "life-style": ["photo-1584622650111-993a426fbf0a", "photo-1507652313519-d4e9174996dd", "photo-1552321554-5fefe8c9ef14", "photo-1620626011761-996317b8d101"],
    "tech": ["photo-1615663245857-ac93bb7c39e7", "photo-1593359677879-a4bb92f829d1", "photo-1517336714731-489689fd1ca8"],
    "health": ["photo-1506126613408-eca07ce68773", "photo-1540420773420-3366772f4999", "photo-1571019613454-1cb2f99b2d8b"],
    "celebrity": ["photo-1509631179647-0177331693ae", "photo-1492684223066-81342ee5ff30", "photo-1515886657613-9f3515b0c78f"],
    "business": ["photo-1621416894569-0f39ed31d247", "photo-1486406146926-c627a92ad1ab"],
    "food": ["photo-1555396273-367ea4eb4db5", "photo-1504674900247-0877df9cc836"],
    "news": ["photo-1470071459604-3b5ec3a7fe05", "photo-1585829365295-ab7cd400c167"]
  };
  const pool = categoryPhotoPools[category] || categoryPhotoPools["life-style"];
  const selectedPhotoId = pool[hashVal % pool.length];
  usedPhotoIds.add(selectedPhotoId);
  return {
    url: `https://images.unsplash.com/${selectedPhotoId}?auto=format&fit=crop&w=1200&q=80&sig=${slugSig}_${Date.now()}`,
    caption: `Editorial photograph highlighting ${cleanKw}.`,
    alt: `High resolution photograph of ${cleanKw} - ${category} feature`
  };
}

function getExistingPublishedSlugs(articlesFileContent) {
  const slugs = new Set();
  const matches = articlesFileContent.match(/"slug":\s*"([^"]+)"/g) || [];
  for (const m of matches) {
    const match = m.match(/"slug":\s*"([^"]+)"/);
    if (match && match[1]) {
      slugs.add(match[1].toLowerCase().trim());
    }
  }
  return slugs;
}

function validateAndCleanInternalLinks(paragraphs, validSlugsSet) {
  return paragraphs.map(p => {
    let cleaned = p.replace(/—/g, ", ").replace(/--/g, ", ");
    return cleaned.replace(/\[([^\]]+)\]\(\/([a-z0-9-]+)\)/gi, (match, anchorText, targetSlug) => {
      const cleanSlug = targetSlug.toLowerCase().trim();
      if (validSlugsSet.has(cleanSlug)) {
        return `[${anchorText}](/${cleanSlug})`;
      } else {
        console.warn(`Stripping non-existent internal link: [${anchorText}](/${cleanSlug})`);
        return anchorText;
      }
    });
  });
}

function getSystemPrompt(validSlugsSet) {
  const validSlugsList = Array.from(validSlugsSet).map(s => `/${s}`).join(", ");
  return `You are an expert SEO editor and senior investigative journalist for On Gravity Magazine.

Your objective is to write a comprehensive, 100% unique, authoritative, highly SEO-optimized, publication-ready INFORMATIONAL article based on the submitted keyword/topic.

SEARCH INTENT & INFORMATIONAL CONTENT MANDATE (CRITICAL):
- The content MUST strictly serve INFORMATIONAL intent: educate the reader, provide structured insights, deep explanations, objective analysis, practical tips, and expert perspectives.
- AVOID shallow summaries, promotional copy, or sales pitches.
- Answer the reader's core questions thoroughly:
  * Address "What is it?", "Why does it matter?", "How does it work?", and "Who benefits most?".
  * Provide practical, step-by-step guidance, actionable advice, best practices, and common mistakes to avoid.
  * Establish On Gravity Magazine as a trustworthy, authoritative reference meeting high Google E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) standards.

STRICT ARTICLE STRUCTURE & PARAGRAPH RHYTHM INSTRUCTIONS:

1. TARGET ARTICLE WORD COUNT (CRITICAL):
   - Total article length MUST be between 1,000 and 1,200 words.
   - Provide deep, well-developed, comprehensive text to hit this word count naturally without fluff.

2. DYNAMIC PARAGRAPH LENGTH VARIATION (CRITICAL):
   - DO NOT write uniform 3-line paragraphs throughout the article!
   - Vary paragraph lengths continuously: alternate between short 1-2 sentence punchy statements, medium 3-4 sentence analytical paragraphs, and longer 5-6 sentence detailed deep dives.
   - This creates a natural human-like visual and reading rhythm down the page.

3. DYNAMIC SECTION LAYOUT VARIATIONS:
   - Avoid repetitive heading patterns across articles. Vary layout per section:
     * Section A: H2 heading followed directly by 2 to 3 paragraphs of varying lengths with NO H3 subheadings.
     * Section B: H2 heading with an introductory paragraph, followed by 2 distinct H3 subheadings (with 1 short and 1 long paragraph each).
     * Section C: H2 heading with a detailed paragraph, followed by a bulleted list of key features/takeaways, concluded by a short summary paragraph.
     * Section D: H2 heading with 1 analytical paragraph and a single punchy takeaway sentence.

4. CLICKABLE SEO TITLE GENERATION (STRICT 55-60 CHARACTERS):
   - Create an irresistible, click-worthy title starting directly with "# ".
   - CRITICAL LENGTH RULE: The title MUST be strictly between 55 and 60 characters long (excluding "# ").
   - Incorporate the primary keyword naturally ANYWHERE in the title.
   - DO NOT include any year (e.g. DO NOT write "2026" or "2025").
   - Replace any "&" with "and".

5. STRICT 140-CHARACTER SEO META SUMMARY / EXCERPT:
   - Immediately after title, output "EXCERPT: [Write a 100% unique, human-sounding, high-CTR meta description of EXACTLY 135 to 140 characters summarizing the topic]".
   - CRITICAL LENGTH MANDATE: The meta description MUST be strictly between 135 and 140 characters long.
   - STRICT BANNED HYPHENS & DASHES: DO NOT use hyphens or dashes ("-", "—") anywhere inside the meta description. Use spaces or commas instead.
   - STRICT BANNED AI WORDS (NEVER USE): DO NOT use generic AI buzzwords such as "Discover", "Explore", "Learn more", "Dive into", "Uncover", or "In this article".
   - Write like a professional senior journalist providing direct, compelling facts and value.

6. HEADING NUMBERING & HIERARCHY (CRITICAL):
   - HEADING NUMBERING RULE: For standard informational articles, do NOT use numbered headings such as "1.", "2.", or "3.". Numbered headings should ONLY be used when the target topic or keyword is naturally count-based (e.g., "5 Best Laptops").
   - H2 INTRODUCTION RULE: Every main-content H2 section MUST begin with a complete, useful introductory paragraph before any H3 subheadings, bullet points, tables, or lists appear. Do NOT place an H3 immediately after an H2!

7. CONCLUSION & FAQS:
   - Include a dedicated "## Conclusion" section.
   - Include a dedicated "## Frequently Asked Questions" section with 2-3 FAQs formatted as:
     ### Q: [Short Question]
     A: [Short Answer]

8. NATURAL INTERNAL LINKING (STRICT OPTIONAL & VALIDATION):
   - Internal linking is STRICTLY OPTIONAL.
   - ONLY include an internal link if a phrase in your content naturally and contextually relates to one of these ALREADY PUBLISHED slugs: [${validSlugsList}].
   - NEVER force unrelated keywords or sentences into the article just to create a link.
   - If there is no genuine, natural topical fit with any published slug, output ZERO (0) internal links. Quality and natural reading flow are top priority.
   - DO NOT invent or link to any other non-existent slugs!

9. STRICT BANNED PUNCTUATION (CRITICAL):
   - NEVER use em-dashes ("—") or double dashes ("--") anywhere in the title, excerpt, headings, or content paragraphs. Use standard commas, parentheses, or periods instead.

Start directly with # [Generated Title].`;
}

async function generateArticleWithGemini(keyword, validSlugsSet) {
  const count = extractCountFromKeyword(keyword);
  let listicleInstruction = "";
  if (count) {
    listicleInstruction = `\n\nCRITICAL COUNT INSTRUCTION: The keyword asks for "${count}" items. You MUST create exactly ${count} main item headings (using "## 1. [Item]", "## 2. [Item]" up to "## ${count}. [Item]") with H3 sub-sections under each item and write full, informative paragraphs under EACH section to reach 1,000 to 1,200 words!`;
  }

  const promptText = `${getSystemPrompt(validSlugsSet)}${listicleInstruction}\n\nSubmitted Keyword / Topic: "${keyword}"\n[Target Word Count: 1000-1200 words]`;

  for (let attempt = 1; attempt <= 6; attempt++) {
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Calling Gemini API model: ${modelName} (Attempt ${attempt}/6)...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.75, topP: 0.95 }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 200) {
            console.log(`Successfully generated article with Gemini API model ${modelName}! Length: ${text.length}`);
            const parsed = parseGeminiMarkdown(text, keyword);
            parsed.paragraphs = validateAndCleanInternalLinks(parsed.paragraphs, validSlugsSet);
            return parsed;
          }
        } else {
          const errJson = await response.json();
          console.warn(`Gemini model ${modelName} HTTP ${response.status}:`, errJson.error?.message);
        }
      } catch (err) {
        console.warn(`Gemini model ${modelName} error:`, err.message);
      }
    }
    const delayMs = attempt <= 2 ? 10000 : 20000;
    console.log(`All models failed on attempt ${attempt}/6. Waiting ${delayMs/1000}s before retry...`);
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error("Gemini API call failed across all retries.");
}

function parseGeminiMarkdown(rawText, keyword) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let title = '';
  let excerpt = '';
  let paragraphs = [];
  let faqs = [];
  let inFaqs = false;
  let currentFaqQ = '';

  for (const line of lines) {
    if (!title && (line.startsWith('# ') || line.toLowerCase().startsWith('title:'))) {
      title = line.replace(/^#\s+|^Title:\s*/i, '').replace(/&/g, 'and').trim();
      continue;
    }
    if (!excerpt && (line.toLowerCase().startsWith('excerpt:') || line.toLowerCase().startsWith('summary:') || line.toLowerCase().startsWith('meta:'))) {
      excerpt = line.replace(/^excerpt:|^summary:|^meta:\s*/i, '').replace(/&/g, 'and').trim();
      continue;
    }
    if (line.toLowerCase().includes('frequently asked questions') || line.toLowerCase() === '## faqs' || line.toLowerCase().startsWith('## faq')) {
      inFaqs = true;
      continue;
    }

    if (inFaqs) {
      if (line.startsWith('### Q:') || line.startsWith('Q:') || line.startsWith('**Q:')) {
        currentFaqQ = line.replace(/^###\s*Q:|^Q:|\*\*Q:\*\*/i, '').replace(/\*\*$/g, '').trim();
      } else if ((line.startsWith('A:') || line.startsWith('**A:')) && currentFaqQ) {
        const ans = line.replace(/^A:|\*\*A:\*\*/i, '').replace(/\*\*$/g, '').trim();
        faqs.push({ question: currentFaqQ, answer: ans });
        currentFaqQ = '';
      }
    } else {
      if (line.startsWith('# ') || line.toLowerCase().startsWith('excerpt:')) continue;
      paragraphs.push(line.replace(/&/g, 'and'));
    }
  }

  if (!title) title = formatSeoTitle(keyword);
  if (title.length < 50 || title.length > 65) {
    title = formatSeoTitle(keyword, getDeterministicHash(keyword));
  }
  if (!excerpt) {
    excerpt = `Comprehensive overview on ${keyword.replace(/&/g, 'and')}, detailing expert tips, structural insights, and modern styling solutions.`;
  }
  
  // Format excerpt strictly according to rules (no AI words, no hyphens, ~140 chars)
  excerpt = excerpt.replace(/^(discover|explore|learn more about|learn all about|dive into|uncover|in this article)\s+/i, "");
  excerpt = excerpt.replace(/\b(discover|explore|learn more)\b/gi, "review");
  excerpt = excerpt.replace(/[-—–]+/g, " ").replace(/\s+/g, " ").trim();
  if (excerpt.length > 140) {
    const sub = excerpt.slice(0, 137);
    const lastSpace = sub.lastIndexOf(" ");
    excerpt = (lastSpace > 100 ? sub.slice(0, lastSpace) : sub) + "...";
  }

  return { title, excerpt, paragraphs, faqs };
}

async function runAutoPublish() {
  console.log("=== ON GRAVITY CLOUD AUTO-PUBLISHER ===");

  const AUTO_PUBLISH_ENABLED = true; // Master switch: enabled for 24-hour cadence (1 article per day)
  if (!AUTO_PUBLISH_ENABLED && process.env.FORCE_PUBLISH !== 'true') {
    console.log("[PAUSED] Auto-publishing is currently PAUSED/OFF. No new articles will be published. Exiting peacefully.");
    process.exit(0);
  }

  let queueData = [];
  if (fs.existsSync(QUEUE_FILE)) {
    queueData = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
  }

  // 1. Sync live keywords from Google Sheet
  queueData = await syncWithGoogleSheet(queueData);

  // 2. Strict 24-Hour Cadence Guard (at least 23 hours gap between consecutive publishes)
  const nowUtc = new Date();
  const isForce = process.env.FORCE_PUBLISH === 'true';

  if (!isForce) {
    const sortedPublished = queueData
      .filter(q => q.status === 'published' && q.publishedAt)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    if (sortedPublished.length > 0) {
      const lastPublishedTime = new Date(sortedPublished[0].publishedAt).getTime();
      const elapsedMinutes = (nowUtc.getTime() - lastPublishedTime) / (1000 * 60);
      const MIN_INTERVAL_MINUTES = 1380; // 23 hours gap for 24-hour cadence (1 article per day)
      if (elapsedMinutes < MIN_INTERVAL_MINUTES) {
        const elapsedHours = (elapsedMinutes / 60).toFixed(1);
        const remainingHours = ((MIN_INTERVAL_MINUTES - elapsedMinutes) / 60).toFixed(1);
        console.log(`[SCHEDULE GATING] Only ${elapsedHours} hours have passed since the last published article ("${sortedPublished[0].keyword}"). Next article will publish in ~${remainingHours} hours (24-hour cadence). Exiting peacefully.`);
        process.exit(0);
      }
    }
  }

  const pendingIndex = queueData.findIndex(item => item.status === 'pending');
  if (pendingIndex === -1) {
    console.log("No pending keywords remaining in queue. Auto-publisher finished!");
    process.exit(0);
  }

  const item = queueData[pendingIndex];
  console.log(`Selected keyword: "${item.keyword}" (Category: ${item.category})`);

  // 3. Read articles file & generate article
  const articlesFileContent = fs.readFileSync(ARTICLES_FILE, 'utf-8');
  const usedPhotoIds = new Set();
  const photoMatches = articlesFileContent.match(/photo-([a-zA-Z0-9-]+)/g) || [];
  photoMatches.forEach(m => usedPhotoIds.add(m.replace('photo-', '')));

  const validSlugsSet = getExistingPublishedSlugs(articlesFileContent);

  console.log(`Generating article with Gemini API for "${item.keyword}"...`);
  const generated = await generateArticleWithGemini(item.keyword, validSlugsSet);

  console.log(`Fetching Unsplash image for "${item.keyword}"...`);
  const image = await fetchUnsplashImage(item.keyword, normalizeCategory(item.category), usedPhotoIds);

  const slug = slugify(item.keyword);
  const publishDate = new Date();
  const dateFormatted = publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const articleId = `art-${slug}`;

  const cleanCat = normalizeCategory(item.category);
  let authorObj = {
    name: "Sophia Chen",
    role: "Senior Lifestyle & Wellness Columnist",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
  };
  if (cleanCat === "tech" || cleanCat === "business") {
    authorObj = {
      name: "Marcus Vance",
      role: "Chief Business & Technology Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    };
  } else if (cleanCat === "celebrity" || cleanCat === "news") {
    authorObj = {
      name: "Elena Rostova",
      role: "Pop Culture & Design Lead",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    };
  }

  const categoryTag = cleanCat.toUpperCase();
  const tags = [
    item.keyword.split(' ')[0].toUpperCase(),
    item.keyword.split(' ')[1] ? item.keyword.split(' ')[1].toUpperCase() : 'GUIDE',
    'MAGAZINE',
    categoryTag
  ];

  const newArticle = {
    id: articleId,
    slug: slug,
    title: generated.title,
    metaTitle: `${generated.title} | On Gravity Magazine`,
    metaDescription: generated.excerpt,
    excerpt: generated.excerpt,
    content: generated.paragraphs,
    faqs: generated.faqs,
    category: cleanCat,
    author: authorObj,
    publishedAt: dateFormatted,
    readTime: "6 min read",
    imageUrl: image.url,
    imageAlt: image.alt,
    imageCaption: image.caption,
    featured: true,
    trending: true,
    tags: tags
  };

  // 4. Update queue item
  queueData[pendingIndex].status = 'published';
  queueData[pendingIndex].publishedAt = publishDate.toISOString();
  queueData[pendingIndex].generatedArticleSlug = slug;
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queueData, null, 2), 'utf-8');
  console.log(`Updated keywords_queue.json: status set to 'published' for "${item.keyword}".`);

  // 5. Prepend new article to ARTICLES array in data/articles.ts
  const marker = "export const ARTICLES: Article[] = [";
  if (!articlesFileContent.includes(marker)) {
    console.error("Could not find ARTICLES export marker in data/articles.ts!");
    process.exit(1);
  }

  const jsonSerialized = JSON.stringify(newArticle, null, 4);
  const updatedArticlesContent = articlesFileContent.replace(
    marker,
    `${marker}\n  ${jsonSerialized},`
  );
  fs.writeFileSync(ARTICLES_FILE, updatedArticlesContent, 'utf-8');
  console.log(`Successfully added article "${generated.title}" (${slug}) to data/articles.ts!`);

  // 6. Commit & push if running in GitHub Actions environment
  if (process.env.GITHUB_ACTIONS) {
    try {
      console.log("Pushing commit to GitHub repository...");
      execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { stdio: 'inherit' });
      execFileSync('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com'], { stdio: 'inherit' });
      execFileSync('git', ['add', 'keywords_queue.json', 'data/articles.ts', 'public/a65080e03104882ba93c502e351f98c1.txt'], { stdio: 'inherit' });
      const commitTitle = (generated.title || item.keyword).replace(/[\r\n]+/g, ' ').trim();
      execFileSync('git', ['commit', '-m', `auto-publish: Published article '${commitTitle}' [${slug}]`], { stdio: 'inherit' });
      execFileSync('git', ['pull', 'origin', 'main', '--rebase'], { stdio: 'inherit' });
      execFileSync('git', ['push', 'origin', 'main'], { stdio: 'inherit' });
      console.log("Git push successful! Vercel auto-deployment triggered.");
    } catch (gitErr) {
      console.error("Git commit/push failed:", gitErr.message);
      throw gitErr;
    }
  }

  // 7. Instant Indexing Ping (IndexNow + Google)
  await pingSearchEnginesForIndexing(slug);

  console.log(`=== AUTO-PUBLISH COMPLETED FOR "${item.keyword}" ===`);
}

async function pingSearchEnginesForIndexing(slug) {
  const url = `https://www.ongravitymagazine.com/${slug}`;
  const sitemapUrl = `https://www.ongravitymagazine.com/sitemap.xml`;
  console.log(`Triggering instant Search Engine Indexing ping for: ${url}`);

  try {
    const indexNowPayload = {
      host: "www.ongravitymagazine.com",
      key: "a65080e03104882ba93c502e351f98c1",
      keyLocation: "https://www.ongravitymagazine.com/a65080e03104882ba93c502e351f98c1.txt",
      urlList: [url, sitemapUrl]
    };
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowPayload)
    });
    console.log(`IndexNow Instant Indexing Ping Status: ${res.status}`);
  } catch (err) {
    console.warn("IndexNow ping warning:", err.message);
  }

  try {
    const gRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`Google Sitemap Ping Status: ${gRes.status}`);
  } catch (err) {
    console.warn("Google sitemap ping warning:", err.message);
  }
}

runAutoPublish().catch(err => {
  console.error("Auto-publish failed with error:", err);
  process.exit(1);
});
