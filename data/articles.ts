import { getAllArticlesCombined, getArticleBySlugAsync } from "@/lib/automation";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // Content paragraphs
  faqs?: { question: string; answer: string }[]; // 2-4 Helpful FAQs for Google Search Quality
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
    id: "art-bathroom-taps",
    slug: "bathroom-taps",
    title: "Selecting the Ideal Bathroom Taps: Styles, Finishes and Flow Performance",
    excerpt: "Discover how to choose the perfect bathroom taps balancing modern aesthetics, water pressure compatibility, and long-lasting durability.",
    category: "life-style",
    author: {
      name: "Marcus Vance",
      role: "Senior Editorial Director",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=bathroom-taps-fixed",
    imageAlt: "Modern luxury bathroom taps installed on clean ceramic basin",
    imageCaption: "Sleek matte black and chrome brass bathroom taps elevate contemporary interior aesthetics.",
    metaTitle: "Selecting the Ideal Bathroom Taps: Styles and Flow Performance | On Gravity Magazine",
    metaDescription: "Discover how to choose the perfect bathroom taps balancing modern aesthetics, water pressure compatibility, and long-lasting durability.",
    featured: true,
    trending: true,
    tags: ["Bathroom", "Life Style", "Home Improvement", "Interior Design"],
    content: [
      "Selecting the right bathroom taps is one of the most critical decisions when upgrading or remodeling your washroom. Beyond mere functionality, quality taps serve as visual focal points that unify your vanity, countertop, and overall interior theme.",
      "## 1. Matching Taps to Water Pressure Systems",
      "Before selecting a tap design, evaluate your home water pressure system. Low pressure gravity-fed systems require taps with wider internal waterways to ensure strong flow rates. Conversely, high-pressure combination boiler setups perform flawlessly with modern ceramic disc cartridge taps.",
      "## 2. Material Quality and Cartridge Tech",
      "Solid brass construction remains the gold standard for bathroom taps due to its natural corrosion resistance and structural integrity. Look for quarter-turn ceramic disc valves, which eliminate traditional rubber washers and prevent annoying drips over decades of continuous use.",
      "## 3. Popular Styles: Mixer Taps vs Pillar Taps",
      "Monobloc mixer taps combine hot and cold streams through a single spout, providing precise temperature control and sleek modern styling. Traditional pillar taps feature separate controls, ideal for period restorations or classic basin configurations.",
      "## Conclusion",
      "Investing in high-grade brass bathroom taps with ceramic cartridges guarantees seamless operation, elegant ergonomics, and enduring aesthetic satisfaction for years to come."
    ],
    faqs: [
      { question: "What is the difference between high pressure and low pressure taps?", answer: "Low pressure taps feature wider internal channels for gravity-fed tanks, whereas high pressure taps suit combi boilers." },
      { question: "Are brass bathroom taps better than stainless steel?", answer: "Solid brass offers superior longevity and corrosion resistance under daily moisture exposure." }
    ]
  },
  {
    id: "art-bathroom-tiles",
    slug: "bathroom-tiles",
    title: "Complete Guide to Choosing Bathroom Tiles: Durability, Slip Ratings and Style",
    excerpt: "Explore expert tips on selecting bathroom tiles across porcelain, ceramic, and natural stone for maximum safety and visual impact.",
    category: "life-style",
    author: {
      name: "Sophia Chen",
      role: "Lifestyle & Culture Specialist",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 7, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80&sig=bathroom-tiles-fixed",
    imageAlt: "High end porcelain bathroom tiles with marble veining texture",
    imageCaption: "Large format porcelain tiles create seamless waterproof surfaces with minimal grout lines.",
    metaTitle: "Complete Guide to Choosing Bathroom Tiles: Durability and Style | On Gravity Magazine",
    metaDescription: "Explore expert tips on selecting bathroom tiles across porcelain, ceramic, and natural stone for maximum safety and visual impact.",
    featured: true,
    trending: true,
    tags: ["Tiles", "Bathroom", "Life Style", "Architecture"],
    content: [
      "Bathroom tiles set the tone for your sanctuary. Selecting the right tile material, texture, and scale involves balancing moisture resistance with slip safety and long-term maintenance requirements.",
      "## 1. Porcelain vs Ceramic Bathroom Tiles",
      "Porcelain tiles are fired at higher temperatures, making them dense, non-porous, and exceptionally resistant to water absorption. Ceramic tiles are lighter and easier to cut, making them ideal for vertical accent walls and intricate backsplashes.",
      "## 2. Slip Resistance Ratings (R-Ratings)",
      "Safety is paramount in wet zone areas like shower floors. Select floor tiles with textured matte finishes rated R10 or higher to ensure firm underfoot grip when surfaces are wet.",
      "## 3. Large Format Tiles vs Mosaic Textures",
      "Large format porcelain tiles minimize grout lines, creating an expansive, hotel-suite aesthetic that is easy to wipe clean. Mosaics add rich tactile contrast and natural anti-slip traction under foot.",
      "## Conclusion",
      "Combining large format porcelain wall tiles with slip-resistant textured floor tiles provides an optimal blend of low maintenance, safety, and timeless elegance."
    ],
    faqs: [
      { question: "Which tiles are least slippery when wet?", answer: "Matte porcelain or micro-textured mosaic tiles provide superior slip resistance in wet shower zones." },
      { question: "Do large format tiles make small bathrooms look bigger?", answer: "Yes, fewer grout lines create an uninterrupted visual flow that expands perceived room size." }
    ]
  },
  {
    id: "art-hp-laptop",
    slug: "hp-laptop",
    title: "5 Must-Know Secrets Before Buying an HP Laptop: Specs, Display and Battery Life",
    excerpt: "Uncover essential buyer secrets for HP laptops spanning Spectre, Envy, and Pavilion lineups for work, creative tasks, and daily computing.",
    category: "tech",
    author: {
      name: "Elena Rostova",
      role: "Senior Technology Editor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80&sig=hp-laptop-fixed",
    imageAlt: "Sleek HP laptop sitting on wooden workspace desk",
    imageCaption: "HP Spectre and Envy laptops offer premium aluminum chassis with vibrant OLED displays.",
    metaTitle: "5 Must-Know Secrets Before Buying an HP Laptop | On Gravity Magazine",
    metaDescription: "Uncover essential buyer secrets for HP laptops spanning Spectre, Envy, and Pavilion lineups for work, creative tasks, and daily computing.",
    featured: true,
    trending: true,
    tags: ["HP Laptop", "Tech", "Laptops", "Gadgets"],
    content: [
      "HP laptops remain a dominant choice for professionals, students, and creators worldwide. However, choosing the right model requires navigating processor generations, display panels, and chassis build quality.",
      "## 1. Spectre x360 vs Envy: Premium Tier Comparison",
      "The flagship Spectre line features gem-cut CNC aluminum chassis and breathtaking OLED displays. The Envy series delivers near-flagship performance at a more accessible price point, making it a favorite for hybrid workers.",
      "## 2. Display Tech: OLED vs IPS Panels",
      "If you edit photo or video, choose an HP laptop configured with an OLED display. OLED panels deliver true pitch blacks and 100% DCI-P3 color accuracy, whereas IPS panels offer excellent battery efficiency for office documents.",
      "## 3. Battery Management and Fast Charging",
      "HP Fast Charge technology recharges batteries from 0% to 50% in approximately 30 minutes, ensuring you stay productive during travel and long meetings.",
      "## Conclusion",
      "Evaluating your primary workload—whether video editing, coding, or remote management—ensures you pick the optimal HP laptop configuration without overspending."
    ],
    faqs: [
      { question: "Is HP Spectre better than HP Envy?", answer: "HP Spectre features premium CNC aluminum build and superior OLED displays, while Envy offers high performance at lower pricing." },
      { question: "How long does an HP laptop battery last?", answer: "Modern HP Spectre and Envy laptops provide between 10 to 14 hours of real-world productivity battery life." }
    ]
  },
  {
    id: "art-dell-laptop",
    slug: "dell-laptop",
    title: "Is the Dell Laptop Worth It? Performance Specs, Build Quality and Real Verdict",
    excerpt: "Full breakdown of Dell XPS, Latitude, and Inspiron series evaluating build quality, thermal management, and long-term value.",
    category: "tech",
    author: {
      name: "Elena Rostova",
      role: "Senior Technology Editor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 6, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80&sig=dell-laptop-fixed",
    imageAlt: "Dell XPS laptop with sleek thin bezel screen display",
    imageCaption: "Dell XPS models feature carbon fiber palm rests and InfinityEdge display tech.",
    metaTitle: "Is the Dell Laptop Worth It? Specs and Performance | On Gravity Magazine",
    metaDescription: "Full breakdown of Dell XPS, Latitude, and Inspiron series evaluating build quality, thermal management, and long-term value.",
    featured: false,
    trending: true,
    tags: ["Dell Laptop", "Tech", "Hardware", "Computing"],
    content: [
      "Dell laptops are legendary for enterprise reliability and cutting-edge display technology. From the ultra-sleek XPS lineup to robust Latitude business machines, Dell offers options for every demanding computing application.",
      "## 1. InfinityEdge Display Dominance",
      "Dell's InfinityEdge display design eliminates thick screen bezels, giving you a 14-inch screen footprint inside a compact 13-inch laptop chassis.",
      "## 2. Keyboard Ergonomics and Thermal Design",
      "Dell XPS laptops utilize woven carbon fiber palm rests that remain cool to the touch during extended typing sessions. Dual intake fans and vapor chamber cooling maintain high clock speeds without thermal throttling.",
      "## Conclusion",
      "For power users seeking uncompromised build quality and gorgeous screens, Dell laptops remain a top tier investment."
    ],
    faqs: [
      { question: "What is the best Dell laptop line?", answer: "The Dell XPS series is widely regarded as the premium gold standard for performance and design." }
    ]
  },
  {
    id: "art-crypto-market",
    slug: "crypto-market",
    title: "Navigating Crypto Market Trends: Digital Assets, Regulation and Wealth Strategy",
    excerpt: "In-depth analysis of institutional digital asset adoption, market liquidity shifts, and regulatory frameworks shaping 2026.",
    category: "business",
    author: {
      name: "Marcus Vance",
      role: "Senior Editorial Director",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80&sig=crypto-market-fixed",
    imageAlt: "Digital cryptocurrency market chart showing financial trends",
    imageCaption: "Institutional investment capital and clear regulatory frameworks drive digital asset maturity.",
    metaTitle: "Navigating Crypto Market Trends | On Gravity Magazine",
    metaDescription: "In-depth analysis of institutional digital asset adoption, market liquidity shifts, and regulatory frameworks shaping 2026.",
    featured: true,
    trending: true,
    tags: ["Crypto", "Business", "Finance", "Markets"],
    content: [
      "The digital asset ecosystem has evolved from speculative trading into a cornerstone of institutional portfolio diversification. Institutional custody solutions, spot ETF liquidity, and clear regulatory guidelines have matured the market landscape.",
      "## 1. Institutional Custody and Liquidity Depth",
      "Major global financial centers have integrated digital assets into traditional wealth management portfolios. High-frequency liquidity providers and regulated asset managers have dramatically reduced volatility spreads.",
      "## 2. Regulatory Certainty and Market Integrity",
      "Global regulatory bodies have established standardized compliance frameworks for digital asset exchanges, boosting investor confidence and protecting consumer capital.",
      "## Conclusion",
      "A disciplined asset allocation strategy focusing on fundamental protocol utility remains key to long-term digital wealth preservation."
    ],
    faqs: [
      { question: "How does regulatory clarity impact crypto markets?", answer: "Clear legal frameworks attract institutional capital by reducing compliance risk and liquidity friction." }
    ]
  },
  {
    id: "art-health-tips",
    slug: "health-tips",
    title: "10 Daily Health Habits for Longevity, Peak Energy and Vitality",
    excerpt: "Science-backed daily wellness habits covering circadian biology, nutrition density, and stress resilience for optimal health.",
    category: "health",
    author: {
      name: "Sophia Chen",
      role: "Lifestyle & Culture Specialist",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 5, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80&sig=health-tips-fixed",
    imageAlt: "Person practicing morning yoga and wellness routine outdoors",
    imageCaption: "Consistent daily habits in sunlight exposure and movement compound into vibrant longevity.",
    metaTitle: "10 Daily Health Habits for Longevity and Vitality | On Gravity Magazine",
    metaDescription: "Science-backed daily wellness habits covering circadian biology, nutrition density, and stress resilience for optimal health.",
    featured: false,
    trending: true,
    tags: ["Health", "Wellness", "Longevity", "Lifestyle"],
    content: [
      "Optimizing daily energy levels and long-term health does not require radical overhauls. Science demonstrates that small, consistent daily habits yield exponential metabolic and cognitive improvements over time.",
      "## 1. Morning Sunlight and Circadian Alignment",
      "Getting 10 to 15 minutes of natural sunlight within an hour of waking resets your internal circadian clock, optimizing cortisol awakening responses and evening melatonin synthesis.",
      "## 2. Whole Food Nutrient Density and Hydration",
      "Prioritize whole, minimally processed foods rich in bioavailable micronutrients, healthy fats, and fiber. Hydrate consistently with electrolyte-balanced water to maintain optimal cellular function.",
      "## Conclusion",
      "Prioritizing sleep architecture, morning sunlight, and physical movement creates a sustainable foundation for lifelong vitality."
    ],
    faqs: [
      { question: "Why is morning sunlight important for energy?", answer: "Morning light triggers healthy cortisol release and sets your body clock for restful nighttime sleep." }
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
