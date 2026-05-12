/**
 * Mock LLM Client
 *
 * Returns realistic, Samsung AU-specific CRO ideas without needing a real LLM API key.
 * Uses the knowledge base to generate varied, component-specific ideas across categories.
 *
 * Each call produces different ideas through randomization within predefined pools.
 */

import { CRO_CATEGORIES, COMPONENTS, OPPORTUNITY_ZONES } from "./knowledge-base";
import { UI_MOCKUP_NEGATIVE_PROMPT } from "./minimax-client";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMClient {
  chat(messages: ChatMessage[]): Promise<string>;
}

// ─── Idea Templates ──────────────────────────────────────────────────────

interface IdeaTemplate {
  title: string;
  description: string;
  reason: string;
  purpose: string;
  category: string;
  mockupPrompt: string;
  aspectRatio?: string;
  negativePrompt?: string;
}

const IDEA_POOL: IdeaTemplate[] = [
  // ── Urgency ──
  {
    title: "Add Live Stock Counter to Sticky Price Bar",
    description:
      "Modify the hubble-price-bar component to include a real-time stock level indicator. For high-demand products (e.g., new Galaxy launches), display 'Only X left in stock' with a color-coded progress bar. The indicator should update dynamically as inventory changes, positioned directly below the add-to-cart CTA button for maximum visibility.",
    reason:
      "Scarcity is one of the most powerful psychological triggers in e-commerce. Studies show that low-stock indicators can increase conversion rates by 10-30% (Cialdini's scarcity principle). Samsung AU currently has stock indicators via `.is-out-stock` class but lacks 'low stock' urgency. This is especially effective during flagship launches when demand peaks.",
    purpose:
      "Increase add-to-cart conversion rate on product pages by creating urgency through perceived scarcity, particularly during launch windows and promotional periods.",
    category: "urgency",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy phone product buy page on mobile. Sticky bottom bar (hubble-price-bar) spanning full width with dark theme (#1A1A2E). Left: price '$2,199 AUD' in white, Samsung One font, 18px semi-bold. Center-right: orange progress bar (#FF6B35) at 15% fill with bold white text 'Only 8 left — Selling fast!' inside the bar. Far right: blue 'Add to Cart' button (#2189FF) with 24px rounded corners, 48px touch target height. Subtle 1px top border on bar in #333. Above the bar, blurred product page content with device image gallery and color selector partially visible. Clean Samsung One UI style. Mobile viewport 393×852.",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add Countdown Timer for Limited-Time Promotions",
    description:
      "Integrate a countdown timer into the hubble-offer-banner-v2 component on product pages and the offers-product-card-grid on deal pages. The timer should display days/hours/minutes remaining for time-limited promotions, styled with Samsung's brand colors. On mobile, the timer should be sticky within the banner for constant visibility as users scroll.",
    reason:
      "Countdown timers create temporal scarcity, a proven conversion driver. Research from ConversionXL shows that countdown timers on e-commerce product pages can lift conversion by 9-15%. Samsung AU runs seasonal promotions (Mother's Day, launch events) but currently has no visible urgency mechanic to capitalize on time-limited offers.",
    purpose:
      "Increase conversion rate during promotional periods by communicating offer expiration clearly and creating urgency to purchase now rather than later.",
    category: "urgency",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product page top section on desktop. Promotional banner (hubble-offer-banner-v2) with dark navy (#0A1628) background spanning full content width, 14px rounded corners. White headline: 'Galaxy S26 Ultra Launch Offer — Save $300' in 28px Samsung One bold. Below headline, a countdown timer row showing '02d : 14h : 32m : 05s' in large white digits (32px) inside rounded pill containers with blue (#2189FF) 2px borders and dark translucent fill. Highlighted seconds digits in brighter white with slightly larger font. Small label text below timer: 'Offer ends soon — don't miss out'. Below the banner, product image and pricing section partially visible with hero shot of Titanium Black device. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Show 'Selling Fast' Badge on Popular Configurations",
    description:
      "In the hubble-product__options configurator, add a 'Selling Fast 🔥' badge to the most popular color/storage combinations. When a specific configuration (e.g., Titanium Black / 512GB) is in high demand, highlight it with a subtle animated badge. Use actual sales velocity data to determine which configs get the badge.",
    reason:
      "Social proof + scarcity combination. When customers see that others are buying a particular configuration, it reduces choice paralysis and validates the purchase decision. Samsung's configurator currently shows disabled out-of-stock states but misses the opportunity to highlight popular choices that are still available.",
    purpose:
      "Increase configurator completion rate by reducing choice paralysis and guiding customers toward popular configurations, while also creating mild scarcity for in-demand options.",
    category: "urgency",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy phone configurator section on desktop. Color selection row with 4 color circles (44px diameter, 8px gap): Titanium Black (selected, blue #2189FF 3px ring), Titanium Gray, Titanium Blue, Titanium Silver. Above Titanium Black, a small floating red-orange (#FF5722) 'Selling Fast 🔥' badge displayed as a static pill-shaped label with white text, 12px font, 4px rounded corners, subtle drop shadow. Below colors, storage options in horizontal pill row: 256GB, 512GB (highlighted with blue border #2189FF, 2px), 1TB. Each storage pill has light gray background (#F5F5F5), 32px height. Clean white background, section heading 'Choose your model' in Samsung One 22px bold. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── Social Proof ──
  {
    title: "Add Live 'People Viewing' Counter to Product Pages",
    description:
      "Add a live social proof notification below the product title on the buy page, showing '👁 X people are viewing this right now' with a real-time counter. Position it between the product name and the price bar. The counter should animate when updating and use anonymized, aggregated browsing data.",
    reason:
      "Social proof notifications are widely used by top e-commerce sites (Booking.com, Amazon) because they tap into the bandwagon effect. Nielsen research shows 92% of consumers trust peer recommendations. Samsung AU currently has no visible social proof on product pages — reviews exist but are in a dedicated section further down the page.",
    purpose:
      "Increase product page engagement and add-to-cart rate by leveraging social validation — when customers see others are interested, they're more likely to convert.",
    category: "social-proof",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy phone product buy page top section on desktop. Below product title 'Galaxy S26 Ultra' (32px Samsung One bold, #111) and star rating row (4.8 ★★★★★ 2.3k reviews, 14px, gold stars #FFB800), a subtle notification line with light gray background (#F7F8FA) pill container: eye icon 👁 followed by '47 people are viewing this right now' in gray-blue (#6B7B8D) 14px Samsung One. The number '47' is bolder (600 weight) and 2px larger. Below notification, the hubble-price-bar with full pricing: strikethrough RRP, bold sale price in #111, and trade-in estimate in smaller text. Clean white background, 24px content padding. Desktop viewport 1440×900, above the fold.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add Star Ratings and Review Count to Category Product Cards",
    description:
      "Enhance the product cards on category/PLP pages (offers-product-card-grid) and the explore carousel (co75-explore-carousel) by adding star ratings and review counts directly on each card. Display average rating (e.g., 4.8 ★) and review count (e.g., '2,341 reviews') below the product name. Use Samsung's existing review data from hubble-featured-reviews.",
    reason:
      "Displaying ratings on listing pages is a well-established CRO best practice. Baymard Institute research shows that 95% of users rely on ratings to evaluate products. Competitors like Amazon and JB Hi-Fi show ratings on listing cards, but Samsung AU currently hides them until the product detail page, losing early trust-building opportunities.",
    purpose:
      "Increase click-through rate from category/listing pages to product detail pages by providing social proof at the earliest decision point, and improve the quality of traffic (pre-qualified by rating visibility).",
    category: "social-proof",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU smartphone category page with product grid on desktop. Grid of 4 product cards in 2×2 layout with 16px gaps, each white card with 8px rounded corners and subtle 1px #E8E8E8 border shadow. Each card shows: device image centered (Galaxy S26 Ultra in Titanium Black), product name below image in 16px Samsung One medium (#111), star rating row '★★★★★ 4.8 (2,341 reviews)' in 13px with gold stars (#FFB800) and gray review count (#757575), and pricing: RRP strikethrough in gray (#999) + sale price in bold 18px #111. Top-left card shows navy 'Bestseller' badge (small pill, #1A1A2E background, white 11px text). Clean white page background, section title 'Smartphones' in 24px bold. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add 'Recently Purchased' Notification Toast",
    description:
      "Implement a subtle, non-intrusive notification toast that appears briefly at the bottom-left of the product page showing recent purchases in Australia: 'Someone in Sydney just purchased a Galaxy S26 Ultra' (anonymized, delayed, and aggregated). The toast should fade in, display for 5 seconds, then fade out. Only show 2-3 times per session max.",
    reason:
      "Recent purchase notifications leverage both social proof and FOMO (fear of missing out). Used effectively by Booking.com, these notifications create a sense of product popularity and validate the purchase decision. Australia-specific location data (city-level only) makes it feel authentic and relevant.",
    purpose:
      "Increase conversion rate by building social validation and creating mild FOMO, particularly for customers who are comparing products or hesitating to purchase.",
    category: "social-proof",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product page bottom-left corner on desktop. Small elegant toast notification displayed statically with white background (#FFF), subtle 2px shadow (rgba 0,0,0,0.1), rounded corners (8px), 60px tall by 320px wide. Shows shopping bag icon (left, 20px) and text: 'Someone in Melbourne just purchased Galaxy S26 Ultra' in 13px #333 Samsung One, with '2 min ago' in lighter 11px gray (#999) below. Green checkmark (16px) on left edge. Thin 3px green left border accent (#4CAF50). Non-intrusive placement over semi-transparent overlay of product page content. Clean, minimal design with 12px internal padding. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── UX ──
  {
    title: "Simplify Product Configurator with Popular Presets",
    description:
      "Redesign the hubble-product__options configurator to show 2-3 'Most Popular' preset configurations at the top, with a 'Customize Your Own' option below. Each preset shows the color, storage, and total price. This reduces the cognitive load of sequential color-then-storage-then-carrier decisions. The presets are based on actual sales data.",
    reason:
      "Choice paralysis is a well-documented conversion killer. Hick's Law states that decision time increases with the number of choices. Samsung's configurator requires 3+ sequential decisions (color → storage → carrier → trade-in), each with multiple options. By offering popular presets, we reduce the decision from 3+ steps to a single click for most customers.",
    purpose:
      "Increase configurator completion rate and reduce drop-off by simplifying the decision process, particularly for mobile users where multi-step selection is more cumbersome.",
    category: "ux",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product buy page configurator section on desktop. Three preset cards in horizontal row with 12px gaps: 'Most Popular' (Titanium Black / 512GB / $2,199), 'Best Value' (Titanium Gray / 256GB / $1,899), 'Pro Choice' (Titanium Blue / 1TB / $2,499). Each card (200px wide) shows device image, storage label in 14px medium, and price in 18px bold #111. Selected card has blue (#2189FF) 3px border with light blue background (#F0F6FF). Unselected cards have 1px #E0E0E0 border. Card labels in 11px uppercase #757575 above cards. Below presets: 'Customize Your Own →' text link in 14px #2189FF. Section title 'Choose your configuration' in 22px bold. Clean white background. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add 'Notify Me' for Out-of-Stock Configurations",
    description:
      "Replace the current disabled/out-of-stock state (`.is-out-stock`) in the product configurator with a 'Notify Me' button. When a color/storage combination is unavailable, instead of a grayed-out disabled option, show a 'Notify Me When Available' button that opens a simple email/SMS signup modal. Include an estimated restock date if available.",
    reason:
      "Out-of-stock configurations are currently dead ends — customers who want a specific color/storage combo that's sold out have no path forward. A 'Notify Me' flow captures intent and enables recovery. Research shows back-in-stock notifications have 60-80% open rates and can recover 10-15% of lost sales. This is particularly relevant for popular Galaxy configurations during launch windows.",
    purpose:
      "Recapture demand from out-of-stock configurations by converting dead-end states into lead capture opportunities, and recover sales when stock returns.",
    category: "ux",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product configurator (hubble-product__options) on desktop. Color selector with section heading 'Colour' in 16px medium #333. Shows 4 color circles (44px diameter, 12px spacing): Titanium Black (available, blue #2189FF 3px selected ring), Titanium Gray (out of stock — dashed 2px border #CCC with small bell icon 🔔 centered overlay at 60% opacity and 'Notify Me' text in 11px #757575 below), Titanium Blue (available, 1px #E0E0E0 border), Titanium Silver (available, 1px #E0E0E0 border). Hover tooltip on out-of-stock option: white card with shadow, text 'Expected back: May 28' in 12px. Below colors, storage selector row. Clean white background, Samsung design system with 24px section padding. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add Sticky Mobile Bottom Bar for Key Actions",
    description:
      "On mobile product pages, replace the current sticky price bar with an enhanced bottom bar that includes: current price (with trade-in price toggle), 'Add to Cart' CTA, and a secondary 'Save for Later' heart icon. The bar should be always visible, thumb-friendly (minimum 48px tap targets), and collapse minimally when scrolling down.",
    reason:
      "Mobile e-commerce conversion rates are typically 30-50% lower than desktop, often due to harder-to-reach CTAs. Samsung's mobile product pages have the price bar, but it's not always visible during scrolling, and key actions require scrolling back up. A persistent bottom bar keeps the primary CTA in the thumb zone at all times.",
    purpose:
      "Increase mobile add-to-cart rate by ensuring the primary CTA is always accessible in the thumb-friendly zone, reducing the friction of scrolling back up to add to cart.",
    category: "mobile",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU mobile product page on iPhone 15 Pro viewport (393×852). Persistent sticky bottom bar with dark background (#1A1A2E) spanning full width, 56px height with 1px top border in #333. Left section: price '$2,199' in 20px white bold with smaller 'or from $91/mo with trade-in' in 11px #999 below. Center: small heart/save icon (24px, #999 outline style). Right: large blue 'Add to Cart' button (#2189FF, 24px rounded corners, 48px height, 160px width) with white 15px bold text. All touch targets minimum 44px. Above the bar, product image gallery with swipe dots and key specs (display, camera, battery) partially visible during scroll. Samsung mobile design language, thumb-friendly zone (bottom 48px of viewport).",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── Trust ──
  {
    title: "Add Persistent Trust Bar Below the Product Hero",
    description:
      "Add a horizontal trust bar directly below the product title/price area (above the configurator) on the product buy page. The bar should display 3-4 trust icons with short labels: '🚚 Free Delivery', '↩️ 14-Day Returns', '🛡️ Australian Warranty', '⭐ 4.8/5 from 2.3k reviews'. Each icon should be clickable for more details. The bar should be compact (single row) and visible without scrolling.",
    reason:
      "Trust is a critical conversion factor, especially for high-ticket electronics ($1,000+). Baymard Institute found that 18% of cart abandonments are due to trust concerns. Samsung's warranty and return policy are competitive advantages but are buried in the footer. Moving trust signals above the fold addresses concerns before they become objections.",
    purpose:
      "Reduce purchase anxiety and cart abandonment by prominently displaying trust and value assurances at the point of purchase consideration, before the user reaches the configurator.",
    category: "trust",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy product buy page section between product title/price and configurator on desktop. Horizontal trust bar with light gray background (#F7F8FA), 8px rounded corners, 48px tall, spanning full content width with 16px horizontal padding. 4 equally-spaced items in a row using flex layout, each with simple 20px line icon and short label in 13px Samsung One #555: truck icon + 'Free Delivery', return arrow icon + '14-Day Returns', shield icon + 'Aus Warranty', star icon + '4.8 ★ (2.3k reviews)'. Icons rendered in subtle blue-gray (#6B7B8D), labels in #555. Each item separated by thin 1px vertical divider (#E0E0E0). Clean minimal design with 8px icon-label gap. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Display Australian Warranty and Local Support Prominently",
    description:
      "Add a dedicated 'Why Buy From Samsung Australia' section near the add-to-cart area on the product page, highlighting: Australian warranty (not international gray market), local customer support in Australian timezone, authorized service centers, and genuine Australian stock. This is especially important for combating gray-market imports and building trust with AU customers.",
    reason:
      "Australian consumers are particularly concerned about gray-market electronics and warranty coverage. Samsung's official Australian warranty and support are significant competitive advantages over parallel importers and marketplaces like Kogan. Research shows that warranty prominence can increase conversion by 8-12% for electronics.",
    purpose:
      "Increase conversion by differentiating Samsung's official AU store from gray-market alternatives (Kogan, eBay) and addressing a known Australian consumer concern about electronics warranty coverage.",
    category: "trust",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product buy page right sidebar on desktop (300px wide column). Compact info box titled 'Why Buy Direct From Samsung Australia' in 16px Samsung One bold #111, with blue left border accent (#2189FF, 4px wide) and light blue-tinted background (#F0F6FF). 3 bullet points with small 16px icons and 13px #333 text, 8px vertical spacing: '🇦🇺 Genuine Australian Stock', '🛡️ Full Australian Warranty', '📞 Local Support (AEST hours)'. Each bullet has 4px spacing between icon and text. 'Learn More →' text link in 13px #2189FF at bottom with 12px top margin. Info box has 16px internal padding and 8px rounded corners. Subtle 1px #D0DFF0 border. Desktop viewport 1440×900, sidebar position.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── CTA ──
  {
    title: "Make Trade-In Price the Primary Display Price",
    description:
      "On the product buy page, prominently display the trade-in discounted price as the primary/hero price, with the full RRP shown as a strikethrough secondary price. For example: show '$1,699' large and bold (after $500 trade-in), with '$2,199' crossed out above it. Add a toggle to switch between 'with trade-in' and 'full price' views. The hubble-price-bar should default to showing the trade-in price.",
    reason:
      "Samsung's trade-in program is a major conversion driver (100+ code mentions in the product page) but currently requires users to opt-in and calculate the value themselves. By showing the trade-in price by default, we anchor customers to the lower price. Anchoring bias (Kahneman & Tversky) makes the trade-in price feel like the 'real' price and the full price feel like a premium for not trading in.",
    purpose:
      "Increase trade-in adoption rate and overall conversion by anchoring customers to the lower trade-in price, making the purchase feel more affordable and the trade-in feel like a loss if not used.",
    category: "cta",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy S26 Ultra product buy page hero pricing area on desktop. Strikethrough '$2,199' in 16px gray (#999) with line-through decoration above. Large bold '$1,699' in Samsung blue (#2189FF) as primary price, 36px Samsung One bold with subtle text-shadow. Next to price, small rounded tag 'with trade-in' in 11px white text on blue (#2189FF) 12px pill background. Toggle switch (iOS-style, 44px wide, blue when active) to switch between trade-in and full price views. Below price section, small 13px #555 text: 'Save $500 when you trade in your old device'. Sticky hubble-price-bar at bottom also reflects trade-in price with consistent styling. Clean white background, hero area above the fold with 40px top padding. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Show Monthly Installment Price on Product Cards and Price Bar",
    description:
      "Display the monthly BNPL installment price prominently alongside the full price on product cards (category pages), the hubble-price-bar, and the product hero area. Format: '$2,199 or from $91.63/mo with Afterpay'. The installment price should be shown in a slightly smaller but still prominent font. Include the BNPL provider logo (Afterpay, PayPal Pay in 4).",
    reason:
      "Price framing significantly impacts purchase decisions. Showing a $91/month price makes a $2,199 phone feel dramatically more accessible. This is a proven tactic used by Apple (shows monthly pricing prominently) and carriers. Samsung AU has BNPL options but currently just shows logos — the actual monthly cost requires mental math, which creates friction.",
    purpose:
      "Increase conversion by making high-ticket purchases feel more accessible through monthly price framing, particularly effective for price-sensitive AU shoppers who use BNPL services.",
    category: "cta",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product card on category grid page, desktop. White card (280px wide, 8px rounded corners, subtle 1px #E8E8E8 border). Card shows Galaxy S26 Ultra image centered, product name 'Galaxy S26 Ultra' in 16px Samsung One medium #111 below, then pricing stack: small strikethrough gray 'RRP $2,199' in 13px #999, bold black 'Now $1,999' in 20px #111, and Samsung blue (#2189FF) 'or from $83.29/mo with Afterpay' in 14px with small Afterpay logo (16px). Below pricing, small 'Learn More' button in outlined style. Clean white card on light gray (#F5F5F5) page background. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── Bundle ──
  {
    title: "Show Ecosystem Cross-Sell: 'Works With Your Galaxy'",
    description:
      "On the product page (near the add-to-cart area) and in the cart, add a 'Works With Your Galaxy' ecosystem cross-sell section. Show 2-3 complementary products (Galaxy Buds, Galaxy Watch, charger) with short descriptions of how they integrate ('Seamless auto-switching', 'Health tracking syncs to Samsung Health'). Show bundle pricing with total savings.",
    reason:
      "Samsung's ecosystem (phone + watch + buds) is a key competitive advantage vs. other Android manufacturers. Apple generates ~20% of iPhone revenue from accessories — Samsung has similar potential. Ecosystem cross-sells leverage the sunk cost effect: once a customer commits to a Galaxy phone, adding buds/watch feels like maximizing their investment.",
    purpose:
      "Increase average order value by presenting relevant ecosystem accessories at the moment of purchase, leveraging the customer's commitment to the Samsung ecosystem.",
    category: "bundle",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU Galaxy phone product buy page, section below configurator on desktop. 'Complete Your Galaxy Experience' section heading in 22px Samsung One bold #111. 3 horizontal product cards (200px each, 8px gap, white with 1px #E8E8E8 border, 8px rounded): Galaxy Buds3 Pro ($349, 'Seamless auto-switching' in 12px #666 below), Galaxy Watch7 ($549, 'Syncs with Samsung Health'), 45W Charger ($49, 'Super Fast Charging 2.0'). Each card: product image, product name in 14px medium, 12px #666 description, price in 16px bold #111, and checkbox 'Add'. Bottom summary bar with light blue (#F0F6FF) background: 'Bundle Total: $2,197 — Save $150' in 16px bold, 'Add All to Cart' blue button (#2189FF, 40px height). Clean white background. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Add Progressive Bundle Upsell in Cart",
    description:
      "When a customer adds a Galaxy phone to their cart, show a non-intrusive upsell modal or inline suggestion: 'Customers who bought Galaxy S26 Ultra also added...' with 2-3 accessory options at a bundled discount. Make it a single-click add. If the customer declines, show a secondary upsell on the cart page itself with 'Complete your setup' recommendations.",
    reason:
      "Post-add-to-cart is the highest-intent moment — the customer has already committed. Amazon reports that 35% of revenue comes from cross-sells. Samsung's cart is on a separate subdomain (shop.samsung.com/au), which creates an opportunity to present cross-sells both on the product page (before redirect) and on the cart page.",
    purpose:
      "Increase average order value by capturing post-commitment momentum with relevant accessory upsells, at both the moment of add-to-cart and on the cart page.",
    category: "bundle",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU post-add-to-cart modal on mobile (393×852). Small modal displayed after clicking 'Add to Cart' on Galaxy S26 Ultra page. Header: 'Added to Cart! 🎉' with green checkmark. Body: 'Complete your setup:' with 3 small product cards: Galaxy Buds3 Pro ($349, 'Save $50 when bundled'), 45W Charger ($49), Silicone Case ($69). Each has small image and 'Add' button. Bottom: 'No thanks, go to cart' text link. White modal with subtle shadow, rounded top corners, Samsung clean design.",
    aspectRatio: "9:16",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── Personalization ──
  {
    title: "Add 'Recently Viewed' Carousel to Product Pages",
    description:
      "Add a 'Recently Viewed' product carousel (similar to co78-recommended-product-carousel) to the bottom of product pages. Show the last 4-6 products the user viewed with their prices and a quick-add-to-cart button. This helps customers who are comparison shopping to easily switch between products they're considering.",
    reason:
      "Samsung's product line has many similar models (S26 vs S26 Ultra vs Z Fold, etc.) and customers frequently compare multiple devices. Without a 'recently viewed' feature, they must use browser back or re-navigate. Research shows recently viewed modules can recover 5-10% of comparison-shopping sessions that would otherwise bounce.",
    purpose:
      "Reduce bounce rate from comparison shoppers and increase conversion by making it easy to return to previously viewed products, shortening the comparison-to-purchase path.",
    category: "personalization",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU product page bottom section on desktop. 'Recently Viewed' horizontal carousel with section heading in 20px Samsung One bold #111, with subtle 'Clear history' link in 12px #2189FF. Left/right arrow navigation buttons (32px circles, #E0E0E0 border). 4 product cards in row with 12px gaps, each 220px wide: Galaxy S26 Ultra (current product, subtle 'You are here' indicator — 2px #2189FF top border accent on card), Galaxy Z Fold6, Galaxy S26, Galaxy Watch7. Each card: product image (160px, centered, white background), product name in 14px medium #333, price in 15px bold #111, small 'View' button (outlined, 28px height). Cards have 1px #EEE border, 6px rounded corners. Clean white page background. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Personalize Homepage Hero Based on Visitor History",
    description:
      "Modify the hd08-hero-kv-home component to serve personalized hero banners based on the visitor's browsing history or segment. Return visitors who browsed smartphones see a phone-focused hero with trade-in messaging. New visitors see a general brand/value hero. Visitors from the education store path see student/educator discount messaging.",
    reason:
      "Personalized CTAs have been shown to increase conversion by 10-25% compared to generic ones (McKinsey research). Samsung's homepage hero is the highest-visibility element on the site — making it relevant to the visitor's interests dramatically increases engagement. The fn23-personalization component exists but only in a limited section, not the hero.",
    purpose:
      "Increase homepage engagement and click-through rate by showing visitors content relevant to their demonstrated interests, reducing the time to find relevant products.",
    category: "personalization",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU homepage hero banner (hd08-hero-kv-home) on desktop. Full-width dark gradient background (#0A1628 to #1A2A44) with Galaxy S26 Ultra device image on right side. Text overlay on left: 'Your Galaxy upgrade awaits' as personalized headline in 36px Samsung One bold white. Supporting copy: 'Trade in your old phone and save up to $500 on the Galaxy S26 Ultra' in 16px #CCC. Two CTA buttons in row with 12px gap: 'Shop Now' (primary, blue #2189FF fill, white text, 48px height, 24px rounded) and 'Check Trade-In Value' (secondary, white outline 2px, white text). Small 11px 'Based on your interests' label in #888. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── Navigation ──
  {
    title: "Show Cart Item Count and Value in Persistent Header",
    description:
      "Enhance the cart icon in the global navigation (nv00-gnb-v4) to show not just the item count badge but also the subtotal value on hover/click. When a user hovers over the cart icon, show a mini-dropdown with: item count, subtotal, and a 'View Cart' CTA. On mobile, the cart icon should always be visible (not hidden behind hamburger).",
    reason:
      "The cart icon is the most underutilized high-visibility element in navigation. Showing the cart subtotal on hover reduces the cognitive load of 'how much am I spending?' and keeps the purchase commitment top-of-mind. Currently, the cart only shows an item count badge — adding value visibility aligns with transparency best practices.",
    purpose:
      "Reduce cart abandonment and increase cart revisit rate by making cart contents and value visible without requiring a full page navigation to the separate shop.samsung.com/au domain.",
    category: "navigation",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU global navigation bar (nv00-gnb-v4) top-right section on desktop. White navigation bar, 64px height with 1px #E8E8E8 bottom border. Cart icon (shopping bag outline, 24px, #333) with small red circular badge (#FF3B30) showing '2' in white 10px bold. Hover state: dropdown panel below icon (340px wide) with white background, subtle shadow, 8px rounded corners. Dropdown header: 'Your Cart (2 items)' in 14px bold #111. Two small product rows (60px each): thumbnail, product name in 13px #333, price in 13px bold #111 — Galaxy S26 Ultra ($1,949) and Galaxy Buds3 Pro ($349). Divider line 1px #EEE. Subtotal row: '$2,548' in 16px bold #111. Blue 'View Cart →' button (#2189FF, 36px height). Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },

  // ── Checkout ──
  {
    title: "Add Cart Progress Indicator with Free Shipping Threshold",
    description:
      "Add a progress bar at the top of the cart page showing how close the customer is to free shipping. Display '$X away from free delivery!' with a visual progress bar. Once the threshold is met, show '🎉 You've qualified for free delivery!'. Also add a 3-step checkout progress indicator (Cart → Shipping → Payment) so customers know how many steps remain.",
    reason:
      "Free shipping thresholds are one of the most effective AOV-boosting tactics in e-commerce. Research shows that 48% of shoppers will add items to their cart to qualify for free shipping. Samsung AU offers free delivery but doesn't communicate it as a threshold to aim for. The cart-to-checkout flow also lacks progress visibility, which increases abandonment due to uncertainty.",
    purpose:
      "Increase average order value by motivating customers to reach the free shipping threshold, and reduce checkout abandonment by providing clear progress visibility.",
    category: "checkout",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU cart page (shop.samsung.com/au/cart) on desktop. Top of cart content area: horizontal progress bar (full content width, 6px height, 8px rounded, gray #E8E8E8 track) at ~75% filled with blue (#2189FF) gradient. Text above progress bar: 'Only $101 away from FREE delivery! 🚚' in 14px #333 medium, with 'Shop Accessories →' link in 14px #2189FF. Below progress bar: 3-step checkout indicator — '① Cart' (highlighted blue #2189FF, 14px bold), '② Shipping' (gray #999, 14px), '③ Payment' (gray #999, 14px) — connected by thin #E0E0E0 lines. Below indicator: cart line items visible with product thumbnails, names, quantities, and prices in standard cart row layout. Clean white background. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
  {
    title: "Implement Exit-Intent Modal for Cart Page",
    description:
      "On the cart page (shop.samsung.com/au/cart), implement an exit-intent detection that triggers when the user's mouse moves toward the browser chrome (desktop) or when the back button is pressed (mobile). Show a non-aggressive modal offering: a small discount on accessories, a reminder about trade-in value, or an option to save the cart for later via email.",
    reason:
      "Cart abandonment rates for electronics average 70-80%. Exit-intent popups recover 10-15% of abandoning visitors when done well (OptinMonster data). Samsung's cart is on a separate subdomain, which means users may leave to return to the main site for more browsing — this is a natural exit point to capture with a helpful, non-pushy intervention.",
    purpose:
      "Recover abandoning cart sessions by offering value (discount, trade-in reminder, save-for-later) at the moment of exit, reducing the overall cart abandonment rate.",
    category: "checkout",
    mockupPrompt:
      "UI mockup screenshot, Samsung AU cart page exit-intent overlay on desktop. Centered modal (600px wide) with white background, subtle shadow, 12px rounded corners. Header: 'Before you go...' in 22px Samsung One bold #111. Body: 3 option cards in horizontal row with 12px gaps — '💾 Save your cart for later' (email input field and 'Send Link' button), '💰 Check your trade-in value' ('could save up to $500', 'Check Value' button), '🎁 Add Galaxy Buds3 Pro and save $50' (product image, 'Add to Cart' button). Each card: 170px wide, 1px #EEE border, 8px rounded. Small 'No thanks, I'll come back later' text link in 13px #999 at bottom. Desktop viewport 1440×900.",
    aspectRatio: "16:9",
    negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
  },
];

// ─── Mock LLM Client Implementation ─────────────────────────────────────

/**
 * Shuffle an array using Fisher-Yates algorithm.
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Mock LLM client that returns realistic Samsung AU CRO ideas.
 *
 * Each call shuffles the idea pool and selects the requested count,
 * ensuring different categories are represented and ideas vary between calls.
 */
class MockLLMClient implements LLMClient {
  private callCount = 0;

  async chat(_messages: ChatMessage[]): Promise<string> {
    this.callCount++;

    // Parse the user message to extract desired count
    const userMsg = _messages.find((m) => m.role === "user")?.content || "";
    const countMatch = userMsg.match(/exactly (\d+) CRO ideas/i);
    const count = countMatch ? parseInt(countMatch[1], 10) : 4;
    const actualCount = Math.max(3, Math.min(5, count));

    // Shuffle the idea pool with a seed influenced by call count for variety
    const shuffled = shuffle(IDEA_POOL);

    // Ensure category diversity: pick one from each category first, then fill
    const selected: IdeaTemplate[] = [];
    const usedCategories = new Set<string>();

    // Round 1: pick diverse categories
    for (const idea of shuffled) {
      if (selected.length >= actualCount) break;
      if (!usedCategories.has(idea.category)) {
        selected.push(idea);
        usedCategories.add(idea.category);
      }
    }

    // Round 2: fill remaining slots
    if (selected.length < actualCount) {
      for (const idea of shuffled) {
        if (selected.length >= actualCount) break;
        if (!selected.includes(idea)) {
          selected.push(idea);
        }
      }
    }

    // Shuffle again for random ordering
    const final = shuffle(selected.slice(0, actualCount));

    return JSON.stringify({ ideas: final }, null, 2);
  }
}

/**
 * Create a mock LLM client for testing without real API keys.
 */
export function createMockLLMClient(): LLMClient {
  return new MockLLMClient();
}
