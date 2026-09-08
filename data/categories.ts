export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  bgLight: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "celebrity",
    name: "Celebrity",
    slug: "celebrity",
    description: "Exclusive news, interviews, pop culture trends, and red carpet highlights from around the globe.",
    color: "bg-purple-600 text-purple-600 border-purple-200 dark:border-purple-800",
    bgLight: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300",
  },
  {
    id: "lifestyle",
    name: "Life Style",
    slug: "life-style",
    description: "Wellness, interior design, fashion, travel guides, and inspiring everyday living.",
    color: "bg-emerald-600 text-emerald-600 border-emerald-200 dark:border-emerald-800",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "tech",
    name: "Tech",
    slug: "tech",
    description: "Innovations in Artificial Intelligence, consumer electronics, software developments, and future technologies.",
    color: "bg-blue-600 text-blue-600 border-blue-200 dark:border-blue-800",
    bgLight: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300",
  },
  {
    id: "health",
    name: "Health",
    slug: "health",
    description: "Medical breakthroughs, mental well-being, nutrition advice, and fitness intelligence.",
    color: "bg-rose-600 text-rose-600 border-rose-200 dark:border-rose-800",
    bgLight: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300",
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    description: "Global markets, startup strategy, venture capital, leadership insights, and economic trends.",
    color: "bg-amber-600 text-amber-600 border-amber-200 dark:border-amber-800",
    bgLight: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
  },
  {
    id: "news",
    name: "News",
    slug: "news",
    description: "Timely global coverage, breaking stories, geopolitical analysis, and investigative journalism.",
    color: "bg-red-600 text-red-600 border-red-200 dark:border-red-800",
    bgLight: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300",
  },
  {
    id: "food",
    name: "Food",
    slug: "food",
    description: "Culinary arts, restaurant reviews, gourmet recipes, and global food culture.",
    color: "bg-orange-600 text-orange-600 border-orange-200 dark:border-orange-800",
    bgLight: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug || cat.id === slug);
}
