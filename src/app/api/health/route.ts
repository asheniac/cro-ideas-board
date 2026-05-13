/**
 * Health Check Endpoint
 *
 * GET /api/health — Returns system health status including DB connectivity,
 * last batch timestamp, pending mockup count, and server uptime.
 *
 * Returns HTTP 503 if the database is unreachable.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SERVER_START_TIME } from "@/lib/utils/logger";

// ─── Startup Validation ─────────────────────────────────────────────────────

const startupWarnings: string[] = [];

function validateEnv(): void {
  // Critical: DATABASE_URL is required for the app to function
  if (!process.env.DATABASE_URL) {
    startupWarnings.push("DATABASE_URL is not set — database connectivity will fail");
  }

  // Critical: RESEARCH_SECRET protects the pipeline endpoint
  if (!process.env.RESEARCH_SECRET) {
    startupWarnings.push("RESEARCH_SECRET is not set — pipeline endpoints are unprotected");
  }

  // Optional but recommended
  if (!process.env.MINIMAX_API_KEY) {
    startupWarnings.push("MINIMAX_API_KEY is not set — mockup generation will fail");
  }
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    startupWarnings.push(
      "Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is set — LLM generation will use mock client",
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    startupWarnings.push("BLOB_READ_WRITE_TOKEN is not set — image uploads will fail");
  }
}

// Run validation once at module load
validateEnv();

// ─── GET Handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  let dbOk = false;
  let lastBatchAt: string | null = null;
  let pendingMockupCount = 0;

  // Test DB connection
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    dbOk = true;
  } catch {
    dbOk = false;
  }

  // Gather optional stats if DB is up
  if (dbOk) {
    try {
      const lastBatch = await prisma.cROIdea.findFirst({
        where: { batchId: { not: null } },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      lastBatchAt = lastBatch?.createdAt.toISOString() ?? null;

      pendingMockupCount = await prisma.cROIdea.count({
        where: {
          mockupPrompt: { not: null },
          mockupUrl: null,
        },
      });
    } catch {
      // Stats are best-effort — don't fail the health check over stats
      lastBatchAt = null;
      pendingMockupCount = 0;
    }
  }

  const uptime = Date.now() - SERVER_START_TIME;

  const body = {
    status: dbOk ? "healthy" : "unhealthy",
    db: dbOk ? "connected" : "disconnected",
    lastBatchAt,
    pendingMockupCount,
    uptimeMs: uptime,
    uptime: formatUptime(uptime),
    startupWarnings: startupWarnings.length > 0 ? startupWarnings : undefined,
  };

  return NextResponse.json(body, {
    status: dbOk ? 200 : 503,
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
