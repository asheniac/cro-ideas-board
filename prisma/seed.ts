import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const UI_MOCKUP_NEGATIVE_PROMPT = [
  "photorealistic people",
  "real human faces",
  "photographs",
  "blurry text",
  "distorted text",
  "illegible writing",
  "cluttered layout",
  "watermarks",
  "signatures",
  "3D renders (use flat UI design)",
  "sketches",
  "hand-drawn elements",
  "pixelated",
  "low resolution",
  "grainy",
].join(", ");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Ensure .env file exists.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseUrl),
});

const categories = [
  { name: "Urgency & Scarcity", slug: "urgency" },
  { name: "Social Proof", slug: "social-proof" },
  { name: "User Experience", slug: "ux" },
  { name: "Call to Action", slug: "cta" },
  { name: "Trust Signals", slug: "trust" },
  { name: "Personalization", slug: "personalization" },
  { name: "Pricing & Value", slug: "pricing" },
  { name: "Mobile Optimization", slug: "mobile" },
  { name: "Checkout Flow", slug: "checkout" },
];

const BATCH_ID = "seed-batch-001";

interface SeedIdea {
  title: string;
  description: string;
  reason: string;
  purpose: string;
  categorySlug: string;
  mockupPrompt: string;
  aspectRatio?: string;
  negativePrompt?: string;
}

