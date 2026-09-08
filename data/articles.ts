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
  imageCaption?: string;
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
    imageCaption: "Serene morning sunlight filtering into a minimalist living space.",
    featured: true,
    trending: true,
    tags: ["Wellness", "Lifestyle", "Mindfulness", "Home"]
  },
  {
    id: "art-4",
    slug: "global-markets-inflation-rates-2026",
    title: "Global Financial Markets Shift as Central Banks recalibrate Interest Policies",
    excerpt: "An analysis of global trade corridors, market indexes, venture investments, and rising economic sectors for Q4 2026.",
    content: [
      "Financial institutions around the world are navigating a changing macroeconomic landscape characterized by stabilizing inflation and accelerating energy transitions.",
      "Venture capital funds are refocusing portfolio allocations toward clean energy technologies, automation, and biotech innovations.",
      "Strategic investments in green infrastructure are outperforming traditional commodities, creating fresh opportunities for institutional and retail investors alike.",
      "Economists urge diversified portfolio strategies to buffer against regional market fluctuations while capturing upside growth in emerging tech sectors."
    ],
    category: "business",
    author: {
      name: "David Sterling",
      role: "Chief Economics Analyst",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 5, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Modern high-rise financial district reflecting morning sky.",
    featured: false,
    trending: true,
    tags: ["Business", "Finance", "Economy", "Markets"]
  },
  {
    id: "art-5",
    slug: "longevity-science-cellular-health-2026",
    title: "Unlocking Cellular Longevity: What New Medical Science Reveals",
    excerpt: "Breakthroughs in telomere maintenance, metabolic health, and preventive medicine designed to extend vibrant human lifespan.",
    content: [
      "Biomedical research has reached a major milestone with the discovery of targeted cellular interventions that delay mitochondrial decline.",
      "Preventive healthcare is transitioning from reactive treatment to proactive longevity optimization through personalized DNA profiling and microbiome tracking.",
      "Key lifestyle factors—including circadian-aligned sleep, intermittent fasting, and resistance exercise—remain foundational amplifiers of scientific anti-aging therapies.",
      "As longevity therapeutics move into clinical availability, medical ethicists emphasize equitable access for populations globally."
    ],
    category: "health",
    author: {
      name: "Dr. Aris Thorne",
      role: "Medical & Science Writer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 4, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Laboratory microscope examining biocellular cellular structures.",
    featured: false,
    trending: false,
    tags: ["Health", "Medicine", "Science", "Longevity"]
  },
  {
    id: "art-6",
    slug: "mediterranean-gourmet-gastronomy-revolution",
    title: "The Gourmet Revival: Sustainable Farm-to-Table Dining Sweeps Global Capitals",
    excerpt: "Michelin chefs are reinventing classic culinary traditions using hyper-local organic ingredients and zero-waste kitchens.",
    content: [
      "The global culinary scene is experiencing a profound renaissance rooted in sustainability, ancestral cooking techniques, and biodiversity preservation.",
      "From Tokyo to San Francisco, top restaurateurs are partnering directly with smallholder organic farms to cultivate heritage grains and heirloom vegetables.",
      "Guests are invited into immersive dining stories where every dish highlights artisanal craftsmanship, seasonal flavors, and minimal carbon footprint.",
      "This movement proves that luxury dining and environmental stewardship can coexist harmoniously on the world's finest plates."
    ],
    category: "food",
    author: {
      name: "Camilla Dupuis",
      role: "Culinary Editor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 3, 2026",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Artisanal gourmet dish plated meticulously in a modern bistro.",
    featured: false,
    trending: false,
    tags: ["Food", "Gourmet", "Dining", "Culinary"]
  },
  {
    id: "art-7",
    slug: "global-climate-accord-clean-energy-cities",
    title: "Global Summit Reaches Landmark Accord on Zero-Emission Urban Transit",
    excerpt: "Over 80 nations commit to green energy municipal grids, high-speed rail networks, and urban forestry initiatives by 2030.",
    content: [
      "Delegates at the International Energy & Urban Futures Summit have unanimously ratified the 2026 Clean Transit Agreement.",
      "The treaty establishes binding timetables for converting city bus fleets, commuter railways, and commercial shipping hubs to 100% renewable power sources.",
      "Urban planners demonstrated successful smart-city pilots where solar canopies and automated electric transit reduced inner-city emissions by 45%.",
      "Mayors worldwide hailed the accord as a historic leap toward healthier urban atmospheres and sustainable economic resilience."
    ],
    category: "news",
    author: {
      name: "Julian Sterling",
      role: "World Affairs Correspondent",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 2, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Sustainable urban skyline powered by clean solar and wind energy.",
    featured: false,
    trending: true,
    tags: ["News", "Environment", "Global", "Climate"]
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
