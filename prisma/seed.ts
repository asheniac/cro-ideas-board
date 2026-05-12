import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

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
      "Product detail page mockup for Samsung Galaxy S26 Ultra buy page showing the sticky hubble-price-bar at the bottom of a mobile screen. The price bar contains: left side shows total price $1,949 AUD with trade-in discount applied, middle shows a small orange low-stock badge 'Only 4 left — Selling fast' with a small stock-icon, right side shows the blue Add to Cart button. The bar has a subtle orange highlight/animation drawing attention to the stock message. Background: phone product page content partially visible above the sticky bar.",
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
      "Samsung Galaxy S26 Ultra product buy page mockup. Just above the sticky hubble-price-bar, a slim horizontal notification badge with a light green background and a small 'eye' icon showing the text '23 people are viewing this phone right now'. The badge has a subtle fade-in animation. Below it, the standard hubble-price-bar with price $1,949, delivery info, and Add to Cart button. The page background shows the phone image gallery and color options partially visible above. Mobile screen viewport.",
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
      "Mobile screen mockup showing a Samsung product buy page with a floating circular 'Compare' button (with a compare/swap icon) positioned at the bottom-right of the screen. When tapped, a slide-up panel covers the bottom 60% of the screen showing a clean comparison table: Galaxy S26 Ultra vs Galaxy S26+ vs Galaxy S25 Ultra. Rows show price, display size, camera MP, battery mAh, and a 'Best for' summary row. Current product column highlighted with a subtle blue background. 'Help me choose' button at the bottom of the panel.",
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
      "Mobile screen mockup showing the bottom portion of a Samsung product page. A sticky bar spans the full width at the bottom with a blue 'Add to Cart — $1,949' button. When the button is tapped, a small slide-up card appears above the bar showing a Galaxy Buds3 Pro with the text 'Complete your setup — Add Buds3 Pro and save $50' with a total price of '$2,248 (save $50)' and two buttons: 'Add phone only' (outlined) and 'Add both — Save $50' (filled blue). The phone product page is dimmed in the background. Clean, minimal, Samsung-branded design language.",
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
      "Product buy page mockup showing the area between the color/storage selector and the hubble-price-bar. A horizontal bar spans the content width with 5 small icons in a row: a shield (Australian Warranty), a truck (Free Delivery), a return arrow (14-Day Returns), a lock (Secure Checkout), and an Afterpay logo. Each icon has a tiny label below it. The bar has a subtle light gray background border to separate it from the configurator above. Below it, the hubble-price-bar with price and Add to Cart. Clean, uncluttered, trust-inspiring design.",
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
      "Samsung AU homepage mockup showing the main hero banner (hd08-hero-kv-home) at the top, followed by a new 'Recently Viewed' section using the co75-explore-carousel design pattern. The section has a heading 'Recently Viewed' with a 'Clear history' link. A horizontal swiper carousel shows 4 product cards: Galaxy S26 Ultra (silver, $1,949), Galaxy Watch7 (green, $549), 65\" Neo QLED TV ($2,799), and Galaxy Buds3 Pro (white, $349). Each card has the product image, name, price, and a subtle 'Continue browsing' link. The carousel has left/right navigation arrows. Samsung's signature clean white background and blue accent colors.",
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
      "Samsung product buy page mockup showing the pd17-combo-package-api bundle section. At the top, a prominent banner with green background: '🎁 You save $127 with this bundle' in large white text. Below, three bundle cards in a row: Galaxy S26 Ultra case (was $89, now $59), Galaxy Watch7 (was $549, now $499), Galaxy Buds3 Pro (was $349, now $299). Each card has the original price crossed out and the bundle price in green. A horizontal 'savings meter' bar at the bottom fills up progressively, currently at 75% with a 'Add one more item to unlock maximum savings' hint. Clean, Samsung-style card design with subtle shadows.",
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
      "Mobile checkout screen mockup for shop.samsung.com/au. Top of screen shows a step indicator: Cart → Shipping → Payment (Shipping is active, highlighted blue). Main content area shows a simplified single-column shipping form with large input fields (full-width, 48pt height). At the very top, a 'Guest Checkout' button is prominently displayed alongside a smaller 'Sign in for faster checkout' link. At the bottom, a persistent dark bar shows: '🛒 2 items · $2,498 · Est. delivery Fri 16 May' with a small upward-chevron icon indicating it's expandable. The 'Continue to Payment' button is large, full-width, blue, positioned in the thumb-friendly zone.",
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
      "Samsung AU shopping cart page mockup (shop.samsung.com/au/cart). Below the cart header, a prominent progress bar component: a rounded horizontal bar showing 90% fill (green gradient). Above the bar, the text: 'You're $20 away from FREE delivery! 🚚' in dark text. Below the bar, a horizontal row of 3 small product suggestion cards: a Galaxy S26 Ultra screen protector ($29), a 25W USB-C charger ($35), and a clear standing case ($39). Each card has a '+' button to quick-add. Below this, the standard cart line items (Galaxy S26 Ultra $1,949). The progress bar has a subtle pulsing animation at the 90% point.",
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
      "Samsung Galaxy S26 Ultra product buy page mockup showing the color selector section (hubble-product__options). Four color circles are shown: Titanium Black (available, selected), Titanium Gray (available), Titanium Blue (greyed-out but with a small bell icon overlay and 'Notify Me' text below it), and Titanium Green (available). When Titanium Blue is tapped, a small inline card slides down between the color selector and storage selector rows, showing: 'Titanium Blue / 512GB is currently out of stock. We'll notify you when it's back.' with an email input field and a blue 'Notify Me' button. Below that, a smaller text link: 'Or reserve with a $50 deposit →'. Clean, non-intrusive, inline design.",
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
