/**
 * Samsung AU CRO Knowledge Base
 *
 * Static research data extracted from Iris's Samsung AU website analysis.
 * This provides structured context for the CRO idea generator.
 */

// ─── Page Types ───────────────────────────────────────────────────────────

export interface PageType {
  name: string;
  urlPattern: string;
  purpose: string;
  croPotential: "high" | "medium" | "low";
}

export const PAGE_TYPES: PageType[] = [
  {
    name: "Homepage",
    urlPattern: "/au/",
    purpose: "Hero KV + product showcases + explore carousels",
    croPotential: "high",
  },
  {
    name: "Category (PLP)",
    urlPattern: "/au/smartphones/all-smartphones/",
    purpose: "Product listing with filters",
    croPotential: "high",
  },
  {
    name: "Product Detail/Buy",
    urlPattern: "/au/smartphones/galaxy-s26-ultra/buy/",
    purpose: "Configurator + purchase",
    croPotential: "high",
  },
  {
    name: "Deal/Offer Hub",
    urlPattern: "/au/offer/deals/",
    purpose: "Promotional offers, bundles",
    croPotential: "high",
  },
  {
    name: "Trade-In",
    urlPattern: "/au/trade-in/",
    purpose: "Trade-in value calculator",
    croPotential: "high",
  },
  {
    name: "Education/Gov Store",
    urlPattern: "/au/offer/samsung-education-store/",
    purpose: "Affinity discount portals",
    croPotential: "medium",
  },
  {
    name: "Cart",
    urlPattern: "shop.samsung.com/au/cart",
    purpose: "Shopping cart",
    croPotential: "high",
  },
  {
    name: "Checkout",
    urlPattern: "shop.samsung.com/au/checkout",
    purpose: "Payment flow",
    croPotential: "high",
  },
];

// ─── Component Catalog ────────────────────────────────────────────────────

export interface ComponentInfo {
  className: string;
  name: string;
  location: string;
  croNotes: string;
}

export const COMPONENTS: ComponentInfo[] = [
  {
    className: "hd08-hero-kv-home",
    name: "Main Hero Banner",
    location: "Homepage",
    croNotes:
      "Large visual with text overlays and CTAs. Multiple competing CTAs could be simplified. Mobile/desktop text alignment differences suggest responsive optimization opportunities.",
  },
  {
    className: "hubble-price-bar",
    name: "Sticky Price Bar",
    location: "Product Buy Page",
    croNotes:
      "Contains total price, delivery info, add-to-cart CTA, payment options. Could test urgency elements (stock indicators, shipping deadlines). Trade-in price could be shown first. Monthly payment could be highlighted.",
  },
  {
    className: "hubble-product__options",
    name: "Product Configurator",
    location: "Product Buy Page",
    croNotes:
      "Color/storage/carrier selectors + trade-in toggle. Trade-in toggle is currently opt-in and could be more prominent. Disabled out-of-stock states could include 'notify me' options.",
  },
  {
    className: "pd17-combo-package-api",
    name: "Bundle Builder",
    location: "Product Buy Page",
    croNotes:
      "Bundle builder with discount displays, bundle cards, total savings. Discount display could be more compelling. Pre-built bundles with clear savings work well for electronics.",
  },
  {
    className: "hubble-featured-reviews",
    name: "Customer Reviews",
    location: "Product Buy Page",
    croNotes:
      "Reviews section exists but could be more prominent. Star ratings not visible on category cards. UGC integration opportunity.",
  },
  {
    className: "hubble-offer-banner-v2",
    name: "Promotional Offer Banners",
    location: "Product Buy Page",
    croNotes:
      "Promotional offer banners with CTAs. Could be more dynamic with countdown timers for limited-time offers.",
  },
  {
    className: "co73-feature-cards",
    name: "Feature Card Grid",
    location: "Homepage",
    croNotes:
      "4-column feature card grid with images, headlines, text, links. Could benefit from A/B testing different layouts and content hierarchy.",
  },
  {
    className: "co75-explore-carousel",
    name: "Explore Carousel",
    location: "Homepage",
    croNotes:
      "Swiper-based product/image carousel with video support. Autoplay timing and navigation could be tested.",
  },
  {
    className: "co78-recommended-product-carousel",
    name: "Recommended Products",
    location: "Homepage",
    croNotes:
      "Product recommendation slider. Could incorporate personalized recommendations based on browsing history.",
  },
  {
    className: "offers-product-card-grid",
    name: "Offers Product Grid",
    location: "Deals/Offers Page",
    croNotes:
      "Tabbed/swiper product card grid with pricing and promo flags. Could add urgency indicators for limited-time deals.",
  },
  {
    className: "nv00-gnb-v4",
    name: "Global Navigation",
    location: "Site-wide",
    croNotes:
      "Multi-level mega menu with product subcategories and thumbnails. Cart icon has count badge but doesn't show saved items. Mobile uses hamburger with separate behaviors.",
  },
  {
    className: "fn23-personalization",
    name: "Personalization Section",
    location: "Homepage",
    croNotes:
      "Personalized content section exists but limited in scope. Opportunity to expand personalized recommendations throughout the site.",
  },
];

