#!/usr/bin/env npx tsx
/**
 * CLI Script: Unified Pipeline Runner
 *
 * Usage:
 *   npx tsx scripts/run-pipeline.ts [--count N] [--dry-run]
 *
 * Options:
 *   --count N     Number of ideas to generate (3-5, default 4)
 *   --dry-run     Generate ideas and print them, but don't save to DB or generate mockups
 *
 * Prerequisites:
 *   - DATABASE_URL in .env
 *   - RESEARCH_SECRET in .env (not checked directly, but generator/API may need it)
 *   - MINIMAX_API_KEY in .env (for mockup generation)
 *   - BLOB_READ_WRITE_TOKEN in .env (for mockup persistence)
 *   - ANTHROPIC_API_KEY or OPENAI_API_KEY in .env (for LLM-powered idea generation)
 *
 * Uses the shared pipeline core from src/lib/pipeline.ts — no HTTP server needed.
 * Direct Prisma/function imports.
 */

import "dotenv/config";

// ─── CLI Argument Parsing ───────────────────────────────────────────────────

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
        console.warn(`⚠️  Invalid count "${args[i + 1]}". Using default (4).`);
      }
      i++;
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    } else if (args[i] === "--help" || args[i] === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  return { count, dryRun };
}

function printUsage(): void {
  console.log(`
Usage: npx tsx scripts/run-pipeline.ts [options]

Options:
  --count N     Number of ideas to generate (3-5, default 4)
  --dry-run     Generate ideas only — skip DB storage and mockup generation
  --help, -h    Show this help message

Examples:
  npx tsx scripts/run-pipeline.ts
  npx tsx scripts/run-pipeline.ts --count 5
  npx tsx scripts/run-pipeline.ts --count 3 --dry-run
`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { count, dryRun } = parseArgs();

  console.log("🚀 Pipeline Runner");
  console.log(`   Count: ${count} ideas`);
  console.log(`   Mode: ${dryRun ? "DRY RUN (no DB, no mockups)" : "FULL (generate → store → mockup)"}`);
  console.log();

  // Dynamically import the pipeline core (works with tsx path resolution)
  const { runPipeline } = await import("../src/lib/pipeline");

  const result = await runPipeline({ count, dryRun });

  console.log();
  console.log("═".repeat(60));
  console.log("  Pipeline Summary");
  console.log("═".repeat(60));
  console.log(`  Pipeline Run ID:   ${result.pipelineRunId}`);
  console.log(`  Ideas Generated:   ${result.ideasGenerated}`);
  console.log(`  Mockups Succeeded: ${result.mockupsSucceeded}`);
  console.log(`  Mockups Failed:    ${result.mockupsFailed}`);
  console.log(`  Total Duration:    ${(result.totalDuration / 1000).toFixed(1)}s`);
  console.log("═".repeat(60));

  if (result.errors.length > 0) {
    console.log(`\n⚠️  ${result.errors.length} error(s):`);
    for (const err of result.errors) {
      console.log(`   - ${err}`);
    }
  }

  if (result.ideasGenerated === 0) {
    console.error("\n❌ No ideas were generated.");
    process.exit(1);
  }

  console.log("\n✅ Pipeline complete.");
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
