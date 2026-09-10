const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const QUEUE_FILE = path.join(__dirname, '..', 'keywords_queue.json');
const ARTICLES_FILE = path.join(__dirname, '..', 'data', 'articles.ts');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "FLqjxtnt8-eGS9mpiB3-GMOvHhVAqT4_lQxyslYLO0A";

const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-pro",
  "gemini-2.0-flash"
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

  if (UNSPLASH_ACCESS_KEY) {
    try {
      const pageNum = (hashVal % 5) + 1;
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=30&page=${pageNum}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
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
            return {
              url: uniqueUrl,
              caption: (photo.description || photo.alt_description || `Editorial photograph for ${cleanKw} on On Gravity Magazine.`).replace(/&/g, "and"),
              alt: finalAlt.replace(/&/g, "and")
            };
          }
        }
      }
    } catch (e) {
      console.warn("Unsplash API fetch failed, using fallback pool:", e.message);
    }
  }

  const categoryPhotoPools = {
    "life-style": ["photo-1584622650111-993a426fbf0a", "photo-1507652313519-d4e9174996dd", "photo-1552321554-5fefe8c9ef14", "photo-1620626011761-996317b8d101"],
    "tech": ["photo-1615663245857-ac93bb7c39e7", "photo-1593359677879-a4bb92f829d1", "photo-1517336714731-489689fd1ca8"],
    "health": ["photo-1506126613408-eca07ce68773", "photo-1540420773420-3366772f4999", "photo-1571019613454-1cb2f99b2d8b"],
    "celebrity": ["photo-1492684223066-81342ee5ff30", "photo-1515886657613-9f3515b0c78f"],
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

const SYSTEM_PROMPT = `You are an expert SEO editor and senior journalist for On Gravity Magazine.

Your objective is to write a comprehensive, 100% unique, highly SEO-optimized, publication-ready article based on the submitted keyword/topic.

STRICT ARTICLE STRUCTURE & WORD COUNT INSTRUCTIONS:

1. TARGET ARTICLE WORD COUNT (CRITICAL):
   - Total article length MUST be between 1,000 and 1,200 words.
   - Provide deep, well-developed, comprehensive paragraphs under every section to hit this word count naturally without fluff.

2. CLICKABLE SEO TITLE GENERATION (STRICT 55-60 CHARACTERS):
   - Create an irresistible, click-worthy title starting directly with "# ".
   - CRITICAL LENGTH RULE: The title MUST be strictly between 55 and 60 characters long (excluding "# ").
   - Incorporate the primary keyword naturally ANYWHERE in the title.
   - DO NOT include any year (e.g. DO NOT write "2026" or "2025").
   - Replace any "&" with "and".

3. UNIQUE 140-CHARACTER SEO META SUMMARY / EXCERPT:
   - Immediately after title, output "EXCERPT: [Write a fresh, 100% unique meta description of EXACTLY 135 to 140 characters summarizing the topic]".

4. HEADING NUMBERING & HIERARCHY (CRITICAL):
   - HEADING NUMBERING RULE: For standard informational articles, do NOT use numbered headings such as "1.", "2.", or "3.". Numbered headings should ONLY be used when the target topic or keyword is naturally count-based (e.g., "5 Best Laptops").
   - H2 INTRODUCTION RULE: Every main-content H2 section MUST begin with a complete, useful introductory paragraph before any H3 subheadings, bullet points, tables, or lists appear. Do NOT place an H3 immediately after an H2!
   - H3 SUBHEADINGS RULE: Use H3 headings ONLY when they genuinely help divide a broader H2 topic into subtopics.

5. BULLET POINTS:
   - Use bullet points ONLY where they improve readability (Features, Specs, Pros/Cons, Steps).

6. CONCLUSION & FAQS:
   - Include a dedicated "## Conclusion" section.
   - Include a dedicated "## Frequently Asked Questions" section with 2-3 FAQs formatted as:
     ### Q: [Short Question]
     A: [Short Answer]

7. NATURAL INTERNAL LINKING:
   - Include 1 to 2 natural internal links targeting existing articles (e.g. [bathroom tiles design](/bathroom-tiles-design), [character bathrooms](/character-bathrooms)) when relevant words appear organically.

Start directly with # [Generated Title].`;

async function generateArticleWithGemini(keyword) {
  if (GEMINI_API_KEY) {
    const count = extractCountFromKeyword(keyword);
    let listicleInstruction = "";
    if (count) {
      listicleInstruction = `\n\nCRITICAL COUNT INSTRUCTION: The keyword asks for "${count}" items. You MUST create exactly ${count} main item headings (using "## 1. [Item]", "## 2. [Item]" up to "## ${count}. [Item]") with H3 sub-sections under each item and write full, informative paragraphs under EACH section to reach 1,000 to 1,200 words!`;
    }

    const promptText = `${SYSTEM_PROMPT}${listicleInstruction}\n\nSubmitted Keyword / Topic: "${keyword}"\n[Target Word Count: 1000-1200 words]`;

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
            return parseGeminiMarkdown(text, keyword);
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${modelName} error:`, err.message);
      }
    }
  }

  console.log("Using deterministic high-quality editorial fallback generator for:", keyword);
  return generateEditorialFallback(keyword);
}

function generateEditorialFallback(keyword) {
  const cleanKw = keyword.replace(/&/g, "and").trim();
  const kwWords = cleanKw.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const hashVal = getDeterministicHash(cleanKw);

  const title = formatSeoTitle(cleanKw, hashVal);
  const excerpt = `Explore the complete guide to ${cleanKw}, covering fundamental specifications, performance standards, interior integrations, and key practical tips.`;

  const paragraphs = [
    `Understanding ${cleanKw} has become increasingly essential for modern consumers and industry enthusiasts seeking quality, functionality, and long-term durability. Whether you are exploring options for personal lifestyle upgrades or professional applications, analyzing key features ensures educated decision-making.`,
    `## Foundational Mechanics and Key Features`,
    `Evaluating the core architecture of ${cleanKw} reveals how advanced material choices and deliberate design choices impact daily user experience. High-quality standards distinguish superior options from entry-level market alternatives.`,
    `### Material Integrity and Durability Factors`,
    `Craftsmanship dictates the operational lifespan and reliability of ${cleanKw}. Premium components reduce wear and tear, maintaining aesthetic and mechanical excellence over extended use in demanding environments.`,
    `### Functional Ergonomics and Everyday Utility`,
    `Intuitive user interface design ensures that ${cleanKw} offers effortless operation. Streamlined ergonomics prevent user fatigue while maximizing overall output across diverse usage scenarios.`,
    `## Strategic Setup and System Integration`,
    `Integrating ${cleanKw} into existing setups requires careful planning regarding spatial layout, power efficiency, and complementary accessories. Proper installation maximizes performance while maintaining overall safety standards.`,
    `### Optimization Protocols and Performance Tuning`,
    `Fine-tuning key settings enables custom performance tailored to individual preferences. Routine checks and regular calibration keep system output consistent over time.`,
    `- High-performance component density ensuring optimal thermal dissipation`,
    `- Certified safety standards and low-maintenance operational lifecycle`,
    `- Versatile compatibility with modern architectural and technological setups`,
    `- Enhanced surface finishes for superior wear resistance and aesthetic appeal`,
    `## Conclusion`,
    `Investing in high-grade ${cleanKw} offers unmatched utility and long-term satisfaction. By prioritizing build quality, ergonomic design, and systematic maintenance, users unlock optimal performance.`
  ];

  const faqs = [
    {
      question: `What makes ${cleanKw} a recommended choice?`,
      answer: `${cleanKw} combines reliable build quality, modern design aesthetics, and efficient operation tailored for daily use.`
    },
    {
      question: `How do you maintain ${cleanKw} for longevity?`,
      answer: `Regular maintenance, proper operational protocols, and routine inspections ensure long-term performance and durability.`
    }
  ];

  return { title, excerpt, paragraphs, faqs };
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

  if (!fs.existsSync(QUEUE_FILE)) {
    console.error("keywords_queue.json not found!");
    process.exit(1);
  }

  const queueData = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
  const pendingIndex = queueData.findIndex(item => item.status === 'pending');

  if (pendingIndex === -1) {
    console.log("No pending keywords remaining in keywords_queue.json. Auto-publisher finished!");
    process.exit(0);
  }

  const item = queueData[pendingIndex];
  console.log(`Found pending keyword [Index: ${pendingIndex}]: "${item.keyword}" (Category: ${item.category})`);

  // Parse existing articles to ensure image uniqueness
  const articlesFileContent = fs.readFileSync(ARTICLES_FILE, 'utf-8');
  const usedPhotoIds = new Set();
  const photoMatches = articlesFileContent.match(/photo-([a-zA-Z0-9-]+)/g) || [];
  photoMatches.forEach(m => usedPhotoIds.add(m.replace('photo-', '')));

  console.log(`Generating article for "${item.keyword}"...`);
  const generated = await generateArticleWithGemini(item.keyword);

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
  console.log(`Successfully added article "${generated.title}" (${slug}) to data/articles.ts!`);

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