// ─── CRO Categories ──────────────────────────────────────────────────────

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  samsungRelevance: "high" | "medium" | "low";
}

export const CRO_CATEGORIES: CategoryInfo[] = [
  {
    slug: "urgency",
    name: "Urgency & Scarcity",
    description:
      "Countdown timers, low stock indicators, limited-time offers, 'selling fast' badges",
    samsungRelevance: "high",
  },
  {
    slug: "social-proof",
    name: "Social Proof",
    description:
      "Reviews prominence, 'X people viewing', user-generated content, testimonials, influencer content",
    samsungRelevance: "high",
  },
  {
    slug: "ux",
    name: "UX & Usability",
    description:
      "Navigation improvements, form optimization, clarity, reduced cognitive load, scannable content",
    samsungRelevance: "high",
  },
  {
    slug: "cta",
    name: "CTA Optimization",
    description:
      "Button copy, placement, color, size, urgency in CTAs, primary vs secondary actions",
    samsungRelevance: "high",
  },
  {
    slug: "trust",
    name: "Trust Signals",
    description:
      "Security badges, warranty highlights, return policy visibility, money-back guarantees",
    samsungRelevance: "medium",
  },
  {
    slug: "personalization",
    name: "Personalization",
    description:
      "Recently viewed, personalized recommendations, location-aware content, tailored offers",
    samsungRelevance: "high",
  },
  {
    slug: "mobile",
    name: "Mobile Optimization",
    description:
      "Thumb-friendly CTAs, simplified checkout, mobile-specific content, responsive improvements",
    samsungRelevance: "high",
  },
  {
    slug: "checkout",
    name: "Checkout & Cart",
    description:
      "Progress indicators, guest checkout, cross-sells, upsells, cart recovery, persistent cart",
    samsungRelevance: "high",
  },
  {
    slug: "navigation",
    name: "Navigation & Search",
    description:
      "Mega menu discoverability, search autocomplete, filtering UX, breadcrumb optimization",
    samsungRelevance: "medium",
  },
  {
    slug: "bundle",
    name: "Bundle & Cross-Sell",
    description:
      "Bundle presentation, ecosystem cross-sell, 'works with' recommendations, package discounts",
    samsungRelevance: "high",
  },
];

// ─── Samsung-Specific Context ────────────────────────────────────────────