const seedIdeas: SeedIdea[] = [
  {
    title: "Add sticky stock urgency indicator to the hubble-price-bar on product buy pages",
    description:
      "Display a subtle 'Only X left in stock — selling fast' indicator directly within the sticky hubble-price-bar component on Galaxy S26 Ultra and other flagship buy pages. When stock drops below a configurable threshold, show the indicator with a low-stock icon. For out-of-stock variants flagged by .is-out-stock, show 'Back in stock soon — order now to reserve' rather than a dead disabled state.",
    reason:
      "The hubble-price-bar is Samsung AU's most viewable conversion element — it sticks as the user scrolls the entire product page. Currently it shows price, delivery info, and the add-to-cart CTA but has zero urgency cues. Samsung's own code already tracks stock via .hubble-product__total-stock and .is-out-stock, meaning the data plumbing exists. Adding a low-stock indicator here would be the highest-visibility urgency placement on the entire site. Research shows scarcity indicators on sticky purchase bars can lift conversion 5-12% for high-consideration electronics.",
    purpose:
      "Create purchase urgency at the exact moment of decision, reducing 'I'll think about it' abandonment on flagship product pages.",
    categorySlug: "urgency",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy S26 Ultra product buy page on mobile (393×852). Sticky hubble-price-bar at bottom spanning full width, 56px height, dark background (#1A1A2E) with 1px top border in #333. Left: total price '$1,949 AUD' in 20px white Samsung One bold with trade-in discount applied, smaller 'incl. trade-in' label in 10px #999 below. Center: small orange (#FF6B35) low-stock badge pill with white 11px text 'Only 4 left — Selling fast' and small stock icon to its left. Badge has 2px rounded corners and orange-tinted background (#FFF3ED). Right: blue 'Add to Cart' button (#2189FF) with 24px rounded corners, 48px height, 14px white bold text. Orange highlight accent on stock message area. Product page content (device image, color selector, key specs) partially visible above the sticky bar. Clean Samsung One UI style.",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add real-time social proof notification near the purchase button on product pages",
    description:
      "Integrate a subtle real-time social proof notification into the hubble-price-bar or directly above it on the Galaxy product buy pages. The notification would cycle through messages like '17 people are viewing this phone right now', 'Purchased 8 times in the last 24 hours', and 'Popular in your area'. Design it as a small, animated text badge that doesn't distract from the primary CTA but catches peripheral attention.",
    reason:
      "Samsung AU's product pages have customer reviews (hubble-featured-reviews) tucked away far below the fold, and category listing pages show no social proof at all. Social proof is one of the strongest psychological conversion drivers, yet Samsung's site makes zero use of 'others are buying' signals at the decision point. Apple and Amazon both use 'popular right now' indicators effectively. The hubble-price-bar is the natural home for this — it's where the buying decision happens. A social proof notification here would capitalize on FOMO and herd behavior at the exact moment of purchase consideration.",
    purpose:
      "Increase buyer confidence and reduce hesitation by showing that other customers are actively engaging with and purchasing the same product.",
    categorySlug: "social-proof",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy S26 Ultra product buy page on mobile (393×852). Just above the sticky hubble-price-bar, a slim horizontal notification badge (40px height, full width minus 16px margins, 6px rounded corners) with light green (#E8F5E9) background and subtle 1px #C8E6C9 border. Left side: eye icon 👁 (16px) in #4CAF50. Text: '23 people are viewing this phone right now' in 13px #2E7D32 Samsung One. Static notification badge, cleanly positioned between product content and price bar. Below badge, standard hubble-price-bar: price $1,949 in white bold, delivery info in 11px #AAA, blue 'Add to Cart' button (#2189FF) right-aligned. Phone image gallery with swipe dots and color option pills partially visible in the upper portion of the screen. Clean Samsung design with consistent 16px horizontal margins.",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Build mobile-optimised product comparison with sticky floating compare button",
    description:
      "Create a mobile-first product comparison experience triggered by a sticky floating 'Compare' button that appears after scrolling past the first product specs section. Tapping it opens a slide-up panel showing a side-by-side comparison table of the current product vs. the 2-3 most comparable models, with key specs (display, camera, battery, price) highlighted. Include a 'Help me choose' wizard mode for users who are undecided.",
    reason:
      "Samsung's existing comparison tool is desktop-oriented and hard to discover on mobile, yet over 60% of AU traffic comes from mobile devices. Tech buyers extensively compare specs before purchasing — if Samsung doesn't provide an easy comparison experience, users will bounce to JB Hi-Fi, Amazon, or GSMArena to do it. The bc-cross-navigation-review and hubble-product__buying-gallery components show Samsung has the data architecture for cross-model navigation. A mobile-optimized comparison tool would keep users on-site during the critical research phase of their purchase journey.",
    purpose:
      "Prevent competitor site visits during the comparison phase by providing a frictionless, mobile-friendly product comparison experience directly on the buy page.",
    categorySlug: "ux",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product buy page on mobile (393×852). Floating circular 'Compare' button (56px diameter, white background, 4px shadow rgba 0,0,0,0.15, compare/swap icon in #333 at center) positioned bottom-right of screen, 16px from right edge and 80px from bottom (above sticky bar). Slide-up comparison panel covering bottom 60% of screen with white background, 12px rounded top corners, and drag handle bar (32px, #DDD) at top center. Panel shows clean comparison table with 14px header row 'Compare Models': Galaxy S26 Ultra vs Galaxy S26+ vs Galaxy S25 Ultra in 3 columns. Rows: price (13px), display size (13px), camera MP (13px), battery mAh (13px), 'Best for' summary (11px #666). Current Galaxy S26 Ultra column highlighted with subtle blue (#F0F6FF) background. 'Help me choose' button at panel bottom (44px, #2189FF, full-width). Phone product page dimmed with semi-transparent overlay in background.",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Optimise the add-to-cart CTA with sticky mobile bar and accessory cross-sell",
    description:
      "Make the `.cta--contained.cta--emphasis.add-to-cart-btn` persistent as a sticky bottom bar on mobile product pages. When tapped, instead of immediately adding to cart, show a lightweight slide-up with a single recommended accessory (e.g. Galaxy Buds3 Pro or a case) at a bundled discount. User can 'Add phone only' or 'Add phone + accessory (save $X)'. This keeps the flow frictionless while maximizing AOV.",
    reason:
      "The hubble-price-bar's add-to-cart button currently scrolls off-screen on mobile as users browse product details — it's only visible at the top of the page. Sticky CTAs consistently lift mobile conversion by 8-12% in e-commerce. Additionally, Samsung has strong ecosystem products (Buds, Watch, cases) that complement phone purchases. A single-recommendation cross-sell at the point of add-to-cart is far more effective than post-purchase upsells because the buyer is already in purchasing mode. The pd17-combo-package-api shows Samsung already understands bundles — this just moves the cross-sell to the optimal moment.",
    purpose:
      "Increase mobile add-to-cart rate by keeping the CTA always visible, and lift average order value through contextual accessory cross-sells at the moment of purchase decision.",
    categorySlug: "cta",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product page bottom portion on mobile (393×852). Full-width sticky bar at bottom (56px height, dark #1A1A2E background) with blue 'Add to Cart — $1,949' button (#2189FF, 48px height, 24px rounded corners, white 15px bold text, spanning 65% of bar width). Small slide-up accessory card (80px height, white background, 1px #E8E8E8 border, 8px rounded top corners) positioned above the sticky bar showing Galaxy Buds3 Pro with 40px product thumbnail on left, text 'Complete your setup — Add Buds3 Pro and save $50' in 13px #333 center, and total '$2,248 (save $50)' in 14px bold green (#00C853) right. Two small buttons below card text: 'Add phone only' (white outlined, 1px #CCC border, 32px height) and 'Add both — Save $50' (filled blue #2189FF, 32px height). Product page content dimmed behind 40% opacity dark overlay. Clean Samsung-branded mobile design.",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add a prominent trust reassurance bar near the purchase button on all product pages",
    description:
      "Design a compact horizontal trust bar that sits directly between the product configurator (color/storage options) and the hubble-price-bar. The bar would display 4-5 icons with short labels: 'Australian Warranty', 'Free Delivery', '14-Day Returns', 'Secure Checkout', and 'Afterpay Available'. Each icon is clickable and expands a small tooltip with details. This makes Samsung's strongest purchase reassurances visible at the exact decision point.",
    reason:
      "For high-value electronics purchases ($1,000+), trust signals are critical to overcoming last-second purchase anxiety. Samsung AU currently buries warranty information in expandable footer sections and payment trust signals are only visible after the user enters checkout flow. Research on electronics e-commerce shows that displaying trust badges near the add-to-cart button can reduce cart abandonment by 15-20%. Samsung's warranty program is actually a competitive strength — 24-month Australian warranty is better than many competitors — but it's effectively invisible during the purchase decision.",
    purpose:
      "Reduce purchase anxiety and last-second drop-offs by making Samsung's strongest trust signals (warranty, returns, secure payment) immediately visible at the point of conversion.",
    categorySlug: "trust",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product buy page area between color/storage selector and hubble-price-bar on desktop. Horizontal trust bar spanning full content width (960px) with subtle light gray 1px border (#E8E8E8) separating from configurator above, 56px height, 16px vertical padding. 5 small icons arranged in equally-spaced row with 20px gaps: shield icon (Australian Warranty), truck icon (Free Delivery), return arrow icon (14-Day Returns), lock icon (Secure Checkout), Afterpay logo (16px). Each icon rendered in subtle blue-gray (#6B7B8D) at 20px size with tiny label below in 11px #757575 Samsung One. Icons separated by thin 1px vertical dividers (#EEE, 24px height). Background: very light gray (#FAFAFA). Below bar, hubble-price-bar with price '$1,949' in 20px bold #111 and blue 'Add to Cart' button (#2189FF, 44px height). Clean uncluttered design with generous whitespace. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Implement 'Recently Viewed' personalised carousel using co75-explore-carousel pattern on the Samsung AU homepage",
    description:
      "Add a personalised 'Recently Viewed' product carousel to the Samsung AU homepage for returning visitors. Use the existing co75-explore-carousel component pattern with Swiper.js to display the last 4-6 products the visitor viewed. Each card shows the product image, name, price, and a 'Continue where you left off' CTA linking back to the buy page. For first-time visitors, show a 'Trending now' carousel instead as a fallback.",
    reason:
      "Samsung AU's homepage (hd08-hero-kv-home + co76-feature-kv + co75-explore-carousel) currently shows zero personalised content. The fn23-personalization component exists but is underutilised. Returning visitors who previously browsed a Galaxy S26 Ultra or a Frame TV have to re-navigate from scratch to find those products again. 'Recently Viewed' is one of the highest-ROI personalization features in e-commerce — it reduces friction for returning researchers and increases the chance they'll complete a purchase they were previously considering. Amazon and JB Hi-Fi both use this pattern successfully.",
    purpose:
      "Reduce navigation friction for returning visitors by surfacing previously viewed products on the homepage, increasing the likelihood of purchase completion for considered items.",
    categorySlug: "personalization",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU homepage on desktop (1440×900). Main hero banner (hd08-hero-kv-home) at top with dark gradient background, Galaxy S26 Ultra device hero image on right, and promotional headline with CTA buttons on left. Below hero, 'Recently Viewed' section using co75-explore-carousel design pattern with 32px top margin. Section heading 'Recently Viewed' in 22px Samsung One bold #111, with subtle 'Clear history' text link in 12px #2189FF aligned to heading right. Horizontal swiper carousel with left/right arrow navigation (32px white circles with shadow and #555 chevron icons). 4 product cards visible (220px each, 12px gap, white with 1px #EEE border, 8px rounded corners): Galaxy S26 Ultra (silver, $1,949), Galaxy Watch7 (green, $549), 65-inch Neo QLED TV ($2,799), Galaxy Buds3 Pro (white, $349). Each card: product image centered (160px), product name in 14px medium #333, price in 16px bold #111, subtle 'Continue browsing' link in 12px #2189FF below price. Samsung clean white background, blue (#2189FF) accent color throughout. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Redesign the pd17-combo-package-api bundle builder to highlight total savings more prominently",
    description:
      "Redesign the bundle/combo package builder (pd17-combo-package-api) on product buy pages to make the total savings the hero element. Instead of showing individual bundle card discounts, aggregate and display a prominent 'You save $X with this bundle' banner at the top of the bundle section, with a clear price breakdown (individual prices crossed out → bundle price). Add a visual 'savings meter' that fills up as the user adds more bundle items, gamifying the bundle-building experience.",
    reason:
      "Samsung's bundle builder (pd17-bundleCard*, pd17-combo-package-api) is a powerful AOV driver but its current discount presentation is fragmented — each bundle card shows its own small discount, making the cumulative savings hard to grasp at a glance. The 'total savings' number is the single most motivating piece of information for a bundle purchase, yet it's not given visual prominence. JB Hi-Fi and Amazon both use prominent 'You save' callouts that anchor the value perception. A gamified savings meter would also make bundle-building more engaging, increasing the number of items per bundle.",
    purpose:
      "Increase bundle attachment rate and average items-per-bundle by making cumulative savings the visual hero of the bundle-building experience.",
    categorySlug: "pricing",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product buy page pd17-combo-package-api bundle section on desktop. Top: prominent green (#00C853) banner '🎁 You save $127 with this bundle' in large white text. Below, three bundle cards in row: Galaxy S26 Ultra case (was $89 ~~, now $59), Galaxy Watch7 (was $549 ~~, now $499), Galaxy Buds3 Pro (was $349 ~~, now $299). Original price crossed out in gray, bundle price in green. Bottom: horizontal 'savings meter' bar at 75% fill with hint 'Add one more item to unlock maximum savings'. Clean Samsung card design, subtle shadows. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Create thumb-friendly mobile checkout navigation with persistent cart summary",
    description:
      "Optimise the mobile checkout flow on shop.samsung.com/au with larger touch targets (minimum 44x44pt), a simplified single-column form layout, and a persistent collapsible cart summary bar at the bottom of the screen. The cart summary shows item count, total price, and estimated delivery date, and expands on tap to show full line items. Add a prominent 'Guest Checkout' option at the top of the login wall to reduce friction for first-time buyers.",
    reason:
      "Samsung AU splits its experience across www.samsung.com/au (browsing) and shop.samsung.com/au (cart/checkout). This subdomain transition already creates friction — a clunky mobile checkout compounds it. Mobile checkout abandonment in electronics averages 75-80%, and every form-field reduction or UX improvement can recover 3-5% of lost conversions. Thumb-friendly design (placing key buttons in the bottom 40% of the screen) is particularly important given the large-screen phones Samsung sells — users are often one-hand browsing. Guest checkout prominence is also critical: mandatory account creation is one of the top-3 reasons for checkout abandonment.",
    purpose:
      "Reduce mobile checkout abandonment by optimising touch targets, simplifying the form flow, and keeping cart context always visible during the payment process.",
    categorySlug: "mobile",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU mobile checkout screen (shop.samsung.com/au) on mobile (393×852). Top: step indicator 'Cart → Shipping → Payment' (Shipping highlighted blue). Main content: simplified single-column shipping form with large full-width inputs (48pt height). Top: prominent 'Guest Checkout' blue button with smaller 'Sign in for faster checkout' link. Bottom: persistent dark bar '🛒 2 items · $2,498 · Est. delivery Fri 16 May' with upward chevron icon. Full-width blue 'Continue to Payment' button in thumb-friendly zone. Clean checkout design.",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add a free shipping threshold progress bar to the cart page with upsell nudges",
    description:
      "On shop.samsung.com/au/cart, add a prominent progress bar showing how close the customer is to the free delivery threshold. If their cart is at $180 and free shipping starts at $200, show 'You're $20 away from FREE delivery!' with the progress bar at 90%. Below the bar, suggest 2-3 low-cost items (screen protector, phone case, charger) that would push them over the threshold. Use a confetti or celebration animation when the threshold is reached.",
    reason:
      "Free shipping threshold progress bars are one of the most proven CRO tactics in e-commerce — they leverage loss aversion ('don't miss out on free delivery') and goal-gradient effect ('you're so close!'). Samsung AU already offers free delivery but doesn't communicate the threshold dynamically during cart building. This is especially effective for Samsung because accessory margins are high and the threshold nudge increases both conversion AND AOV simultaneously. The shop subdomain cart page is the ideal placement since it's the last decision point before checkout.",
    purpose:
      "Increase cart-to-checkout conversion and average order value by gamifying the free delivery threshold with visual progress feedback and contextual product nudges.",
    categorySlug: "checkout",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU shopping cart page (shop.samsung.com/au/cart) on desktop (1440×900). Below cart page header 'Shopping Cart' in 24px bold #111: prominent free shipping progress bar — rounded horizontal bar (full content width, 8px height, 16px rounded ends, light gray #E8E8E8 track) at 90% fill with green gradient (#00C853 to #69F0AE) and subtle highlight accent at the 90% fill point. Above progress bar: 'You're $20 away from FREE delivery! 🚚' in 15px #333 medium with encouraging tone. Below progress bar: 3 small product suggestion cards in horizontal row with 12px gaps — Galaxy S26 Ultra screen protector ($29, 80px product thumbnail), 25W USB-C charger ($35), clear standing case ($39). Each card: 180px wide, 1px #EEE border, 8px rounded, '+' quick-add button (24px circle, #2189FF outline). Below suggestions: standard cart line items with Galaxy S26 Ultra ($1,949), product thumbnail, quantity selector, and remove icon. Clean white background with 24px content padding.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add 'Notify Me' email capture for out-of-stock color and storage variants on product buy pages",
    description:
      "When a color or storage variant on the product buy page is flagged with `.is-out-stock`, replace the disabled/greyed-out selector state with an interactive 'Notify Me' option. Tapping an out-of-stock variant opens a small inline email capture form ('We'll email you when Titanium Blue / 512GB is back in stock'). Include an optional 'Reserve with $50 deposit' upsell for high-demand variants. The `.hubble-product__total-stock` data can be used to show estimated restock dates where available.",
    reason:
      "When a customer wants a specific color/storage combination and finds it out of stock, the current Samsung AU experience is a dead end — a greyed-out, unclickable option with no path forward. This is a conversion-killer, especially for flagship launches where specific variants sell out quickly. A 'Notify Me' capture not only recovers potential lost sales but builds an email list of high-intent buyers. The $50 deposit option (inspired by Samsung's own trade-in pre-registration patterns) would lock in pre-orders during restock periods. This directly addresses the `.is-out-stock` and `s-option-trade` patterns already in the codebase.",
    purpose:
      "Capture high-intent buyers who encounter out-of-stock variants, prevent them from leaving the site or settling for a competitor, and build a remarketing list of purchase-ready customers.",
    categorySlug: "ux",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy S26 Ultra product buy page configurator section on desktop. Color selector (hubble-product__options) with 4 color circles: Titanium Black (available, selected with blue ring), Titanium Gray (available), Titanium Blue (greyed-out with small bell icon overlay and 'Notify Me' text below), Titanium Green (available). Tapping Titanium Blue shows inline card: 'Titanium Blue / 512GB is currently out of stock. We'll notify you when back.' with email input field and blue 'Notify Me' button (#2189FF). Below, smaller text link: 'Or reserve with $50 deposit →'. Clean non-intrusive inline design. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
];

async function main() {
  console.log("🌱 Seeding categories...");

  const categoryMap: Record<string, number> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    categoryMap[cat.slug] = created.id;
    console.log(`  ✅ ${cat.name} (slug: ${cat.slug}, id: ${created.id})`);
  }

  console.log(`\n📦 Seeding ${seedIdeas.length} CRO ideas (batch: ${BATCH_ID})...`);

  for (const idea of seedIdeas) {
    const categoryId = categoryMap[idea.categorySlug];
    if (!categoryId) {
      console.log(`  ⚠️  Skipping "${idea.title}" — category slug "${idea.categorySlug}" not found`);
      continue;
    }

    const created = await prisma.cROIdea.create({
      data: {
        title: idea.title,
        description: idea.description,
        reason: idea.reason,
        purpose: idea.purpose,
        categoryId,
        status: "pending",
        batchId: BATCH_ID,
        mockupPrompt: idea.mockupPrompt,
      },
    });
    console.log(`  ✅ [${idea.categorySlug}] ${idea.title.substring(0, 60)}... (id: ${created.id})`);
  }

  console.log(`\n🎉 Seeded ${categories.length} categories and ${seedIdeas.length} CRO ideas.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
