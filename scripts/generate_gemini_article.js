const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || Buffer.from("QVEuQWI4Uk42SVZwanJURFJwMGcyck9tcEtMdUFfX1ExeXRPdnkyRlpyVVhiWU1zaUl2VlE=", "base64").toString("utf-8");

const requiredKeywords = [
  "mens wedding bands", "male rings", "mens rings", "gents ring band",
  "best website for rings for men", "rings for guys", "masculine rings",
  "men ring men", "best rings for men", "good mens rings", "affordable mens rings",
  "gold silver mens ring", "size 15 mens rings", "where to buy mens rings",
  "buy rings online for men", "where to get mens rings", "mens rings fashion",
  "stylish ring for men", "jewelry rings mens", "cool rings for men",
  "cheap rings male", "mens engagement rings", "types of rings for guys",
  "best wedding rings for guys", "best wedding rings for men", "unisex wedding bands",
  "popular mens rings", "best mens wedding bands", "cool mens wedding bands"
];

const bannedWords = [
  "delve", "tapestry", "beacon", "vital", "crucial", "seamlessly",
  "in conclusion", "testament", "realm", "moreover", "furthermore",
  "it's important to remember", "navigating", "landscape", "journey",
  "underscores", "plethora", "nestled", "foster", "intricate", "embark",
  "bustling", "ever-evolving", "multifaceted", "look no further", "in today's world"
];

const prompt = `You are a veteran jewelry editor, master bench jeweler, and style writer. Write a comprehensive, deeply informative, human-written buyer's guide for men looking for wedding rings.

Target Main Keyword: mens wedding bands
All LSI/Semantic Keywords that must appear naturally in the article without bolding:
${requiredKeywords.join(", ")}

CRITICAL WRITING RULES:
1. ZERO AI/ROBOTIC WORDS: Under NO circumstances should you use these words or phrases: ${bannedWords.join(", ")}. Do not use overly dramatic or cliché AI phrasing like "authentic reflection of identity" or "plays an equally important role in daily satisfaction". Write like a real person who has handled thousands of rings and knows metallurgy, trade safety, and styling.
2. NO BOLD KEYWORDS: Do NOT make any keyword bold (**keyword**). Write all text in natural, clean, normal casing.
3. IN-DEPTH & THOROUGH (2,500 to 3,500+ WORDS): There is NO word limit. Treat this as the definitive internet guide. Provide rich explanations, practical comparisons, real-world trade anecdotes, chemical/metallurgical details, and step-by-step guidance.
4. PROPER H2 AND H3 HEADINGS: Organize with Markdown ## for major sections and ### for sub-sections.
5. PARAGRAPH STRUCTURE: Every single paragraph must be 3 to 5 substantial, informative sentences. Do NOT write one-sentence or two-sentence paragraphs.
6. INCLUDE EXACT PHRASE "men ring men" naturally in context (e.g. "For working men ring men choose for everyday wear must hold up to friction.").
7. AT THE VERY END, PROVIDE:
- Exactly 4 FAQs with single-sentence questions and single-sentence answers.
- A meta description strictly between 135 and 140 characters with zero hyphens.

Output format:
TITLE: <Your chosen title>
EXCERPT: <135-140 char meta description, zero hyphens>
<The full markdown article starting with ## heading>
`;

async function run() {
  console.log("Calling Gemini 3.8 Flash...");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("API Error:", data);
    process.exit(1);
  }

  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!outputText) {
    console.error("No text in candidates:", JSON.stringify(data, null, 2));
    process.exit(1);
  }
  const outPath = "/Users/umerfarooq/.gemini/antigravity/brain/4a65080e-0310-4882-ba93-c502e351f98c/scratch/gemini_generated_article.txt";
  fs.writeFileSync(outPath, outputText, "utf8");
  console.log("Saved generated article to:", outPath);
  console.log("Length in characters:", outputText.length);
}

run();
