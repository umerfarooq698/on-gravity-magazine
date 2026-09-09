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
    id: "art-elon-musk",
    slug: "elon-musk",
    title: "Elon Musk: First-Principles Engineering and Strategy Work",
    excerpt: "An investigative analysis into the operational philosophy, software architecture, and high-velocity iteration cycles driving ventures under Elon Musk.",
    metaTitle: "Elon Musk: First-Principles Engineering and Strategy Work | On Gravity Magazine",
    metaDescription: "In-depth executive feature exploring Elon Musk's technology leadership, manufacturing throughput. Read complete editorial report on Gravity.",
    content: [
      "The career and leadership philosophy of Elon Musk represent a transformative force across modern technology, industrial manufacturing, and global enterprise strategy. By championing first-principles engineering and aggressive iteration cycles, key initiatives under this vision have continuously challenged conventional market norms, disrupting legacy sectors ranging from autonomous mobility and aerospace to artificial intelligence and digital communications.",
      "## First-Principles Engineering and Vertical Integration",
      "At the core of this operational model lies an unyielding commitment to removing technical bottlenecks and streamlining complex engineering processes. Rather than relying on traditional industry supplier networks, emphasis is placed on vertical integration—insourcing critical component design, software architecture, and automated manufacturing protocols under a unified organizational umbrella.",
      "### Flat Management Structures and Rapid Telemetry Cycles",
      "Engineers working within these high-velocity environments operate under flat management structures designed to eliminate corporate bureaucracy. Cross-functional teams iterate rapidly on real-world prototypes, treating every test failure as invaluable telemetry data to refine subsequent hardware and software revisions.",
      "## Strategic Capital Allocation and Risk Management",
      "From a commercial standpoint, scaling multi-disciplinary ventures requires sophisticated capital allocation and strategic resource management. High-risk investments in orbital launch infrastructure, gigafactory battery production, and neural interface research demonstrate how long-term capital deployment can unlock entire new market categories despite intense skepticism from traditional financial analysts.",
      "## Performance Benchmarks and Agile Execution",
      "Comparing this agile, mission-driven approach against legacy corporate structures highlights stark operational differences. Traditional conglomerates often prioritize incremental quarter-over-quarter risk mitigation, whereas first-principles ventures accept short-term volatility to achieve exponential technological breakthroughs over multi-year horizons.",
      "### Iterative Manufacturing Throughput Metrics",
      "Key performance indicators across manufacturing throughput, launch cadence, and software deployment speeds consistently outpace industry averages. Continuous over-the-air updates and rapid hardware re-tooling allow products to evolve dynamically long after initial market release.",
      "## Executive Challenges and Regulatory Navigation",
      "Despite remarkable technological achievements, operating at extreme velocity presents distinct executive challenges. Aggressive production timelines, intense public scrutiny, regulatory compliance friction, and organizational burnout risks require continuous management oversight to ensure long-term operational sustainability.",
      "## Strategic Verdict and Future Horizons",
      "Looking ahead to the next decade, initiatives surrounding Elon Musk promise to push the boundaries of human capability even further. Editors at On Gravity Magazine will continue tracking key developments, regulatory shifts, and technological milestones as these visionary endeavors unfold on the global stage."
    ],
    faqs: [
      {
        question: "How does Elon Musk come up with these ideas?",
        answer: "He uses first-principles thinking—basically breaking a problem down to pure physics and building back up without following old corporate rules."
      },
      {
        question: "Why does he insist on making everything in-house?",
        answer: "Manufacturing in-house lets his teams fix designs instantly instead of waiting months for suppliers to send updated parts."
      },
      {
        question: "What is the secret behind Tesla and SpaceX speed?",
        answer: "They test early prototypes fast and treat every failure as useful telemetry data to improve the next version right away."
      }
    ],
    category: "business",
    author: {
      name: "Marcus Vance",
      role: "Chief Business & Strategy Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80&sig=elon-musk",
    imageAlt: "Executive leader presenting at high-tech factory facility",
    imageCaption: "Editorial portrait highlighting visionary industrial strategy.",
    featured: true,
    trending: true,
    tags: ["Leadership", "Business", "Engineering", "Innovation"]
  },
  {
    id: "art-bathtub-drain",
    slug: "bathtub-drain",
    title: "Bathtub Drain: Flow Rates, Flange Seals and Maintenance",
    excerpt: "A comprehensive practical guide to residential bathtub drain installation, P-trap clearance, flange seals, and maintenance standards.",
    metaTitle: "Bathtub Drain Installation and Flow Rate Standards | On Gravity Magazine",
    metaDescription: "Practical editorial review of bathtub drain fittings, pop-up stopper assemblies, P-trap clearance. Read complete home plumbing on Gravity.",
    content: [
      "Understanding bathtub drain assembly architecture, fluid dynamics, and sealing standards is essential for maintaining efficient residential plumbing performance. A properly engineered drain system prevents water pooling, contains sewer gas egress through integrated P-traps, and safeguards subfloor structures against catastrophic moisture intrusion.",
      "## Drain Assembly Anatomy and Flange Sealing Protocols",
      "Standard residential bathtub drain installations comprise three primary components: the threaded drain strainer flange, the overflow pipe assembly, and the underlying waste-and-overflow shoe. Achieving a watertight seal between the bathtub tub basin and the metallic shoe requires high-grade plumber's putty or 100 percent neutral-cure silicone sealant.",
      "### Plumber Putty Application and Torque Limits",
      "During installation, apply a uniform ring of plumber's putty beneath the stainless steel or brushed brass flange before threading it into the lower shoe. Tighten the flange securely using a dedicated dumbell drain wrench, ensuring balanced compression without over-torquing acrylic or fiberglass tub surfaces.",
      "## Stopper Mechanisms: Lift and Turn vs Pop Up Systems",
      "Evaluating drainage mechanisms reveals distinct operational trade-offs across lift-and-turn stoppers, push-button pop-ups, and lever-operated trip waste assemblies. Mechanical push-to-close stoppers offer clean visual aesthetics but require periodic removal to clear hair and soap scum buildup from internal spring cavities.",
      "## Flow Rate Dynamics and P-Trap Clearance Standards",
      "Proper flow rate velocity relies on uninhibited 1.5-inch or 2-inch PVC or ABS drain piping connected to a standard P-trap. Water pooling inside the tub basin during a shower typically indicates partial restriction inside the P-trap bend rather than faulty tub flange sealing.",
      "### Chemical Free Clog Removal Protocols",
      "To resolve slow drainage without harsh chemical solvents that erode rubber gaskets, utilize a flexible plastic zip-it snake tool to extract debris. For stubborn mineral deposits, flushing the assembly with hot water mixed with baking soda and white vinegar dissolves organic buildup safely.",
      "## Preventative Maintenance and Gasket Replacement",
      "Preventative maintenance schedules recommend inspecting overflow plate screws and rubber face gaskets every twelve months. Replacing dried or cracked overflow gaskets prevents hidden wall leaks during high water level bathing sessions.",
      "## Strategic Verdict and Plumbing Longevity",
      "Selecting heavy-duty solid brass waste assemblies over thin-walled plastic kits guarantees decades of leak-free service. Following structured installation and maintenance protocols protects residential property value while providing consistent, hassle-free utility."
    ],
    faqs: [
      {
        question: "Why does water drain very slowly from my bathtub?",
        answer: "Slow draining is almost always caused by hair and soap scum caught around the stopper mechanism or inside the upper P-trap bend."
      },
      {
        question: "Should I use plumber's putty or silicone for the tub drain?",
        answer: "Use plumber's putty for metal-on-metal or standard tub strainers, but use 100% silicone sealant if you have an acrylic or ABS plastic tub."
      }
    ],
    category: "life-style",
    author: {
      name: "Sophia Chen",
      role: "Home & Interior Architecture Columnist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=bathtub-drain",
    imageAlt: "Modern brass bathtub drain fitting installed in clean white tub",
    imageCaption: "Editorial photograph showing chrome tub drain hardware.",
    featured: false,
    trending: true,
    tags: ["Home", "Plumbing", "Interior", "Lifestyle"]
  },
  {
    id: "art-bathroom-tub",
    slug: "bathroom-tub",
    title: "Bathroom Tub Ergonomics: Acrylic vs Cast Iron Performance",
    excerpt: "An in-depth review of freestanding and alcove bathroom tubs, material thermal retention, subfloor structural loads, and luxury design.",
    metaTitle: "Bathroom Tub Materials and Ergonomic Design | On Gravity Magazine",
    metaDescription: "In-depth comparative analysis of freestanding acrylic bathroom tub models, cast iron heat retention, subfloor. Read full analysis on Gravity.",
    content: [
      "Selecting an ideal bathroom tub requires balancing architectural space planning, material thermal efficiency, structural weight capacity, and ergonomic bathing comfort. Whether designing a serene master suite sanctuary or remodeling a space-conscious guest bath, understanding tub engineering ensures lasting satisfaction.",
      "## Material Engineering: Acrylic vs Enameled Cast Iron",
      "The primary decision when selecting a bathroom tub revolves around material composition. Fiberglass-reinforced acrylic tubs offer lightweight versatility, complex ergonomic contouring, and ease of installation on upper residential floors. Conversely, heavy enameled cast iron tubs deliver unrivaled heat retention, scratch-resistant vitreous enamel surfaces, and timeless structural durability.",
      "### Subfloor Load Calculation for Cast Iron Tubs",
      "Installing a cast iron tub weighing over 400 pounds empty—and up to 900 pounds when filled with water and a bather—requires verifying subfloor joist structural load limits. Reinforcing floor joists with sistered lumber prevents long-term ceiling sagging on lower building levels.",
      "## Installation Styles: Freestanding vs Alcove Tubs",
      "Evaluating tub silhouettes highlights distinct spatial and maintenance characteristics. Alcove tubs fit snugly between three surrounding walls, maximizing floor space while integrating seamlessly with overhead shower tile assemblies. Freestanding soaking tubs create a striking visual centerpiece, requiring dedicated floor-mounted or wall-mounted filler valves.",
      "## Ergonomic Contours and Thermal Heat Retention",
      "Bathing comfort depends heavily on interior lumbar support angles and thermal mass. Tubs designed with a 115-to-125 degree slanted backrest support natural spinal posture during prolonged soaking sessions. Double-walled acrylic construction incorporates insulated air gaps that slow water cooling rates.",
      "### Hydrotherapy Jet Maintenance Protocols",
      "For whirlpool or air-jet tubs, routine maintenance requires flushing internal water lines monthly with specialized purge cleaners. Running jet systems periodically prevents biofilm accumulation inside flexible supply tubing.",
      "## Preventative Care and Non-Abrasive Cleaning",
      "Maintaining acrylic tub luster requires non-abrasive liquid cleaners and soft microfiber cloths. Harsh scouring powders or abrasive pads strip protective gelcoat finishes, creating microscopic scratches that trap dirt and mineral deposits.",
      "## Strategic Verdict and Remodeling Investment",
      "Investing in a high-quality bathroom tub enhances daily personal wellness while yielding strong return-on-investment during property resale. Matching tub dimensions to user body height and bathroom floorplans guarantees decades of luxurious relaxation."
    ],
    faqs: [
      {
        question: "Does an acrylic bathtub hold heat as well as cast iron?",
        answer: "Cast iron stays hot much longer once heated up, but double-walled acrylic holds initial water temperature very well without feeling freezing cold to sit in."
      },
      {
        question: "How much space do I need around a freestanding tub?",
        answer: "Leave at least 4 to 6 inches of open clearance between the tub walls and bathroom walls for easy cleaning and plumbing access."
      }
    ],
    category: "life-style",
    author: {
      name: "Sophia Chen",
      role: "Home & Interior Architecture Columnist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80&sig=bathroom-tub",
    imageAlt: "Luxury freestanding soaking bathtub in modern residential bathroom",
    imageCaption: "Architectural photograph of a freestanding acrylic soaking tub.",
    featured: false,
    trending: false,
    tags: ["Interior", "Design", "Home", "Lifestyle"]
  },
  {
    id: "art-samsung-tv",
    slug: "samsung-tv",
    title: "Samsung TV: Panel Brightness, 120Hz VRR and Performance",
    excerpt: "An expert hardware evaluation of Samsung TV display technology, local dimming zones, Neo QLED luminance, and smart home OS performance.",
    metaTitle: "Samsung TV Display and Gaming Benchmarks | On Gravity Magazine",
    metaDescription: "In-depth hardware review of Samsung TV panels, Quantum Dot luminance, 120Hz VRR latency, and Tizen. Read full technical analysis on Gravity.",
    content: [
      "Selecting and optimizing display technology for Samsung TV panels requires an in-depth understanding of panel architecture, peak luminance, color fidelity, and dynamic range capabilities. Modern consumer displays have evolved into sophisticated visual hubs engineered to deliver cinema-grade picture quality, ultra-low gaming latency, and seamless smart home platform connectivity.",
      "## Quantum Dot Luminance and Local Dimming Zones",
      "Panel technology centers on two dominant engineering approaches: self-emissive QD-OLED pixels and Quantum Dot Mini-LED backlighting arrays. Self-emissive pixels achieve perfect black levels by turning off individual sub-pixels completely, yielding infinite contrast ratios ideal for dark-room home theater setups. Conversely, Quantum Dot Mini-LED displays leverage thousands of microscopic LEDs to generate intense peak brightness exceeding 2,000 nits.",
      "### Local Dimming Algorithms and Anti-Halo Control",
      "Engineers utilize local dimming algorithms to control backlighting zones dynamically, minimizing halo artifacts around bright objects displayed against dark backgrounds. Coverage of the DCI-P3 cinematic color space regularly exceeds 98 percent, delivering rich, lifelike color volume across all brightness levels.",
      "## 4K Gaming Benchmarks: 120Hz VRR and Input Lag",
      "For gaming enthusiasts, modern 4K displays offer advanced high-frame-rate features including 120Hz and 144Hz variable refresh rates (VRR), Auto Low Latency Mode (ALLM), and sub-10 millisecond input lag responses. HDMI 2.1 bandwidth capability enables uncompressed 4K video transmission alongside Dolby Atmos eARC audio passthrough to premium soundbars and AV receivers.",
      "## Tizen OS Ergonomics and Soundbar Integration",
      "Evaluating smart TV platforms reveals significant software advancements in content discovery and voice navigation. Intuitive dashboard ergonomics, customizable home menus, and universal search functions allow users to navigate streaming services effortlesly while integrated smart home hubs control ambient lighting and connected peripherals.",
      "### Anti-Reflective Coating and Ambient Room Light",
      "Benchmark testing across ambient light reflections highlights the importance of anti-glare screen coatings. High-end panels incorporate anti-reflective layers that diffuse incoming sunlight, maintaining vivid picture clarity even in brightly illuminated living rooms.",
      "## Panel Reliability and Image Retention Safeguards",
      "While flagship display panels deliver astounding visual fidelity, potential buyers should evaluate room dimensions, viewing angles, and panel longevity factors. Ultra-wide viewing angle layers prevent color shift when sitting off-center, while built-in pixel refresh routines mitigate potential image retention over extended operational lifetimes.",
      "## Strategic Verdict and Consumer Outlook",
      "Future developments in display technology continue pushing boundaries through neural AI upscaling, ambient color temperature sensing, and energy-efficient panel designs. Samsung TV technology remains a standout highlight in modern consumer electronics, offering an unbeatable blend of performance, versatility, and visual immersive value."
    ],
    faqs: [
      {
        question: "Is QLED or OLED better for a bright living room?",
        answer: "QLED is great for bright rooms with lots of sunlight, while QD-OLED shines best in dark rooms with incredible deep blacks."
      },
      {
        question: "Do I need 120Hz for PS5 or Xbox gaming?",
        answer: "If you play fast action or sports games, 120Hz with HDMI 2.1 makes gameplay super smooth with virtually zero input lag."
      },
      {
        question: "How do I avoid screen burn-in on a smart TV?",
        answer: "Just leave automatic pixel refresh settings turned on and avoid keeping static pause screens on full brightness for hours."
      }
    ],
    category: "tech",
    author: {
      name: "Marcus Vance",
      role: "Senior Technology Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80&sig=samsung-tv",
    imageAlt: "4K QLED display panel showing vibrant HDR color content",
    imageCaption: "Editorial photograph for Samsung TV screen display.",
    featured: true,
    trending: true,
    tags: ["Samsung", "TV", "Tech", "Display"]
  },
  {
    id: "art-1",
    slug: "ai-generative-revolution-2026",
    title: "The Next Frontier of AI: Autonomous Agents and Workflows",
    excerpt: "How generative intelligence and multimodal agents are reshaping software engineering, creative arts, and global industry workflows.",
    metaTitle: "The Next Frontier of AI: Autonomous Agents and Workflows | On Gravity Magazine",
    metaDescription: "In-depth analysis of how multimodal AI agents and generative intelligence are transforming global industries in. Read full editorial report.",
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
    title: "Inside the Gala: Cinema Icons and Fashion Runway Trends",
    excerpt: "A front-row look at the most breathtaking red carpet couture, unexpected reunions, and viral celebrity moments of the season.",
    metaTitle: "Inside the Gala: Cinema Icons and Fashion Runway Trends | On Gravity Magazine",
    metaDescription: "Comprehensive red carpet report detailing haute couture fashion trends, celebrity arrivals, and behind-the-scenes. Read complete report on Gravity.",
    content: [
      "The annual Met Gala once again transformed the Metropolitan Museum of Art into a dazzling epicenter of high fashion, artistic expression, and star-studded spectacle.",
      "This year's theme, 'Chrono-Elegance', inspired designers to fuse historical period silhouettes with futuristic smart textiles. From glowing fiber-optic gowns to hand-embroidered velvet capes, the carpet was a masterclass in creative sartorial storytelling.",
      "Beyond the dazzling photo calls, the evening served a deeper purpose, raising millions for the museum's Costume Institute while spotlighting emerging global designers alongside historic fashion houses.",
      "As the night concluded, one message remained crystal clear: fashion is not merely clothing—it is a living, breathing reflection of our cultural zeitgeist."
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
    imageAlt: "High fashion red carpet event lighting with photographers",
    imageCaption: "Red carpet flash photography capturing haute couture arrivals.",
    featured: false,
    trending: true,
    tags: ["Fashion", "Celebrity", "Hollywood", "Culture"]
  },
  {
    id: "art-3",
    slug: "the-art-of-slow-living-2026",
    title: "The Art of Slow Living: Reclaiming Modern Everyday Calm",
    excerpt: "Discover how intentional daily rituals, digital sabbaticals, and mindful spaces foster deep mental well-being in a fast-paced world.",
    metaTitle: "The Art of Slow Living: Reclaiming Modern Everyday Calm | On Gravity Magazine",
    metaDescription: "Practical mindfulness guide on slow living practices, digital detox strategies, and intentional daily habits. Read complete wellness report on Gravity.",
    content: [
      "In an era defined by push notifications and constant connectivity, the movement toward 'Slow Living' has shifted from a niche wellness trend into a necessary lifestyle philosophy.",
      "At its core, slow living isn't about doing everything at a snail's pace; it is about doing things at the right pace. It encourages individuals to prioritize quality over quantity, presence over productivity, and meaningful engagement over superficial busyness.",
      "Incorporating small daily rituals—such as enjoying a quiet morning tea without screens, curating minimalist living spaces, or spending unhurried hours in nature—restores balance to overstimulated nervous systems.",
      "By intentionally slowing down, we make room for what truly matters: deeper relationships, heightened creativity, and a profound sense of inner peace."
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
    imageAlt: "Serene sunlit room with indoor plants and a cup of tea on a wooden table",
    imageCaption: "Minimalist living space designed for tranquil mindfulness and relaxation.",
    featured: false,
    trending: false,
    tags: ["Wellness", "Lifestyle", "Mindfulness", "Health"]
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
