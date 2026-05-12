/**
 * GET & POST /api/pipeline/run
 *
 * Unified pipeline endpoint that chains:
 *   generate ideas → store in DB → auto-trigger mockup generation → report results.
 *
 * Auth:
 *   - GET (Vercel cron): Checks Authorization: Bearer <RESEARCH_SECRET> header
 *   - POST (manual):      Checks body.secret against RESEARCH_SECRET
 *   Returns 401 if auth fails.
 *
 * GET — Used by Vercel cron jobs (vercel.json). No request body.
 * POST — Manual invocation. Body: { secret: string, count?: number }
 *
 * Response: PipelineResult (summary JSON)
 * Status: 200 on full success, 207 if some mockups failed but ideas were generated,
 *         401/500 on errors.
 */

import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";

// ─── Auth helpers ───────────────────────────────────────────────────────────

function checkAuth(request: NextRequest, body: Record<string, unknown>): boolean {
  const researchSecret = process.env.RESEARCH_SECRET;
  if (!researchSecret) return false;

  // POST: check body.secret
  if (request.method === "POST") {
    const secret = body.secret;
    if (!secret || secret !== researchSecret) return false;
    return true;
  }

  // GET: check Authorization header (used by Vercel cron)
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  return token === researchSecret;
}

// ─── GET handler (Vercel cron) ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request, {})) {
      return NextResponse.json(
        { error: "Unauthorized — valid secret is required" },
        { status: 401 },
      );
    }

    const result = await runPipeline();
    const statusCode = result.errors.length > 0 ? 207 : 200;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("[API] GET /api/pipeline/run error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── POST handler (manual invocation) ───────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!checkAuth(request, body)) {
      return NextResponse.json(
        { error: "Unauthorized — valid secret is required" },
        { status: 401 },
      );
    }

    const count =
      typeof body.count === "number"
        ? Math.max(3, Math.min(5, body.count))
        : undefined;

    const result = await runPipeline({ count });
    const statusCode = result.errors.length > 0 ? 207 : 200;
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error("[API] POST /api/pipeline/run error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
