import { getAllArticlesCombined } from "@/lib/automation";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // Content paragraphs
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
    id: "art-1",
    slug: "ai-generative-revolution-2026",
    title: "The Next Frontier of AI: Beyond Human Creativity and Autonomous Systems",
    excerpt: "How generative intelligence and multimodal agents are reshaping software engineering, creative arts, and global industry workflows.",
    metaTitle: "The Next Frontier of AI: Autonomous Agents & Future | On Gravity Magazine",
    metaDescription: "In-depth analysis of how multimodal AI agents and generative intelligence are transforming global industries in 2026.",
    content: [
      "Artificial Intelligence has evolved from predictive statistical models into creative collaborators that assist millions of creators, engineers, and researchers worldwide.",
      "In 2026, the convergence of real-time reasoning models and multimodal interfaces has unlocked unprecedented efficiency. Developers now pair program with autonomous AI partners capable of synthesizing complete cross-platform applications within minutes.",
      "However, with great computing capability comes the vital responsibility of alignment, data sovereignty, and human-centric design. Industry leaders are focusing heavily on ethical AI frameworks to ensure transparent and safe deployment.",
      "As we look forward to the next decade, the barrier between human ideation and execution is vanishing. The most successful organizations will be those that empower their teams to harness AI as an amplifier of human ingenuity."
    ],
    category: "tech",
    author: {
      name: "Marcus Vance",
      role: "Senior Technology Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Abstract glowing neural network mesh representing artificial intelligence",
    imageCaption: "Neural visualization of multimodal AI networks processing high-dimensional data.",
    featured: true,
    trending: true,
    tags: ["AI", "Technology", "Future", "Software"]
  },
  {
    id: "art-2",
    slug: "hollywood-met-gala-red-carpet-2026",
    title: "Inside the Gala: Cinema Icons and High-Fashion Legends Steal the Night",
    excerpt: "A front-row look at the most breathtaking red carpet couture, unexpected reunions, and viral celebrity moments of the season.",
    metaTitle: "Inside the Gala: 2026 Red Carpet Fashion & Highlights | On Gravity Magazine",
    metaDescription: "Front row coverage of the most stunning red carpet outfits, cinema icons, and viral celebrity highlights at the 2026 Gala.",
    content: [
      "The annual Gala gathered cinema royalty, chart-topping artists, and fashion pioneers under one roof for an unforgettable celebration of artistic expression.",
      "Avant-garde silhouettes dominated the carpet, featuring hand-embroidered sustainable silks and vintage archival pieces sourced from Paris and Milan ateliers.",
      "Highlight of the evening included surprise acoustic performances and candid moments between veteran actors and fresh breakthrough stars, setting social media abuzz within seconds.",
      "Beyond the glamour, the event raised record-breaking funds for international arts education initiatives, proving that high fashion remains a potent force for global philanthropy."
    ],
    category: "celebrity",
    author: {
      name: "Elena Rostova",
      role: "Pop Culture Lead",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 7, 2026",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Golden light architecture and red carpet stage illumination",
    imageCaption: "Gala stage illuminated with golden light architecture.",
    featured: true,
    trending: true,
    tags: ["Celebrity", "Fashion", "Gala", "Hollywood"]
  },
  {
    id: "art-3",
    slug: "mindful-living-work-life-harmony",
    title: "The Art of Slow Living: Reclaiming Calm in a Fast-Paced Digital Era",
    excerpt: "Simple habits, ergonomic spaces, and intentional routines that help restore focus, balance, and deep personal fulfillment.",
    metaTitle: "The Art of Slow Living & Mindful Wellness | On Gravity Magazine",
    metaDescription: "Discover how slow living habits and intentional boundaries restore mental focus, peace, and work-life balance.",
    content: [
      "In a world driven by continuous notifications and hyper-connectivity, the philosophy of 'Slow Living' offers a soothing antidote to digital burnouts.",
      "Creating physical and mental sanctuary begins with intentional boundaries: designating tech-free morning rituals, curating clutter-free living rooms, and embracing nature walks.",
      "Research shows that incorporating micro-pauses during the workday improves cognitive clarity, sharpens decision-making, and deepens interpersonal relationships.",
      "Harmonious living isn't about shunning modern tools—it's about orchestrating them so they serve your peace rather than dictate your time."
    ],
    category: "life-style",
    author: {
      name: "Sophia Chen",
      role: "Lifestyle & Wellness Columnist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 6, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Minimalist serene sunlit room for mindful slow living",
    imageCaption: "Serene morning sunlight filtering into a minimalist living space.",
    featured: true,
    trending: true,
    tags: ["Wellness", "Lifestyle", "Mindfulness", "Home"]
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  const all = getAllArticlesCombined();
  return all.find((a) => a.slug === slug || a.id === slug);
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
