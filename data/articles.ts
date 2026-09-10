import { getAllArticlesCombined, getArticleBySlugAsync } from "@/lib/automation";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // Content paragraphs
  faqs?: { question: string; answer: string }[]; // Helpful FAQs for Google Search Quality
  category: string; // Category slug
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  imageAlt: string; // Image ALT Text for SEO & Accessibility
  imageCaption?: string;
  metaTitle?: string; // SEO Meta Title
  metaDescription?: string; // SEO Meta Description
  featured?: boolean;
  trending?: boolean;
  tags: string[];
}

export const ARTICLES: Article[] = [
  {
    "id": "art-character-bathrooms",
    "slug": "character-bathrooms",
    "title": "Character Bathrooms Design Ideas and Architectural Styling",
    "metaTitle": "Character Bathrooms Design Ideas and Architectural Styling | On Gravity Magazine",
    "metaDescription": "Discover character bathrooms styling tips, blending vintage clawfoot soaking tubs, reclaimed timber, exposed brick, and brass fixtures.",
    "excerpt": "Discover character bathrooms styling tips, blending vintage clawfoot soaking tubs, reclaimed timber, exposed brick, and brass fixtures.",
    "content": [
      "Character bathrooms have become the pinnacle of modern luxury interior design, offering a soul-stirring alternative to sterile, uniform washrooms. By celebrating architectural heritage, tactile natural materials, and artisanal craftsmanship, a character bathroom weaves history and personal narrative into a sanctuary designed for daily relaxation.",
      "## Defining Architectural Character in Modern Bathrooms",
      "Establishing true architectural character requires moving beyond off-the-shelf vanity sets and mass-produced chrome fixtures. Designing character bathrooms revolves around preserving original structural quirks while intentionally introducing period-appropriate elements that evoke warmth and permanence.",
      "### Historical Details and Vintage Period Accents",
      "Incorporating authentic period detailing elevates a standard washroom into an architectural showcase. Crown moldings, beadboard wainscoting, and reclaimed brass door hardware inject immediate historical depth, creating a tactile bridge between classic craftsmanship and contemporary plumbing convenience.",
      "### Natural Timber and Exposed Structural Masonry",
      "Exposing original brick walls or installing sealed reclaimed oak beams introduces organic textures that soften hard porcelain and tile surfaces. The contrast between rough masonry and polished porcelain creates a captivating visual tension that defines high-end character bathrooms.",
      "## Core Architectural Elements of Character Bathrooms",
      "Selecting focal fixtures determines how effectively your washroom communicates its unique design identity. Rather than hiding structural features, character bathrooms highlight craftsmanship through statement bathtubs, bespoke vanities, and hand-finished metalwork.",
      "### Freestanding Clawfoot Tubs and Cast Iron Baths",
      "A hand-painted cast iron clawfoot bathtub serves as the undisputed centerpiece of any heritage character bathroom. Positioning a roll-top tub near a sash window or against a tiled accent wall commands attention while offering an unmatchable soaking experience.",
      "### Aged Brass and Unlacquered Copper Hardware",
      "Unlacquered brass and living copper fittings mature gracefully over time, developing a natural patina that reflects daily use. Unlike synthetic protective coatings, living metal finishes react to humidity and touch, adding authentic vintage patina to shower controls and basin spouts.",
      "- Brassware Finish: Unlacquered brushed brass developing natural patina over time",
      "- Flooring Foundation: Hand-laid encaustic cement tiles or reclaimed oak floorboards",
      "- Lighting Temperature: 2700K warm incandescent glow enhancing textured masonry",
      "- Vanity Construction: Repurposed antique oak sideboard fitted with undermount basin",
      "## Color Palettes and Tactile Wall Textures",
      "Color choices in character bathrooms draw inspiration from historical heritage palettes, moody botanical hues, and rich earth tones. Layering deep paint colors with textured wall treatments transforms modest spaces into intimate luxury retreats.",
      "### Deep Heritage Paints and Moody Tone Layering",
      "Rich shades of studio green, deep navy, and muted terracotta create an enveloping atmosphere that highlights polished brass and white porcelain contrast. Pairing dark walls with warm timber vanities ensures the room feels cozy rather than claustrophobic.",
      "## Conclusion",
      "Investing in character bathrooms allows homeowners to curate a personal sanctuary filled with texture, warmth, and timeless architectural appeal. By balancing reclaimed materials, freestanding tubs, and living metal finishes, you create a space that transcends fleeting design trends."
    ],
    "faqs": [
      {
        "question": "What defines a character bathroom in interior design?",
        "answer": "A character bathroom integrates historical architectural elements like exposed brick, vintage brassware, reclaimed timber, and clawfoot tubs to create a space rich in personality and craftsmanship."
      },
      {
        "question": "Can character bathrooms be created in modern new-build homes?",
        "answer": "Yes, incorporating reclaimed wood vanities, panelling, hand-glazed tiles, and patina brass fixtures adds authentic warmth to contemporary new builds."
      },
      {
        "question": "How do you protect reclaimed timber floorboards in wet bathroom zones?",
        "answer": "Sealing reclaimed timber with high-grade breathable hard-wax oil prevents water penetration while preserving natural grain character."
      }
    ],
    "category": "life-style",
    "author": {
      "name": "Sophia Chen",
      "role": "Lifestyle and Wellness Columnist",
      "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    "publishedAt": "Sep 11, 2026",
    "readTime": "7 min read",
    "imageUrl": "https://images.unsplash.com/photo-1783685633414-a32b931e5b97?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "Vintage character bathroom featuring heritage green walls, period window framing, and classic brass fixtures",
    "imageCaption": "A restored heritage character bathroom blending antique architectural details with warm ambient lighting.",
    "featured": true,
    "trending": true,
    "tags": [
      "CHARACTER",
      "BATHROOMS",
      "INTERIOR",
      "LIFE-STYLE",
      "DECOR"
    ]
  }
];

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return await getArticleBySlugAsync(slug);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  const all = getAllArticlesCombined();
  return all.filter((a) => a.category === categorySlug);
}

export function getFeaturedArticles(): Article[] {
  const all = getAllArticlesCombined();
  return all.filter((a) => a.featured);
}

export function getTrendingArticles(): Article[] {
  const all = getAllArticlesCombined();
  return all.filter((a) => a.trending);
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const all = getAllArticlesCombined();
  return all.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q)
  );
}
