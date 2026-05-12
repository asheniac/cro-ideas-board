import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const demoIdeas = [
  {
    title: "Add urgency countdown to product pages",
    description:
      "Display a subtle countdown timer showing limited-time deals on product pages, creating time pressure to purchase.",
    reason:
      "Urgency is a proven CRO tactic. Samsung's product pages currently show no time-sensitive elements. Adding a countdown for promos can increase conversion by 10-15%.",
    purpose:
      "Increase purchase velocity and reduce cart abandonment by leveraging scarcity psychology.",
    category: "urgency",
    status: "pending",
  },
  {
    title: "Add social proof notification bar",
    description:
      "Show real-time notifications like '12 people are viewing this product' or 'Purchased 5 times today' near the buy button.",
    reason:
      "Social proof is one of the strongest conversion drivers. Samsung's pages have reviews tucked away at the bottom. A prominent social proof bar would increase trust and FOMO.",
    purpose:
      "Boost buyer confidence and reduce hesitation at the purchase decision point.",
    category: "social-proof",
    status: "pending",
  },
  {
    title: "Improve mobile product comparison tool",
    description:
      "Build a sticky floating compare button that opens a slide-up comparison panel on mobile, rather than the current desktop-oriented comparison page.",
    reason:
      "Samsung's comparison feature is hard to use on mobile. Over 60% of AU traffic is mobile. Improving this would directly impact conversion for high-consideration purchases.",
    purpose:
      "Reduce the 'compare elsewhere' behavior that leads to competitor site visits.",
    category: "ux",
    status: "pending",
  },
  {
    title: "Add sticky 'Add to Cart' with upsell cross-sell",
    description:
      "Keep the CTA always visible on mobile with a bottom sticky bar. Include a subtle accessory upsell (case, charger) before adding to cart.",
    reason:
      "The Add to Cart button scrolls off screen on long product pages. Sticky CTAs can lift mobile conversion by 8-12%. Adding a low-friction upsell increases AOV.",
    purpose:
      "Increase mobile add-to-cart rate and average order value.",
    category: "cta",
    status: "pending",
  },
  {
    title: "Add trust badges near payment section",
    description:
      "Place security badges (SSL, Afterpay, Zip, Samsung warranty) prominently near the purchase button to reassure buyers.",
    reason:
      "For high-value electronics purchases, trust signals are critical. Samsung's current layout buries warranty and payment info in expandable sections.",
    purpose:
      "Reduce payment anxiety and last-second drop-offs at checkout.",
    category: "trust",
    status: "pending",
  },
];

async function main() {
  console.log("Seeding demo CRO ideas...");
  for (const idea of demoIdeas) {
    await prisma.cROIdea.create({ data: idea });
    console.log(`  ✅ ${idea.title}`);
  }
  console.log(`\nSeeded ${demoIdeas.length} ideas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
