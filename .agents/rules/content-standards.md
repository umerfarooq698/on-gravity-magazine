# Content Generation, SEO & Editorial Quality Standards

Every article created, updated, or published for On Gravity Magazine must strictly follow these editorial rules:

## 1. Unique Structure & Dynamic Outline (NEVER REUSE TEMPLATES)
- Every new article MUST have a completely fresh, custom structure, outline, and heading pattern designed specifically for that topic.
- NEVER reuse the same headings, layout formula, or structural blueprint from previous articles.
- Vary how the story unfolds: some articles open with an investigative scene, others with a cultural deep-dive, a timeline breakdown, or an industry analysis.

## 2. Zero AI Sentences & Natural Human Voice
- **No AI sentence patterns or syntactic formulas**:
  - NO formulaic "Not only X, but also Y" or "While X, Y remains Z" structures.
  - NO rhetorical AI signposts ("It is worth noting", "At its core", "One cannot overlook", "In a world where", "When it comes to").
  - NO synthetic summary wrap-ups at the end of every paragraph.
- Write in genuine, natural human entertainment/journalistic voice (like The Cut, Rolling Stone, or The Atlantic).
- Vary sentence lengths naturally: mix quick 5-word statements with detailed 25-word narrative descriptions.

## 3. Banned AI Vocabulary & PR Puffery (Zero Tolerance)
The following words and phrases are completely forbidden:
- AI stock terms: `delve`, `tapestry`, `beacon`, `vital`, `crucial`, `seamlessly`, `in conclusion`, `testament`, `realm`, `moreover`, `furthermore`, `it's important to remember`, `navigating`, `landscape`, `journey`, `underscores`, `plethora`, `nestled`, `foster`, `intricate`, `embark`, `bustling`, `ever-evolving`, `multifaceted`, `look no further`, `in today's world`.
- PR/Essay fluff: `masterclass`, `zeitgeist`, `titan`, `juggernaut`, `earthquake`, `dismantled`, `unapologetic`, `unabashed`, `delicate equilibrium`, `poise of`, `reverberated`, `audacity`, `swagger`, `multi-hyphenate`, `game-changer`, `testament to`.

## 4. Punctuation & Formatting Rules
- **Zero Oxford Commas**: Never write `", and"`. Always use `"X, Y and Z"` without a preceding comma before `and`.
- **Zero Bold Keywords**: Never bold required keywords (no `**keyword**`). All keywords must appear in normal sentence case.
- **Headings Structure**: Use `##` (H2) for primary thematic sections and multiple `###` (H3) subheadings under each section.
- **Paragraphs**: 3 to 5 natural, well-paced sentences per paragraph. Avoid single-sentence lines.
- **Article Length**: 1,800 to 2,500 words for primary feature stories.

## 5. Metadata & Visuals
- **Meta Description**: Strictly between 135 and 140 characters, 0 hyphens, 0 `", and"`.
- **Images**: Minimum 2 images per article:
  - Top featured image (stored in `public/images/` or verified Unsplash URL).
  - Middle body image positioned contextually with descriptive alt text and caption.
- **Internal Linking**: Naturally weave 1 to 2 relevant internal links to existing ongravitymagazine.com articles.
- **FAQs**: Exactly 4 single-sentence questions paired with single-sentence direct answers.

## 6. Pre-Publish Review Protocol
1. Run automated checks on keywords, banned words, Oxford commas, headings, and character counts.
2. Present a full draft preview to the user in chat for review.
3. Only add to `data/articles.ts`, test `npm run build`, and push after user gives explicit approval.
