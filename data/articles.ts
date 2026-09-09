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
    title: "Elon Musk: First-Principles Engineering and Strategy",
    excerpt: "An investigative analysis into the operational philosophy, software architecture, and high-velocity iteration cycles driving ventures under Elon Musk.",
    metaTitle: "Elon Musk: First-Principles Engineering and Strategy | On Gravity Magazine",
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
      role: "Senior Technology Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "8 min read",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80&sig=elon-musk",
    imageAlt: "Editorial portrait photograph of Elon Musk",
    imageCaption: "Editorial portrait of Elon Musk, CEO and technology innovator.",
    featured: true,
    trending: true,
    tags: ["ElonMusk", "Business", "Tech", "Leadership"]
  },
  {
    id: "art-bathtub-drain",
    slug: "bathtub-drain",
    title: "Bathtub Drain: Flow Rates, Seals and Clog Removal",
    excerpt: "A comprehensive practical guide to residential bathtub drain installation, P-trap clearance, flange seals, and maintenance standards.",
    metaTitle: "Bathtub Drain Maintenance and Installation Guide | On Gravity Magazine",
    metaDescription: "Expert guide on bathtub drain assemblies, P-trap seals, unclogging techniques, and preventing. Read complete technical breakdown on Gravity.",
    content: [
      "Ensuring optimal water drainage and maintaining proper plumbing standards for bathtub drain systems is essential for preventing structural water damage, mold growth, and unpleasant odors in modern residential bathrooms. Over time, hair, soap residue, and mineral deposits accumulate inside drain traps, reducing water flow rates and straining household waste pipes. Implementing effective plumbing practices from the outset protects subflooring and ensures long-term system reliability.",
      "## Drain Pipe Diameter and Overflow Valve Standards",
      "Standard residential bathtub drain systems operate using a combination of a waste pipe, overflow tube, P-trap assembly, and rubber gasket seals. The standard drain opening diameter measures 1.5 inches, connecting directly to a curved P-trap designed to trap a standing water barrier that prevents sewer gas backup into living spaces. Choosing heavy-duty solid brass or thick PVC fittings ensures durability against hot water, chemical cleaners, and daily mechanical wear.",
      "### Rubber Gasket and Flange Sealing Instructions",
      "When installing a new drain kit, applying a smooth ring of professional plumber's putty beneath the tub flange creates an airtight, watertight seal. Tightening the lower locknut securely from beneath the basin compresses the rubber washer against the fiberglass or porcelain surface, preventing subtle leaks that could otherwise rot wooden support joists over time.",
      "## Clearing Tough Clogs: Chemical-Free Snaking and Trap Maintenance",
      "Clearing stubborn drain clogs requires a systematic approach prioritizing non-damaging mechanical methods before resorting to harsh chemical agents. Utilizing a flexible plastic hair snake or manual auger allows homeowners to extract trapped debris directly from the upper elbow without disassembling the main pipe network. Periodic warm water flushes mixed with baking soda and white vinegar dissolve organic buildup naturally while protecting pipe walls from corrosion.",
      "## Flow Rate Benchmarks and Stopper Mechanisms",
      "Comparing traditional push-pull stoppers against modern tip-toe and lever-operated overflow mechanisms reveals distinct usability advantages. Tip-toe stoppers feature fewer internal moving parts, making them significantly easier to remove and clean, whereas trip-lever designs offer a sleek flush finish but require occasional linkage adjustments inside the overflow pipe.",
      "### Flow Rate Benchmarks and Pressure Checks",
      "Laboratory flow rate benchmarks indicate that a clean, properly vented 1.5-inch bathtub drain evacuates standing water at approximately 5 to 7 gallons per minute. Any drop below 3 gallons per minute signals partial blockage or inadequate atmospheric venting within the main waste line stack.",
      "## When to Hire a Licensed Plumber vs DIY Repair",
      "While DIY maintenance resolves minor clogs and surface seal replacements, severe main line blockages, cracked cast iron drain stacks, or persistent subfloor leaks warrant immediate attention from a licensed plumber. Attempting excessive force on rusted metal fittings can fracture tub basins or create costly structural plumbing emergencies.",
      "## Preventative Maintenance Roadmap",
      "Long-term maintenance of bathtub drain systems centers on simple preventative habits: installing mesh hair catchers, avoiding heavy oil disposal down bath drains, and inspecting silicone caulk lines annually. Following these guidelines ensures smooth drainage, pristine hygiene, and durable performance for years to come."
    ],
    faqs: [
      {
        question: "What size pipe does a bath drain usually need?",
        answer: "A standard tub drain uses a 1.5-inch pipe connected to a P-trap—just right for keeping flow fast and preventing odors."
      },
      {
        question: "How do I fix a leaking tub flange seal?",
        answer: "Unscrew the drain flange, clear out old dried putty, apply fresh plumber's putty, and tighten the washer underneath securely."
      },
      {
        question: "What's the best way to keep bath drains clear?",
        answer: "Put a simple mesh hair catcher over the drain and flush it with hot water once a month—it saves you from major clogs later."
      }
    ],
    category: "life-style",
    author: {
      name: "Sophia Chen",
      role: "Lifestyle & Wellness Columnist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80&sig=bathtub-drain",
    imageAlt: "Clawfoot bathtub and drain fitting",
    imageCaption: "Editorial photograph for bathtub drain assembly.",
    featured: true,
    trending: true,
    tags: ["Plumbing", "Home", "DIY", "Lifestyle"]
  },
  {
    id: "art-bathroom-tub",
    slug: "bathroom-tub",
    title: "Bathroom Tub Ergonomics: Acrylic vs Cast Iron Guide",
    excerpt: "An in-depth review of freestanding and alcove bathroom tubs, material thermal retention, subfloor structural loads, and luxury design.",
    metaTitle: "Bathroom Tub Materials and Ergonomic Installation | On Gravity Magazine",
    metaDescription: "Comprehensive evaluation of modern bathroom tubs, acrylic vs cast iron, subfloor reinforcement, and hydrotherapy jets. Read full report now.",
    content: [
      "Designing a serene bathroom tub space combines architectural aesthetics with structural engineering and ergonomic comfort. As homeowners increasingly turn to home wellness retreats, selecting the right tub basin material, overflow depth, and hydrotherapy jet configuration shapes both long-term property value and daily relaxation routines.",
      "## Material Comparison: Acrylic, Fiberglass, and Cast Iron",
      "Evaluating tub materials reveals significant performance trade-offs in heat retention, weight, and surface scratch resistance. Cast iron tubs offer unmatched thermal inertia, keeping bathwater warm for hours, but require reinforced subflooring due to empty weights exceeding 300 pounds. Modern acrylic basins provide excellent heat retention with lightweight flexibility, allowing intricate freestanding silhouettes.",
      "### Subfloor Reinforcement and Weight Distribution",
      "Prior to installing heavy soaking tubs, contractors must verify floor joist load ratings. A fully filled cast iron tub with an adult bather can exert over 800 pounds of localized pressure, necessitating doubled floor joists or steel support posts beneath the bathroom subfloor.",
      "## Freestanding vs Alcove Architectural Layouts",
      "Alcove tub designs maximize space efficiency in standard 60-inch bathroom footprints, featuring integrated tile flanges that protect drywall from splash water. In contrast, freestanding soaking tubs create dramatic focal points in spacious master suites, requiring floor-mounted or wall-mounted filler faucets.",
      "## Hydrotherapy and Air Jet Maintenance Protocols",
      "Air jet and whirlpool tubs utilize motorized pumps to recirculate water through localized jets for deep muscle relaxation. Maintaining hygiene in jetted tubs requires monthly flushing with specialized purge solutions to prevent biofilms from colonizing internal fluid lines.",
      "### Water Temperature and Circulation Benchmarks",
      "Optimal bathwater soak temperature ranges between 98°F and 102°F. High-efficiency thermostatic mixing valves prevent accidental scalding while maintaining stable water temperature during extended baths.",
      "## Cleaning Protocols for Gloss and Matte Finishes",
      "Protecting acrylic and porcelain tub surfaces from dulling requires non-abrasive liquid cleansers and soft microfiber cloths. Harsh scrubbing powders or abrasive pads strip protective gel coats, creating microscopic pores that harbor soap scum and mineral stains.",
      "## Strategic Verdict for Modern Bath Spaces",
      "Investing in a well-engineered bathroom tub elevates daily self-care while anchoring bathroom interior design. Whether opting for a sleek minimalist freestanding vessel or a durable alcove tub, matching basin ergonomics to household usage ensures years of peaceful relaxation."
    ],
    faqs: [
      {
        question: "Should I pick acrylic or cast iron for a tub?",
        answer: "Cast iron holds heat longer but is super heavy, while high-grade acrylic stays warm, costs less, and is way easier to install."
      },
      {
        question: "What is the most popular standard tub size?",
        answer: "A standard alcove tub measures 60 inches long by 30 to 32 inches wide—perfect for most standard bathroom layouts."
      },
      {
        question: "How do I keep an acrylic tub shiny without scratching it?",
        answer: "Use soft liquid dish soap and a microfiber cloth. Avoid harsh scrubbing powders that can dull the smooth protective gel coat."
      }
    ],
    category: "life-style",
    author: {
      name: "Sophia Chen",
      role: "Lifestyle & Wellness Columnist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
    },
    publishedAt: "Sept 8, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80&sig=bathroom-tub",
    imageAlt: "Modern luxury freestanding bathtub",
    imageCaption: "Editorial photograph of a modern luxury bathroom soaking tub.",
    featured: true,
    trending: true,
    tags: ["Bathroom", "HomeDesign", "Lifestyle", "Wellness"]
  },
  {
    id: "art-samsung-tv",
    slug: "samsung-tv",
    title: "Samsung TV: Panel Brightness, 120Hz VRR and Specs",
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
    imageAlt: "4K QLED display panel",
    imageCaption: "Editorial photograph for Samsung TV screen display.",
    featured: true,
    trending: true,
    tags: ["Samsung", "TV", "Tech", "Display"]
  },
  {
    id: "art-1",
    slug: "ai-generative-revolution-2026",
    title: "The Next Frontier of AI: Autonomous Agents and Future",
    excerpt: "How generative intelligence and multimodal agents are reshaping software engineering, creative arts, and global industry workflows.",
    metaTitle: "The Next Frontier of AI: Autonomous Agents and Future | On Gravity Magazine",
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
    title: "Inside the Gala: Cinema Icons and Fashion Trends",
    excerpt: "A front-row look at the most breathtaking red carpet couture, unexpected reunions, and viral celebrity moments of the season.",
    metaTitle: "Inside the Gala: Red Carpet Fashion and Highlights | On Gravity Magazine",
    metaDescription: "Front row coverage of the most stunning red carpet outfits, cinema icons, and viral celebrity highlights at the 2026 Gala. Read full report.",
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
    title: "The Art of Slow Living: Reclaiming Calm and Balance",
    excerpt: "Simple habits, ergonomic spaces, and intentional routines that help restore focus, balance, and deep personal fulfillment.",
    metaTitle: "The Art of Slow Living and Mindful Wellness | On Gravity Magazine",
    metaDescription: "Discover how slow living habits and intentional boundaries restore mental focus, peace, and. Read complete editorial report on Gravity site.",
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