export const SAMSUNG_CONTEXT = {
  market: "Australia (AU)",
  domain: "www.samsung.com/au",
  shopDomain: "shop.samsung.com/au",
  keyPrograms: [
    {
      name: "Trade-In Program",
      description:
        "Trade-in value calculator on product pages. A major conversion driver with 100+ code mentions. Currently opt-in — making it more visible and default could increase conversions.",
    },
    {
      name: "Bundle/Combo Discounts",
      description:
        "Pre-built bundles (phone + case + charger + buds) with clear savings display. Electronics have natural bundles — optimizing presentation can lift AOV.",
    },
    {
      name: "Financing Options",
      description:
        "Afterpay, PayPal Pay in 4, and other BNPL options available. High-ticket items benefit from clear installment pricing (e.g., '$X/month' rather than just logos).",
    },
    {
      name: "Education & Government Stores",
      description:
        "Affinity discount portals for students, educators, and government employees. Separate entry points could be more visible.",
    },
    {
      name: "Samsung Live Shop",
      description:
        "Live commerce feature already present. Could be leveraged more prominently for product launches.",
    },
    {
      name: "Seasonal Campaigns",
      description:
        "Mother's Day, Christmas, and other seasonal gifting pages. Samsung flagship launches (Galaxy S, Z Fold) create natural urgency windows.",
    },
  ],
  existingCROElements: [
    "Trade-in value calculator",
    "Bundle/combo discounts",
    "Afterpay + PayPal + financing",
    "Promo codes and vouchers",
    "RRP vs sale price display",
    "Free delivery messaging",
    "Stock status indicators",
    "Product reviews (featured reviews section)",
    "Education/Gov affinity stores",
    "Samsung Live Shop",
    "Seasonal gifting pages",
    '"Buy Direct Get More" value proposition',
  ],
  missingElements: [
    "Urgency/scarcity indicators (countdown timers, 'X left in stock', 'selling fast')",
    "Social proof notifications ('X people viewing', 'X purchased today')",
    "'Recently viewed' or 'customers also bought' prominently displayed",
    "Sticky 'notify me' for out-of-stock items",
    "Exit-intent popups or abandoned cart recovery",
    "Product comparison feature prominent on product page",
    "Free shipping threshold progress bar",
    "Visible star ratings on category/listing cards",
  ],
  competitors: [
    {
      name: "Apple.com",
      strengths:
        "Clean product pages, clear pricing with trade-in, seamless checkout, strong ecosystem cross-sell",
    },
    {
      name: "JB Hi-Fi (AU)",
      strengths:
        "Aggressive pricing display, 'was/now' pricing, BNPL integration, in-store pickup emphasis",
    },
    {
      name: "Amazon",
      strengths:
        "'Customers who bought this also bought', 'Frequently bought together', countdown on deals, 'Only X left'",
    },
    {
      name: "Best Buy",
      strengths:
        "Price match guarantee prominent, 'open box' deals, store pickup availability, comparison tools",
    },
  ],
};

// ─── CRO Best Practices for Electronics ──────────────────────────────────

export interface BestPractice {
  tactic: string;
  description: string;
  samsungRelevance: "high" | "medium" | "low";
  exampleIdea: string;
}

export const BEST_PRACTICES: BestPractice[] = [
  {
    tactic: "Urgency & Scarcity",
    description:
      "Countdown timers for sales, 'low stock' indicators, 'X sold today' counters",
    samsungRelevance: "high",
    exampleIdea:
      "Add a 'Only X left in stock' indicator to the sticky price bar for high-demand products during launch periods",
  },
  {
    tactic: "Social Proof",
    description:
      "Reviews prominence, 'X people viewing', user photos, influencer content",
    samsungRelevance: "high",
    exampleIdea:
      "Display live 'X people are viewing this right now' counter on product pages to build social validation",
  },
  {
    tactic: "Trust Signals",
    description:
      "Security badges at checkout, warranty highlights, return policy visibility",
    samsungRelevance: "medium",
    exampleIdea:
      "Add a persistent trust bar showing free delivery, 14-day returns, and Australian warranty above the fold",
  },
  {
    tactic: "Personalization",
    description:
      "Recently viewed, personalized recommendations, location-aware content",
    samsungRelevance: "high",
    exampleIdea:
      "Add a 'Recently Viewed' carousel to product pages to help customers compare and return to previously browsed items",
  },
  {
    tactic: "Value Communication",
    description:
      "Total savings display, bundle discounts, trade-in value + purchase price together",
    samsungRelevance: "high",
    exampleIdea:
      "Show the trade-in discounted price as the primary price on product pages with 'from $X/month with trade-in'",
  },
  {
    tactic: "Mobile Optimization",
    description:
      "Thumb-friendly CTAs, simplified checkout, mobile-specific content",
    samsungRelevance: "high",
    exampleIdea:
      "Redesign mobile product page with a persistent bottom 'Add to Cart' bar and swipe-to-browse image gallery",
  },
  {
    tactic: "Payment Flexibility",
    description:
      "BNPL prominence, financing calculators, multiple payment options",
    samsungRelevance: "medium",
    exampleIdea:
      "Display installment pricing prominently: '$X/month with Afterpay' next to the full price on product cards",
  },
  {
    tactic: "Cart Recovery",
    description:
      "Exit-intent offers, abandoned cart emails, persistent cart across devices",
    samsungRelevance: "high",
    exampleIdea:
      "Implement exit-intent overlay offering free delivery or a small accessory discount when users attempt to leave the cart page",
  },
  {
    tactic: "Clarity & Simplicity",
    description:
      "Clear value props, reduced cognitive load, scannable content",
    samsungRelevance: "high",
    exampleIdea:
      "Simplify the product configurator to show only the most popular color/storage combinations first with a 'Customize' option for advanced choices",
  },
  {
    tactic: "Comparison Tools",
    description:
      "Product comparison tables, 'help me choose' wizards",
    samsungRelevance: "high",
    exampleIdea:
      "Add an interactive 'Help Me Choose' quiz on smartphone category pages that recommends the best Galaxy model based on user needs",
  },
];

