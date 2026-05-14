/**
 * Unified Pipeline Runner — Shared Core
 *
 * Chains: generate ideas → store in DB → auto-trigger mockup generation → report results.
 * Used by both the API route (POST /api/pipeline/run) and the CLI script (scripts/run-pipeline.ts).
 *
 * Handles partial failures gracefully: ideas are stored even if MiniMax mockup generation
 * fails for some of them. All operations are logged as structured JSON for observability.
 */

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { generateCROIdeas, type GeneratedCROIdea } from "@/lib/research/generator";
import {
  generateImage,
  buildMockupPrompt,
  UI_MOCKUP_NEGATIVE_PROMPT,
} from "@/lib/research/minimax-client";
import { downloadImage } from "@/lib/storage/download";
import { uploadImageToBlob } from "@/lib/storage/blob";
import { log } from "@/lib/utils/logger";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PipelineOptions {
  /** Number of ideas to generate (3-5, default 4) */
  count?: number;
  /** If true, generate ideas but skip DB storage and mockup generation */
  dryRun?: boolean;
}

export interface PipelineResult {
  /** UUID identifying this pipeline run (used as batchId for stored ideas) */
  pipelineRunId: string;
  /** Number of ideas successfully generated and stored */
  ideasGenerated: number;
  /** Number of mockup images successfully generated and stored */
  mockupsSucceeded: number;
  /** Number of mockup generation attempts that failed */
  mockupsFailed: number;
  /** Total wall-clock duration of the pipeline in milliseconds */
  totalDuration: number;
  /** Error messages collected during the run (non-fatal — run continues on errors) */
  errors: string[];
}

// ─── Pipeline Implementation ───────────────────────────────────────────────

