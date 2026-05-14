/**
 * LLM Prompt Templates for CRO Idea Generation
 *
 * System and user prompts that incorporate Samsung AU-specific context
 * from the knowledge base to generate targeted, realistic CRO ideas.
 */

import {
  CRO_CATEGORIES,
  SAMSUNG_CONTEXT,
  OPPORTUNITY_ZONES,
  BEST_PRACTICES,
  COMPONENTS,
  CategoryInfo,
} from "./knowledge-base";

// ─── System Prompt Builder ──────────────────────────────────────────────

function buildCategoryList(): string {
  return CRO_CATEGORIES.map(
    (c: CategoryInfo) => `- **${c.slug}**: ${c.description}`
  ).join("\n");
}

function buildComponentsSummary(): string {
  return COMPONENTS.map(
    (c) =>
      `- **${c.name}** (${c.className}) — ${c.location}: ${c.croNotes}`
  ).join("\n");
}

function buildOpportunityZones(): string {
  return OPPORTUNITY_ZONES.map(
    (z) =>
      `### ${z.zone} [Impact: ${z.impact}]
${z.description}

Potential tests:
${z.potentialTests.map((t) => `- ${t}`).join("\n")}`
  ).join("\n\n");
}

function buildBestPractices(): string {
  return BEST_PRACTICES.map(
    (bp) =>
      `- **${bp.tactic}** (${bp.samsungRelevance} relevance): ${bp.description} — Example: "${bp.exampleIdea}"`
  ).join("\n");
}

export function buildSystemPrompt(): string {
  const categories = buildCategoryList();
  const components = buildComponentsSummary();
  const zones = buildOpportunityZones();
  const practices = buildBestPractices();
  const existingElements = SAMSUNG_CONTEXT.existingCROElements
    .map((e) => `- ✅ ${e}`)
    .join("\n");
  const missingElements = SAMSUNG_CONTEXT.missingElements
    .map((e) => `- ❌ ${e}`)
    .join("\n");

  return `You are a senior CRO (Conversion Rate Optimization) strategist specializing in e-commerce, 
with deep expertise in consumer electronics and mobile devices.

## Your Task
Generate targeted, actionable CRO ideas for Samsung Australia's website (samsung.com/au).

## About Samsung AU
- **Market:** ${SAMSUNG_CONTEXT.market}
- **Main domain:** ${SAMSUNG_CONTEXT.domain}
- **Shop domain:** ${SAMSUNG_CONTEXT.shopDomain}
- **Key programs:** Trade-in (major conversion driver), bundle discounts, BNPL financing (Afterpay, PayPal), 
  education/gov affinity stores, Samsung Live Shop, seasonal campaigns

## Samsung AU — Existing CRO Elements
${existingElements}

## Samsung AU — Missing Elements (Opportunities)
${missingElements}

## Key Components Identified on Samsung AU
${components}

## CRO Opportunity Zones
${zones}

## Electronics E-Commerce CRO Best Practices
${practices}

## Available Categories for Ideas
${categories}

## Competitor References
${SAMSUNG_CONTEXT.competitors
    .map((c) => `- **${c.name}**: ${c.strengths}`)
    .join("\n")}

## Output Requirements
You MUST respond with a valid JSON object containing a "ideas" array with exactly the requested number of ideas. 
Each idea must have these fields:

- **title** (string): A concise, descriptive title for the CRO idea (5-10 words)
- **description** (string): What the change is — describe the specific UI/UX change in detail, 
  referencing Samsung AU's actual components (e.g., "Modify the sticky hubble-price-bar to show...")
- **reason** (string): Why this is a good CRO idea — include data-driven rationale, industry benchmarks, 
  or behavioral psychology principles that support this change
- **purpose** (string): What this aims to achieve — be specific about the conversion metric 
  (e.g., "Increase add-to-cart rate by reducing friction in the configurator", 
  "Increase trade-in adoption rate by making the value proposition more visible")
- **category** (string): ONE category slug from the list above that best fits this idea
- **mockupPrompt** (string): A detailed prompt for an AI image generator (like MiniMax) to create a
  mockup of this change. The mockup MUST be described as a React component / Figma UI design —
  a clean, professional product design wireframe showing the actual UI element. Include:
  the page type, the component being modified, layout details, specific elements and their positions,
  color scheme (Samsung uses dark themes with white text on product pages, clean white backgrounds on info pages),
  and the key visual change. Describe what the UI component looks like as a product designer would
  in a Figma file: "A mobile sticky bottom bar with a large 'Add to Cart' button, countdown timer,
  and trust badges in a horizontal row" — NOT "a screenshot of a website". Be specific about
  positioning, sizing, and visual treatment. Output the mockupPrompt in English.

## CRITICAL RULES
1. Every idea MUST reference specific Samsung AU components, pages, or programs
2. Every idea MUST be feasible to implement on an e-commerce website
3. Every idea MUST target a specific conversion metric
4. Ideas MUST be diverse — cover different categories and page types
5. DO NOT suggest ideas for elements that already exist (e.g., don't suggest adding Afterpay if it's already there)
6. The mockupPrompt MUST describe a React component / Figma-style UI design mockup — clean product design wireframe, NOT a website screenshot or photography. Describe UI elements like a product designer: component layouts, spacing, typography, color chips. No real-world photography or people.
7. Focus on ideas that leverage what's MISSING (see the missing elements list) or improve what EXISTS

## Response Format
\`\`\`json
{
  "ideas": [
    {
      "title": "Add Live Stock Counter to Sticky Price Bar",
      "description": "...",
      "reason": "...",
      "purpose": "...",
      "category": "urgency",
      "mockupPrompt": "..."
    }
  ]
}
\`\`\`

Respond ONLY with the JSON object — no preamble, no explanations outside the JSON.`;
}

// ─── User Prompt Builder ────────────────────────────────────────────────

export function buildUserPrompt(
  count: number = 4,
  existingTitles?: string[],
): string {
  const dedupSection =
    existingTitles && existingTitles.length > 0
      ? `\n\n## PREVIOUSLY GENERATED IDEAS — DO NOT DUPLICATE\nThe following CRO ideas have already been generated recently. You MUST NOT suggest ideas that are the same as, or very similar to, any of these:\n${existingTitles.map((t) => `- ❌ "${t}"`).join("\n")}\n\nGenerate entirely NEW and DIFFERENT ideas that explore other CRO opportunities.`
      : "";

  return `Generate exactly ${count} CRO ideas for Samsung Australia's website (samsung.com/au).

Focus areas for this batch:
- The product buy page (configurator, price bar, bundles, trade-in)
- Trust and social proof (underutilized site-wide)
- Urgency/scarcity mechanics (almost entirely absent)
- Mobile experience optimization
- Bundle/combo presentation improvements

Make sure each idea is specific to Samsung AU — reference actual components (hubble-price-bar, pd17-combo-package-api, hd08-hero-kv-home, hubble-product__options, etc.) and Samsung programs (trade-in, bundles, financing, Live Shop, education store).
${dedupSection}
Respond ONLY with the JSON object containing ${count} ideas.`;
}