// ─── High-Impact Opportunity Zones (for idea targeting) ──────────────────

export interface OpportunityZone {
  zone: string;
  impact: "high" | "medium";
  description: string;
  potentialTests: string[];
}

export const OPPORTUNITY_ZONES: OpportunityZone[] = [
  {
    zone: "Product Detail / Buy Page",
    impact: "high",
    description:
      "The product buy page has the most CRO potential — configurator, price bar, bundles, trade-in all converge here",
    potentialTests: [
      "Sticky price bar with urgency indicators",
      "Trade-in price as primary display",
      "Monthly payment highlighted",
      "Bundle discount callout treatments",
      "Notify-me for out-of-stock configurations",
    ],
  },
  {
    zone: "Homepage Hero & CTAs",
    impact: "high",
    description:
      "Hero banner is visually dominant with multiple competing CTAs — simplification and clarity could lift engagement",
    potentialTests: [
      "Single vs multiple CTA variants",
      "Hero copy A/B testing",
      "Urgency elements on hero banner",
      "Personalized hero based on visitor segment",
    ],
  },
  {
    zone: "Category/PLP Pages",
    impact: "high",
    description:
      "Product listing pages lack trust signals and social proof on product cards — adding ratings, savings, and badges could increase CTR",
    potentialTests: [
      "Star ratings on category cards",
      "Bestseller/savings badges",
      "Quick compare functionality",
      "Filter UX improvements",
    ],
  },
  {
    zone: "Cart/Checkout Flow",
    impact: "high",
    description:
      "Cart is on a separate subdomain creating potential friction. Cross-sells, progress indicators, and trust signals are underutilized",
    potentialTests: [
      "Cart progress indicator",
      "Free shipping threshold bar",
      "Post-add-to-cart upsell modal",
      "Exit-intent recovery overlay",
    ],
  },
  {
    zone: "Trust & Social Proof (Site-wide)",
    impact: "high",
    description:
      "Trust and social proof are underutilized across the entire site — reviews exist but are buried, no social proof notifications present",
    potentialTests: [
      "Live viewer counter on product pages",
      "Recently purchased notification",
      "Trust bar with warranty/returns icons",
      "Review snippets in product cards",
    ],
  },
  {
    zone: "Mobile Experience",
    impact: "high",
    description:
      "The site has separate mobile content paths — mobile-specific CRO optimization can capture growing mobile traffic",
    potentialTests: [
      "Persistent mobile cart button",
      "Simplified mobile mega menu",
      "Mobile-specific trust signals",
      "Thumb-friendly navigation",
    ],
  },
  {
    zone: "Bundle & Ecosystem Cross-Sell",
    impact: "medium",
    description:
      "Bundle builder exists but discount display and ecosystem cross-sell could be more compelling",
    potentialTests: [
      "Side-by-side bundle comparison",
      "'Works with' ecosystem recommendations",
      "Pre-built bundles for specific use cases",
      "Progressive bundle upsell at cart",
    ],
  },
];
