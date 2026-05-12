#!/usr/bin/env npx tsx
/**
 * CLI script for batch mockup generation.
 *
 * Usage:
 *   npx tsx scripts/generate-mockups.ts [--idea-id N] [--batch BATCH_ID] [--all-pending]
 *
 * Options:
 *   --idea-id N       Generate mockup for a specific idea ID only
 *   --batch BATCH_ID  Generate mockups for all ideas in a batch
 *   --all-pending     Generate mockups for ALL ideas with a mockupPrompt but no mockupUrl
 *   (no args)         Default: generate mockups for seed ideas (batch "seed-batch-001")
 *
 * Prerequisites:
 *   - DATABASE_URL in .env
 *   - RESEARCH_SECRET in .env
 *   - MINIMAX_API_KEY in .env
 *   - BLOB_READ_WRITE_TOKEN in .env
 *   - Local dev server running on http://localhost:3000
 */

import "dotenv/config";

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const RESEARCH_SECRET = process.env.RESEARCH_SECRET;

if (!RESEARCH_SECRET) {
  console.error("❌ RESEARCH_SECRET is not set in .env");
  process.exit(1);
}

// ── Parse CLI arguments ──
const args = process.argv.slice(2);

interface Options {
  ideaId?: number;
  batch?: string;
  allPending: boolean;
}

function parseArgs(args: string[]): Options {
  const opts: Options = { allPending: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--idea-id" && args[i + 1]) {
      opts.ideaId = parseInt(args[i + 1], 10);
      if (isNaN(opts.ideaId)) {
        console.error(`❌ Invalid idea ID: ${args[i + 1]}`);
        process.exit(1);
      }
      i++;
    } else if (args[i] === "--batch" && args[i + 1]) {
      opts.batch = args[i + 1];
      i++;
    } else if (args[i] === "--all-pending") {
      opts.allPending = true;
    } else if (args[i] === "--help" || args[i] === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  return opts;
}

function printUsage() {
  console.log(`
Usage: npx tsx scripts/generate-mockups.ts [options]

Options:
  --idea-id N       Generate mockup for a specific idea ID
  --batch BATCH_ID  Generate mockups for all ideas in a batch
  --all-pending     Generate mockups for all ideas with a mockupPrompt but no mockupUrl
  --help, -h        Show this help message

Default (no args): Generate mockups for seed ideas (batch "seed-batch-001")
`);
}

// ── Main ──
async function main() {
  const opts = parseArgs(args);

  // Determine which ideas to fetch
  let url: string;
  let label: string;

  if (opts.ideaId) {
    // Single idea — call the mockup API directly
    console.log(`🎨 Generating mockup for idea #${opts.ideaId}...\n`);
    await generateMockup(opts.ideaId, 1, 1);
    console.log("\n✅ Done.");
    return;
  }

  // Batch mode — fetch ideas list first
  const params = new URLSearchParams();
  if (opts.batch) {
    params.set("batch", opts.batch);
    label = `batch "${opts.batch}"`;
  } else if (opts.allPending) {
    params.set("allPending", "true");
    label = "all pending ideas";
  } else {
    params.set("batch", "seed-batch-001");
    label = 'seed batch "seed-batch-001"';
  }

  url = `${API_BASE}/api/ideas?${params.toString()}`;
  console.log(`📋 Fetching ideas for ${label}...`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`❌ Failed to fetch ideas: HTTP ${response.status}`);
    process.exit(1);
  }

  const ideas: Array<{ id: number; mockupPrompt: string | null; mockupUrl: string | null }> =
    await response.json();

  if (ideas.length === 0) {
    console.log("ℹ️  No ideas found matching the criteria.");
    return;
  }

  // Filter to ideas that have a mockupPrompt but no mockupUrl
  const pending = ideas.filter((i) => i.mockupPrompt && !i.mockupUrl);
  console.log(
    `Found ${ideas.length} idea(s) total, ${pending.length} pending mockup generation.\n`
  );

  if (pending.length === 0) {
    console.log("✅ All ideas already have mockups. Nothing to do.");
    return;
  }

  const total = pending.length;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < total; i++) {
    const idea = pending[i];
    const progress = `[${i + 1}/${total}]`;
    console.log(`🎨 ${progress} Generating mockup for idea #${idea.id}...`);

    try {
      await generateMockup(idea.id, i + 1, total);
      success++;
    } catch (err) {
      console.error(
        `  ❌ Failed for idea #${idea.id}:`,
        err instanceof Error ? err.message : err
      );
      failed++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ ${success} succeeded, ❌ ${failed} failed (${total} total)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

async function generateMockup(
  ideaId: number,
  current: number,
  total: number
): Promise<void> {
  const progress = `[${current}/${total}]`;

  const res = await fetch(`${API_BASE}/api/research/mockup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ideaId,
      secret: RESEARCH_SECRET,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  console.log(`  ${progress} ✅ Idea #${ideaId} → ${data.mockupUrl}`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
