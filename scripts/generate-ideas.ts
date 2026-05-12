/**
 * CLI Script: Generate CRO Ideas
 *
 * Usage:
 *   npx tsx scripts/generate-ideas.ts [--count 4] [--dry-run]
 *
 * Options:
 *   --count N     Number of ideas to generate (3-5, default 4)
 *   --dry-run     Print ideas to console without saving to database
 *
 * Examples:
 *   npx tsx scripts/generate-ideas.ts
 *   npx tsx scripts/generate-ideas.ts --count 5
 *   npx tsx scripts/generate-ideas.ts --count 3 --dry-run
 */

import { generateCROIdeas, GeneratedCROIdea } from "../src/lib/research/generator";

// ─── CLI Argument Parsing ───────────────────────────────────────────────

interface CLIOptions {
  count: number;
  dryRun: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  let count = 4;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--count" && i + 1 < args.length) {
      const parsed = parseInt(args[i + 1], 10);
      if (!isNaN(parsed) && parsed >= 3 && parsed <= 5) {
        count = parsed;
      } else {
        console.warn(`Invalid count "${args[i + 1]}". Using default (4).`);
      }
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }

  return { count, dryRun };
}

// ─── Database Saving ────────────────────────────────────────────────────

async function saveToDatabase(ideas: GeneratedCROIdea[]): Promise<string> {
  // Dynamic import to avoid issues if Prisma isn't generated
  const { prisma } = await import("../src/lib/prisma");

  const batchId = `batch-${Date.now()}`;

  for (const idea of ideas) {
    const name = idea.category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const category = await prisma.category.upsert({
      where: { slug: idea.category },
      update: {},
      create: { name, slug: idea.category },
    });

    await prisma.cROIdea.create({
      data: {
        title: idea.title,
        description: idea.description,
        reason: idea.reason,
        purpose: idea.purpose,
        categoryId: category.id,
        mockupPrompt: idea.mockupPrompt,
        batchId,
      },
    });
  }

  return batchId;
}

// ─── Display ────────────────────────────────────────────────────────────

function displayIdeas(ideas: GeneratedCROIdea[]): void {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`  Generated ${ideas.length} CRO Ideas for Samsung AU`);
  console.log(`${"=".repeat(80)}\n`);

  ideas.forEach((idea, index) => {
    console.log(`  📌 Idea #${index + 1}: ${idea.title}`);
    console.log(`     Category: ${idea.category}`);
    console.log(`     Description: ${idea.description}`);
    console.log(`     Reason: ${idea.reason}`);
    console.log(`     Purpose: ${idea.purpose}`);
    console.log(`     Mockup Prompt: ${idea.mockupPrompt.slice(0, 150)}...`);
    console.log();
  });
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { count, dryRun } = parseArgs();

  console.log(`🤖 Generating ${count} CRO ideas for Samsung AU...`);
  if (dryRun) {
    console.log("🧪 DRY RUN mode — ideas will NOT be saved to the database.\n");
  }

  const startTime = Date.now();
  const ideas = await generateCROIdeas({ count });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (ideas.length === 0) {
    console.error("❌ Failed to generate any valid ideas.");
    process.exit(1);
  }

  displayIdeas(ideas);

  if (dryRun) {
    console.log(`🧪 Dry run complete. ${ideas.length} ideas generated in ${elapsed}s (not saved).`);
  } else {
    try {
      console.log("💾 Saving ideas to database...");
      const batchId = await saveToDatabase(ideas);
      console.log(`✅ Saved ${ideas.length} ideas to database (batch: ${batchId}) in ${elapsed}s.`);
    } catch (error) {
      console.error("❌ Failed to save to database:", error);
      console.log("\n💡 Tip: Use --dry-run to test without a database connection.");
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
