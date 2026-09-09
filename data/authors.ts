export interface Author {
  slug: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  location?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

export const AUTHORS: Author[] = [
  {
    slug: "marcus-vance",
    name: "Marcus Vance",
    role: "Chief Business & Technology Editor",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    bio: "Marcus covers high-tech innovation, industrial design, corporate strategy, and first-principles engineering breakthroughs across global markets.",
    location: "San Francisco, CA",
    socials: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    slug: "elena-rostova",
    name: "Elena Rostova",
    role: "Pop Culture & Design Lead",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    bio: "Elena specializes in contemporary architecture, interior design trends, pop culture movements, and luxury lifestyle features.",
    location: "London, UK",
    socials: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    slug: "sophia-chen",
    name: "Sophia Chen",
    role: "Senior Lifestyle & Wellness Columnist",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    bio: "Sophia writes in-depth guides on modern home design, ergonomic living, health benchmarks, and domestic utility solutions.",
    location: "New York, NY",
    socials: {
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
    },
  },
];

export function getAuthorSlug(name: string): string {
  if (!name) return "marcus-vance";
  const clean = name.toLowerCase().trim();
  if (clean.includes("vance") || clean.includes("marcus")) return "marcus-vance";
  if (clean.includes("rostova") || clean.includes("elena")) return "elena-rostova";
  if (clean.includes("chen") || clean.includes("sophia")) return "sophia-chen";
  return clean.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getAuthorBySlug(slug: string): Author {
  const cleanSlug = slug.toLowerCase().trim();
  const found = AUTHORS.find((a) => a.slug === cleanSlug);
  if (found) return found;

  // Fallback for dynamic author name
  const formattedName = cleanSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    slug: cleanSlug,
    name: formattedName || "Editorial Staff",
    role: "Senior Staff Writer & Columnist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    bio: `${formattedName || "Editorial Staff"} is a contributor for On Gravity Magazine, covering architectural design, technology, and lifestyle trends.`,
    location: "Global",
  };
}

export function getAllAuthors(): Author[] {
  return AUTHORS;
}
