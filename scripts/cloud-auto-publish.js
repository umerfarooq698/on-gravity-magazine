const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const QUEUE_FILE = path.join(__dirname, '..', 'keywords_queue.json');
const ARTICLES_FILE = path.join(__dirname, '..', 'data', 'articles.ts');

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1j0pU46wUz-k676ypU4rzXgaF6ybqjaq5thgMnnW_2v4/export?format=csv";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || Buffer.from("QVEuQWI4Uk42SVZwanJURFJwMGcyck9tcEtMdUFfX1ExeXRPdnkyRlpyVVhiWU1zaUl2VlE=", "base64").toString("utf-8");
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "FLqjxtnt8-eGS9mpiB3-GMOvHhVAqT4_lQxyslYLO0A";

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.6-pro",
  "gemini-3.0-flash",
  "gemini-2.5-flash"
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

function parseCsvLines(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
    const keyword = parts[0];
    const category = parts[1] || 'life-style';
    if (keyword && keyword.length > 1) {
      items.push({ keyword, category: category.toLowerCase().replace(/\s+/g, '-') });
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

      let addedCount = 0;
      for (const item of sheetItems) {
        const cleanKw = item.keyword.toLowerCase().trim();
        if (!existingKeywords.has(cleanKw)) {
          queueData.push({
            id: `kw-${queueData.length + 1}`,
            keyword: item.keyword,
            category: item.category || 'life-style',
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

  const searchQueries = [
    cleanKw,
    cleanKw.replace(/\b(movie|film|salary|houston|nyc|rent|ideas|tips|recipe|bars|tech|husband|instagram)\b/gi, "").trim()
  ];

  if (category === "celebrity") searchQueries.push(`${cleanKw} actress cinema red carpet fashion`, "hollywood actress red carpet cinema premiere");
  if (category === "food") searchQueries.push(`${cleanKw} gourmet food dish`, "delicious gourmet food cuisine dish");
  if (category === "tech") searchQueries.push(`${cleanKw} technology workstation`, "modern technology device computer hardware");
  if (category === "life-style") searchQueries.push(`${cleanKw} interior decor`, "modern luxury interior design home decor");
  if (category === "health") searchQueries.push(`${cleanKw} wellness fitness`, "health wellness fitness exercise lifestyle");
  if (category === "business") searchQueries.push(`${cleanKw} finance corporate`, "corporate business office finance stock market");
  if (category === "news") searchQueries.push(`${cleanKw} news event`, "global news journalism press conference");

  if (UNSPLASH_ACCESS_KEY) {
    for (const q of searchQueries) {
      if (!q || q.length < 2) continue;
      try {
        const pageNum = (hashVal % 3) + 1;
        const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20&page=${pageNum}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const unused = data.results.filter(p => p.id && !usedPhotoIds.has(p.id));
            const photoList = unused.length > 0 ? unused : data.results;
            const photo = photoList[hashVal % photoList.length];
            const rawUrl = photo.urls?.regular || photo.urls?.full;
            const photoId = photo.id;
            if (rawUrl && photoId) {
              usedPhotoIds.add(photoId);
              const uniqueUrl = rawUrl.includes("?") ? `${rawUrl}&sig=${slugSig}_${Date.now()}` : `${rawUrl}?sig=${slugSig}_${Date.now()}`;
              const altText = (photo.alt_description || photo.description || `Editorial photography for ${cleanKw}`).replace(/&/g, "and");
              const finalAlt = altText.length > 10 ? `${altText} - ${cleanKw}` : `High-resolution editorial photography illustrating ${cleanKw}`;
              console.log(`Matched high-relevancy photo for query "${q}": ${photoId}`);
              return {
                url: uniqueUrl,
                caption: (photo.description || photo.alt_description || `Editorial photograph for ${cleanKw} on On Gravity Magazine.`).replace(/&/g, "and"),
                alt: finalAlt.replace(/&/g, "and")
              };
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
  return `You are an expert SEO editor and senior journalist for On Gravity Magazine.

Your objective is to write a comprehensive, 100% unique, highly SEO-optimized, publication-ready article based on the submitted keyword/topic.

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

  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Calling Gemini API model: ${modelName}...`);
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.75, topP: 0.95 }
        })
      });

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

  throw new Error("Gemini API call failed across all models.");
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
    excerpt = `Discover complete guide on ${keyword.replace(/&/g, 'and')}, featuring expert tips, structural insights, and modern styling solutions.`;
  }
  if (excerpt.length > 150) excerpt = excerpt.substring(0, 147) + '...';

  return { title, excerpt, paragraphs, faqs };
}

async function runAutoPublish() {
  console.log("=== ON GRAVITY CLOUD AUTO-PUBLISHER ===");

  let queueData = [];
  if (fs.existsSync(QUEUE_FILE)) {
    queueData = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
  }

  // 1. Sync live keywords from Google Sheet
  queueData = await syncWithGoogleSheet(queueData);

  const pendingIndex = queueData.findIndex(item => item.status === 'pending');

  if (pendingIndex === -1) {
    console.log("No pending keywords remaining in keywords_queue.json or Google Sheet. Auto-publisher finished!");
    process.exit(0);
  }

  const item = queueData[pendingIndex];
  console.log(`Found pending keyword [Index: ${pendingIndex}]: "${item.keyword}" (Category: ${item.category})`);

  // Parse existing articles to ensure image uniqueness & get valid internal link slugs
  const articlesFileContent = fs.readFileSync(ARTICLES_FILE, 'utf-8');
  const usedPhotoIds = new Set();
  const photoMatches = articlesFileContent.match(/photo-([a-zA-Z0-9-]+)/g) || [];
  photoMatches.forEach(m => usedPhotoIds.add(m.replace('photo-', '')));

  const validSlugsSet = getExistingPublishedSlugs(articlesFileContent);

  console.log(`Generating article with Gemini API model gemini-3.6-flash for "${item.keyword}"...`);
  const generated = await generateArticleWithGemini(item.keyword, validSlugsSet);

  console.log(`Fetching Unsplash image for "${item.keyword}"...`);
  const image = await fetchUnsplashImage(item.keyword, item.category || 'life-style', usedPhotoIds);

  const slug = slugify(item.keyword);
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const articleId = `art-${slug}`;

  const categoryTag = (item.category || 'life-style').toUpperCase();
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
    category: item.category || 'life-style',
    author: {
      name: "Sophia Chen",
      role: "Lifestyle and Wellness Columnist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: dateFormatted,
    readTime: "6 min read",
    imageUrl: image.url,
    imageAlt: image.alt,
    imageCaption: image.caption,
    featured: true,
    trending: true,
    tags: tags
  };

  // 1. Update queue item
  queueData[pendingIndex].status = 'published';
  queueData[pendingIndex].publishedAt = now.toISOString();
  queueData[pendingIndex].generatedArticleSlug = slug;
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queueData, null, 2), 'utf-8');
  console.log(`Updated keywords_queue.json: status set to 'published' for "${item.keyword}".`);

  // 2. Prepend new article to ARTICLES array in data/articles.ts
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
  console.log(`Successfully added Gemini-generated article "${generated.title}" (${slug}) to data/articles.ts!`);

  // 3. Commit & push if running in GitHub Actions environment
  if (process.env.GITHUB_ACTIONS) {
    try {
      console.log("Configuring git and pushing changes in GitHub Actions...");
      execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
      execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });
      execSync('git add keywords_queue.json data/articles.ts', { stdio: 'inherit' });
      execSync(`git commit -m "auto-publish: Published article '${generated.title}' [${slug}]"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log("Git push successful! Vercel auto-deployment triggered.");
    } catch (gitErr) {
      console.warn("Git commit/push failed:", gitErr.message);
    }
  }

  console.log(`=== AUTO-PUBLISH COMPLETED FOR "${item.keyword}" ===`);
}

runAutoPublish().catch(err => {
  console.error("Auto-publish failed with error:", err);
  process.exit(1);
});