export async function runPipeline(
  options: PipelineOptions = {},
): Promise<PipelineResult> {
  const pipelineRunId = randomUUID();
  const count = Math.max(3, Math.min(5, options.count ?? 4));
  const errors: string[] = [];
  const startTime = Date.now();

  log("info", "pipeline_start", {
    pipelineRunId,
    count,
    dryRun: options.dryRun || false,
  });

  // ── Step 1: Generate CRO Ideas ────────────────────────────────────────

  let ideas: GeneratedCROIdea[] = [];
  try {
    // ── Fetch recent titles for dedup (last 30 days) ──
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let existingTitles: string[] = [];
    try {
      const recentIdeas = await prisma.cROIdea.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { title: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      existingTitles = recentIdeas.map((i) => i.title);
      log("info", "dedup_titles_fetched", {
        pipelineRunId,
        count: existingTitles.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log("warn", "dedup_fetch_warning", {
        pipelineRunId,
        error: msg,
      });
      // Non-fatal — proceed without dedup titles
    }

    ideas = await generateCROIdeas({ count, existingTitles });
    log("info", "ideas_generated", {
      pipelineRunId,
      count: ideas.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    errors.push(`generate: ${msg}`);
    log("error", "generate_error", {
      pipelineRunId,
      error: msg,
    });
    return {
      pipelineRunId,
      ideasGenerated: 0,
      mockupsSucceeded: 0,
      mockupsFailed: 0,
      totalDuration: Date.now() - startTime,
      errors,
    };
  }

  if (ideas.length === 0) {
    errors.push("generate: No valid ideas produced by LLM");
    return {
      pipelineRunId,
      ideasGenerated: 0,
      mockupsSucceeded: 0,
      mockupsFailed: 0,
      totalDuration: Date.now() - startTime,
      errors,
    };
  }

  // ── Dry run: skip storage and mockups ─────────────────────────────────

  if (options.dryRun) {
    log("info", "pipeline_dry_run_complete", {
      pipelineRunId,
      ideas: ideas.length,
    });
    return {
      pipelineRunId,
      ideasGenerated: ideas.length,
      mockupsSucceeded: 0,
      mockupsFailed: 0,
      totalDuration: Date.now() - startTime,
      errors,
    };
  }

  // ── Step 2: Store ideas in DB ─────────────────────────────────────────

  const storedIdeaIds: number[] = [];

  for (const idea of ideas) {
    try {
      const name = idea.category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const category = await prisma.category.upsert({
        where: { slug: idea.category },
        update: {},
        create: { name, slug: idea.category },
      });

      const created = await prisma.cROIdea.create({
        data: {
          title: idea.title,
          description: idea.description,
          reason: idea.reason,
          purpose: idea.purpose,
          categoryId: category.id,
          mockupPrompt: idea.mockupPrompt,
          batchId: pipelineRunId,
        },
      });

      storedIdeaIds.push(created.id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`store: ${msg}`);
      log("error", "store_error", {
        pipelineRunId,
        error: msg,
      });
    }
  }

  log("info", "ideas_stored", {
    pipelineRunId,
    stored: storedIdeaIds.length,
  });

  // ── Step 3: Generate mockups for each stored idea ─────────────────────

  let mockupsSucceeded = 0;
  let mockupsFailed = 0;

  for (const ideaId of storedIdeaIds) {
    try {
      // Load the idea from DB to get its mockupPrompt
      const idea = await prisma.cROIdea.findUnique({
        where: { id: ideaId },
      });

      if (!idea) {
        mockupsFailed++;
        errors.push(`mockup: idea ${ideaId} not found in DB`);
        continue;
      }

      if (!idea.mockupPrompt) {
        mockupsFailed++;
        errors.push(`mockup: idea ${ideaId} has no mockupPrompt`);
        log("warn", "mockup_skip_no_prompt", {
          pipelineRunId,
          ideaId,
        });
        continue;
      }

      // Build the full prompt with style guidance
      const fullPrompt = buildMockupPrompt(idea.mockupPrompt);

      // Call MiniMax API
      let imageResult;
      try {
        imageResult = await generateImage({
          prompt: fullPrompt,
          aspectRatio: "9:16",
          negativePrompt: UI_MOCKUP_NEGATIVE_PROMPT,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`mockup: idea ${ideaId} MiniMax: ${msg}`);
        log("error", "mockup_minimax_error", {
          pipelineRunId,
          ideaId,
          error: msg,
        });
        mockupsFailed++;
        continue; // Partial failure: idea is already stored, just skip mockup
      }

      // Download image from MiniMax's temporary URL, or decode base64 data URI
      let imageBuffer: Buffer;
      const isDataUri = imageResult.url.startsWith("data:");
      try {
        if (isDataUri) {
          // Extract base64 content from data URI
          const base64Content = imageResult.url.split(",")[1];
          if (!base64Content) {
            throw new Error("Invalid data URI: no base64 content found");
          }
          imageBuffer = Buffer.from(base64Content, "base64");
        } else {
          imageBuffer = await downloadImage(imageResult.url);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`mockup: idea ${ideaId} download: ${msg}`);
        mockupsFailed++;
        continue;
      }

      // Upload to persistent blob storage
      let blobUrl: string;
      try {
        const filename = `mockups/idea-${ideaId}-${Date.now()}.png`;
        blobUrl = await uploadImageToBlob(imageBuffer, filename);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`mockup: idea ${ideaId} upload: ${msg}`);
        mockupsFailed++;
        continue;
      }

      // Update idea with mockup URL
      await prisma.cROIdea.update({
        where: { id: ideaId },
        data: { mockupUrl: blobUrl },
      });

      mockupsSucceeded++;
      log("info", "mockup_generated", {
        pipelineRunId,
        ideaId,
        mockupUrl: blobUrl,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`mockup: idea ${ideaId}: ${msg}`);
      mockupsFailed++;
    }
  }

  const totalDuration = Date.now() - startTime;

  log("info", "pipeline_complete", {
    pipelineRunId,
    ideasGenerated: storedIdeaIds.length,
    mockupsSucceeded,
    mockupsFailed,
    totalDuration,
  });

  return {
    pipelineRunId,
    ideasGenerated: storedIdeaIds.length,
    mockupsSucceeded,
    mockupsFailed,
    totalDuration,
    errors,
  };
}
