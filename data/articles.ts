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
    "id": "art-bathroom-tiles",
    "slug": "bathroom-tiles",
    "title": "Complete Breakdown of Bathroom Tiles: Durability, Slip Ratings and Style",
    "metaTitle": "Complete Breakdown of Bathroom Tiles: Durability, Slip Ratings and Style | On Gravity Magazine",
    "metaDescription": "Explore expert tips on selecting bathroom tiles across porcelain, ceramic, and natural stone for maximum safety, slip ratings, and design.",
    "excerpt": "Explore expert tips on selecting bathroom tiles across porcelain, ceramic, and natural stone for maximum safety, slip ratings, and design.",
    "content": [
      "Bathroom tiles set the tone for your sanctuary. Selecting the right tile material, texture, and scale involves balancing moisture resistance with slip safety and long-term maintenance requirements.",
      "## 1. Porcelain vs Ceramic Bathroom Tiles",
      "Porcelain tiles are fired at higher temperatures, making them dense, non-porous, and exceptionally resistant to water absorption. Ceramic tiles are lighter and easier to cut, making them ideal for vertical accent walls and backsplashes.",
      "## 2. Slip Resistance Ratings (R-Ratings)",
      "Safety is paramount in wet zone areas like shower floors. Select floor tiles with textured matte finishes rated R10 or higher to ensure firm underfoot grip when surfaces are wet.",
      "## 3. Large Format Tiles vs Mosaic Textures",
      "Large format porcelain tiles minimize grout lines, creating an expansive, hotel-suite aesthetic that is easy to wipe clean. Mosaics add rich tactile contrast and natural anti-slip traction under foot.",
      "## 4. Grout Sealing and Water Resistance",
      "Proper epoxy grout selection and sealant application prevent moisture infiltration behind tile backer boards, inhibiting mold growth and maintaining pristine grout lines.",
      "## 5. Lighting and Color Palette Integration",
      "Pairing light-reflecting glossy wall tiles with warm LED vanity illumination expands small washroom spaces, while dark slate floor tiles ground the room with dramatic elegance.",
      "## Conclusion",
      "Combining large format porcelain wall tiles with slip-resistant textured floor tiles provides an optimal blend of low maintenance, safety, and timeless elegance."
    ],
    "faqs": [
      {
        "question": "Which tiles are least slippery when wet in a bathroom?",
        "answer": "Matte porcelain or micro-textured mosaic tiles provide superior slip resistance in wet shower zones."
      },
      {
        "question": "Do large format bathroom tiles make small washrooms look bigger?",
        "answer": "Yes, fewer grout lines create an uninterrupted visual flow that expands perceived room size."
      },
      {
        "question": "How often should bathroom tile grout be sealed?",
        "answer": "Standard cementitious tile grout should be sealed annually to prevent moisture absorption and staining."
      }
    ],
    "category": "life-style",
    "author": {
      "name": "Sophia Chen",
      "role": "Lifestyle and Wellness Columnist",
      "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    "publishedAt": "Sep 10, 2026",
    "readTime": "6 min read",
    "imageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "High resolution photograph of bathroom tiles",
    "imageCaption": "Modern luxury bathroom with large format porcelain floor tiles.",
    "featured": true,
    "trending": true,
    "tags": [
      "BATHROOM",
      "TILES",
      "INTERIOR",
      "LIFE-STYLE",
      "EDITORIAL"
    ]
  },
  {
    "id": "art-5-best-hp-laptops",
    "slug": "5-best-hp-laptops",
    "title": "5 Best HP Laptops: Performance, Specs and Top Picks",
    "metaTitle": "5 Best HP Laptops: Performance, Specs and Top Picks | On Gravity Magazine",
    "metaDescription": "An in-depth review of 5 best HP laptops, comparing Spectre, Envy, OMEN, Pavilion, and ProBook models for productivity, gaming, and battery life.",
    "excerpt": "An in-depth review of 5 best HP laptops, comparing Spectre, Envy, OMEN, Pavilion, and ProBook models for productivity, gaming, and battery life.",
    "content": [
      "Selecting the ideal HP laptop requires matching your specific computing workflow with the right chassis architecture, display technology, and processor generation. HP offers distinct product lines designed for business executives, creative professionals, students, and competitive gamers.",
      "## 1. HP Spectre x360 14: Ultimate Convertible Elegance",
      "The HP Spectre x360 remains the flagship 2-in-1 convertible, featuring a breathtaking 2.8K OLED touch display, Intel Core Ultra performance, and precision CNC aluminum craftsmanship. Its 360-degree hinge seamlessly transitions between laptop, tent, and tablet modes for versatile productivity.",
      "## 2. HP Envy x360 16: Creative Powerhouse for Content Creators",
      "Engineered for photo editing, video rendering, and multitasking, the HP Envy x360 pairs vibrant colour-calibrated displays with dedicated graphics options. Advanced thermals keep the system cool under heavy creative workloads.",
      "## 3. HP OMEN 16: High-Frame-Rate Gaming Rig",
      "Gamers demanding fluid 1440p gameplay will appreciate the HP OMEN 16. Equipped with NVIDIA GeForce RTX 40-series GPUs, high-refresh rate displays, and Tempest Cooling technology, it delivers unthrottled desktop-class performance.",
      "## 4. HP Pavilion Plus 14: Value-Packed Everyday Laptop",
      "The Pavilion Plus 14 delivers premium features—including an all-metal chassis, crisp 120Hz display, and rapid charging—at an accessible price point. It represents an exceptional choice for students and remote workers.",
      "## 5. HP ProBook 450 G10: Enterprise Reliability and Security",
      "Built for corporate security and daily endurance, the ProBook 450 G10 features HP Wolf Pro Security, spill-resistant keyboard design, and extensive I/O port selection for seamless office connectivity.",
      "## Conclusion",
      "Whether you prioritize OLED visual brilliance, raw gaming frame rates, or rugged business durability, HP's lineup provides a tailored laptop solution for every performance requirement."
    ],
    "faqs": [
      {
        "question": "Which HP laptop line is best for battery life?",
        "answer": "The HP Spectre x360 and HP Envy series consistently offer 12+ hours of real-world battery endurance."
      },
      {
        "question": "Is HP Spectre better than HP Pavilion?",
        "answer": "Yes, HP Spectre is HP's premium flagship line with superior aluminum build quality, OLED screens, and higher specs."
      },
      {
        "question": "Are HP laptops good for long-term reliability?",
        "answer": "HP laptops score exceptionally high in build quality, keyboard comfort, and long-term hardware reliability."
      }
    ],
    "category": "tech",
    "author": {
      "name": "Marcus Vance",
      "role": "Senior Technology Editor",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    "publishedAt": "Sep 10, 2026",
    "readTime": "7 min read",
    "imageUrl": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "High resolution photograph of 5 best hp laptops",
    "imageCaption": "Premium HP laptops tested for battery life, display accuracy, and performance.",
    "featured": true,
    "trending": true,
    "tags": [
      "HP",
      "LAPTOP",
      "TECH",
      "HARDWARE",
      "EDITORIAL"
    ]
  },
  {
    "id": "art-dell-laptop",
    "slug": "dell-laptop",
    "title": "Is the Dell Laptop Worth It? Performance Specs, Pricing and Verdict",
    "metaTitle": "Is the Dell Laptop Worth It? Performance Specs, Pricing and Verdict | On Gravity Magazine",
    "metaDescription": "An in-depth review of Dell laptops, evaluating Dell XPS, Latitude, and Alienware series for build quality, display performance, and long-term value.",
    "excerpt": "An in-depth review of Dell laptops, evaluating Dell XPS, Latitude, and Alienware series for build quality, display performance, and long-term value.",
    "content": [
      "Dell laptops have long served as benchmark machines across enterprise corporate environments, creative studios, and competitive gaming arenas. From the iconically sleek XPS lineup to heavy-duty Alienware rigs, Dell balances industrial engineering with reliable customer support.",
      "## Dell XPS Series: The Pinnacle of Windows Ultrabooks",
      "Dell XPS laptops set industry standards with InfinityEdge narrow bezel displays, machined aluminum enclosures, and woven carbon fiber palm rests. Offering up to 4K OLED touchscreens, they excel in color accuracy and portal productivity.",
      "## Alienware and Dell G-Series Gaming Performance",
      "For immersive high-resolution gaming, Alienware models offer vapor chamber cooling, mechanical Cherry MX laptop switches, and top-tier GPUs. Dell G-series offers similar high-frame gaming performance in budget-friendly chassis.",
      "## Enterprise Fleet Security with Dell Latitude",
      "Dell Latitude laptops lead in enterprise IT manageability, featuring vPro processor options, hardware TPM encryption, and modular repairability for business deployments.",
      "## Conclusion",
      "Dell laptops offer industry-leading build quality, versatile hardware tiers, and dependable global support, making them a worthy investment for professionals and enthusiasts alike."
    ],
    "faqs": [
      {
        "question": "What makes Dell XPS laptops stand out?",
        "answer": "Dell XPS laptops feature ultra-thin InfinityEdge displays, premium aluminum construction, and high performance."
      },
      {
        "question": "How long does a Dell laptop typically last?",
        "answer": "With regular software maintenance, a Dell laptop typically provides 4 to 6 years of reliable daily service."
      }
    ],
    "category": "tech",
    "author": {
      "name": "Marcus Vance",
      "role": "Senior Technology Editor",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    "publishedAt": "Sep 10, 2026",
    "readTime": "5 min read",
    "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "High resolution photograph of dell laptop",
    "imageCaption": "Dell XPS workstation displaying high-resolution color calibrated graphics.",
    "featured": false,
    "trending": true,
    "tags": [
      "DELL",
      "LAPTOP",
      "TECH",
      "HARDWARE"
    ]
  },
  {
    "id": "art-celebrity-fashion",
    "slug": "celebrity-red-carpet-fashion",
    "title": "Celebrity Red Carpet Fashion: Iconic Looks, Designers and Runway Trends",
    "metaTitle": "Celebrity Red Carpet Fashion: Iconic Looks, Designers and Runway Trends | On Gravity Magazine",
    "metaDescription": "Explore the most influential celebrity red carpet fashion moments, haute couture trends, and award season style breakdowns.",
    "excerpt": "Explore the most influential celebrity red carpet fashion moments, haute couture trends, and award season style breakdowns.",
    "content": [
      "Red carpet events serve as the ultimate stage where high fashion, celebrity influence, and pop culture intersect. From vintage archival revivals to custom haute couture creations, celebrity fashion shapes global style trends for seasons to come.",
      "## 1. Archival Vintage Revivals",
      "Recent award seasons have witnessed a dramatic shift toward vintage runway archival pieces from iconic fashion houses like Versace, Mugler, and Chanel. Celebrities and stylists prioritize fashion history, sustainability, and rarity over off-the-rack modern looks.",
      "## 2. Sculptural Silhouettes and Avant-Garde Tailoring",
      "Subtle minimalism has given way to dramatic architectural silhouettes, featuring hand-beaded corsetry, dramatic trains, and metallic metalwork crafted by master couturiers.",
      "## 3. Tailored Gender-Fluid Menswear",
      "Menswear on the red carpet has undergone a revolution. Classic tuxedo constraints have been replaced by vibrant silk suits, embroidered capes, and jewel-encrusted accessories.",
      "## Conclusion",
      "Celebrity red carpet fashion continues to redefine glamour, pushing creative boundaries and serving as an inspiration for global fashion lovers."
    ],
    "faqs": [
      {
        "question": "Who designs most celebrity red carpet dresses?",
        "answer": "Leading luxury fashion houses like Schiaparelli, Dior, Chanel, Versace, and Balenciaga craft custom couture gowns."
      },
      {
        "question": "Do celebrities get to keep their red carpet outfits?",
        "answer": "Most red carpet outfits are loaned by fashion houses and returned immediately after the event."
      }
    ],
    "category": "celebrity",
    "author": {
      "name": "Elena Rostova",
      "role": "Pop Culture Lead",
      "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    },
    "publishedAt": "Sep 10, 2026",
    "readTime": "5 min read",
    "imageUrl": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "High resolution photograph of celebrity red carpet fashion",
    "imageCaption": "Haute couture gown featured on the red carpet at exclusive gala event.",
    "featured": true,
    "trending": false,
    "tags": [
      "CELEBRITY",
      "FASHION",
      "RED-CARPET",
      "STYLE"
    ]
  },
  {
    "id": "art-smart-home-automation",
    "slug": "smart-home-hub-automation",
    "title": "Smart Home Hub Automation: Protocols, Setup and Seamless Control",
    "metaTitle": "Smart Home Hub Automation: Protocols, Setup and Seamless Control | On Gravity Magazine",
    "metaDescription": "Comprehensive review of smart home hub automation systems, Matter protocol integration, and voice control ecosystems.",
    "excerpt": "Comprehensive review of smart home hub automation systems, Matter protocol integration, and voice control ecosystems.",
    "content": [
      "Building a connected home ecosystem requires choosing a central automation hub that unifies lighting, climate control, security sensors, and audio systems across your residence.",
      "## The Rise of Matter and Thread Connectivity",
      "The universal Matter connectivity standard enables cross-platform interoperability between Apple Home, Google Home, Amazon Alexa, and Samsung SmartThings devices, eliminating walled garden restrictions.",
      "## Local Processing vs Cloud Automation",
      "Advanced smart home hubs prioritize local network processing over cloud servers, ensuring instantaneous routine execution and operational privacy even during internet outages.",
      "## Conclusion",
      "Investing in a Matter-compatible smart home hub delivers low-latency automation, effortless expansion, and peace of mind."
    ],
    "faqs": [
      {
        "question": "What is the Matter protocol in smart homes?",
        "answer": "Matter is a open-source connectivity standard allowing devices from Apple, Google, Amazon, and Samsung to work together seamlessly."
      },
      {
        "question": "Do smart home hubs work without internet?",
        "answer": "Hubs supporting local processing execute home routines and sensor triggers even if the main internet connection drops."
      }
    ],
    "category": "tech",
    "author": {
      "name": "Marcus Vance",
      "role": "Senior Technology Editor",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    "publishedAt": "Sep 10, 2026",
    "readTime": "5 min read",
    "imageUrl": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "High resolution photograph of smart home hub automation",
    "imageCaption": "Smart home control interface managing lighting and climate automation.",
    "featured": false,
    "trending": true,
    "tags": [
      "SMART-HOME",
      "AUTOMATION",
      "TECH",
      "IOT"
    ]
  },
  {
    "id": "art-cold-shower-health",
    "slug": "cold-shower-health-benefits",
    "title": "Cold Shower Health Benefits: Circulation, Recovery and Immunity Boost",
    "metaTitle": "Cold Shower Health Benefits: Circulation, Recovery and Immunity Boost | On Gravity Magazine",
    "metaDescription": "Learn the science-backed health benefits of cold showers, cold hydrotherapy protocols, and dopamine enhancement.",
    "excerpt": "Learn the science-backed health benefits of cold showers, cold hydrotherapy protocols, and dopamine enhancement.",
    "content": [
      "Cold water immersion and daily cold exposure have gained immense popularity as powerful daily wellness practices for stimulating circulation, lowering inflammation, and sharpening mental clarity.",
      "## 1. Cardiovascular Circulation and Vascular Tone",
      "Cold water exposure triggers rapid vasoconstriction followed by compensatory vasodilation, prompting oxygenated blood flow throughout vital organs and muscle tissue.",
      "## 2. Dopamine Elevation and Sustained Mental Energy",
      "Studies indicate that cold hydrotherapy induces a prolonged increase in baseline dopamine levels, enhancing focus, mood resilience, and energy without caffeine crashes.",
      "## 3. Muscle Recovery and Inflammation Reduction",
      "Athletes utilize cold water exposure following intense workouts to reduce delayed onset muscle soreness (DOMS) and accelerate physical recovery cycles.",
      "## Conclusion",
      "Starting with 30-second cold rinses builds mental resilience, reinvigorates circulation, and provides a natural energy boost for daily life."
    ],
    "faqs": [
      {
        "question": "How long should a cold shower last for benefits?",
        "answer": "Research shows 2 to 3 minutes of cold exposure (around 15°C / 59°F) is sufficient for physiological benefits."
      },
      {
        "question": "Is a cold shower safe every morning?",
        "answer": "Yes, for healthy individuals, brief daily cold showers are safe and invigorate the nervous system."
      }
    ],
    "category": "health",
    "author": {
      "name": "Sophia Chen",
      "role": "Lifestyle and Wellness Columnist",
      "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    "publishedAt": "Sep 10, 2026",
    "readTime": "4 min read",
    "imageUrl": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    "imageAlt": "High resolution photograph of cold shower health benefits",
    "imageCaption": "Refreshing cold water hydrotherapy setup for alertness and recovery.",
    "featured": false,
    "trending": false,
    "tags": [
      "COLD-SHOWER",
      "HEALTH",
      "WELLNESS",
      "RECOVERY"
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
