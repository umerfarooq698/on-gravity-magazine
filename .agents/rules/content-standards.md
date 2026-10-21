# Content Generation, SEO & AI Detection Standards

Every article created, updated, or published for On Gravity Magazine must strictly comply with the following standards:

## 1. ZeroGPT AI Detector Limit (MANDATORY: <= 10% AI)
- The entire article text must score **at most 10% AI on ZeroGPT.com** (minimum 90%+ Human written).
- **High Burstiness & Low Perplexity**:
  - Vary sentence lengths dynamically: mix short punchy sentences (4-8 words) with longer descriptive sentences (20-30 words).
  - Use active voice, natural idioms, concrete proper nouns, real metrics, and journalistic observations.
  - Avoid predictable synthetic transitions or boilerplate thesis structures.

## 2. Banned AI Vocabulary & PR Puffery (Zero Tolerance)
The following words and phrases are completely forbidden:
- AI stock terms: `delve`, `tapestry`, `beacon`, `vital`, `crucial`, `seamlessly`, `in conclusion`, `testament`, `realm`, `moreover`, `furthermore`, `it's important to remember`, `navigating`, `landscape`, `journey`, `underscores`, `plethora`, `nestled`, `foster`, `intricate`, `embark`, `bustling`, `ever-evolving`, `multifaceted`, `look no further`, `in today's world`.
- PR/Essay fluff: `masterclass`, `zeitgeist`, `titan`, `juggernaut`, `earthquake`, `dismantled`, `unapologetic`, `unabashed`, `delicate equilibrium`, `poise of`, `reverberated`, `audacity`, `swagger`, `multi-hyphenate`, `game-changer`, `testament to`.

## 3. Punctuation & Formatting Rules
- **Zero Oxford Commas**: Never write `", and"`. Always use `"X, Y and Z"` without a preceding comma before `and`.
- **Zero Bold Keywords**: Never bold required keywords (no `**keyword**`). Keywords must appear naturally in sentence case.
- **Headings Structure**: Major sections must use `##` (H2), and every major section must contain multiple `###` (H3) subheadings.
- **Paragraphs**: 3 to 5 substantial, engaging sentences per paragraph. Never write single-sentence paragraphs.
- **Article Length**: 1,800 to 2,500 words for standard feature stories.

## 4. Metadata & Visuals
- **Meta Description**: Strictly between 135 and 140 characters, 0 hyphens, 0 `", and"`.
- **Images**: Minimum 2 images per article:
  - Top featured image (stored in `public/images/` or verified Unsplash URL).
  - Middle body image positioned contextually in the text with clear alt text and caption.
- **Internal Linking**: Naturally weave 1 to 2 relevant internal links to existing ongravitymagazine.com articles.
- **FAQs**: Exactly 4 single-sentence questions paired with single-sentence direct answers.

## 5. Verification Protocol Before Publishing
1. Run automated validation checks on keywords, banned words, Oxford commas, headings, and character counts.
2. Present a full draft preview to the user before writing to `data/articles.ts`.
3. Verify `npm run build` succeeds with 0 errors before pushing to `origin/main`.
