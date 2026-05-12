/**
 * POST /api/research/mockup
 *
 * Generates a mockup image for a CRO idea using the MiniMax image generation API.
 * Downloads the generated image and persists it to Vercel Blob storage.
 *
 * Auth: Requires `RESEARCH_SECRET` env var matching `body.secret`.
 *
 * Body: { ideaId: number, secret: string }
 * Response: { ideaId: number, mockupUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImageToBlob } from "@/lib/storage/blob";
import { downloadImage } from "@/lib/storage/download";
import { generateImage, buildMockupPrompt, MiniMaxAPIError } from "@/lib/research/minimax-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, secret } = body as { ideaId?: number; secret?: string };

    // ── Auth check ──
    const researchSecret = process.env.RESEARCH_SECRET;
    if (!researchSecret || !secret) {
      return NextResponse.json(
        { error: "Unauthorized — secret is required" },
        { status: 401 }
      );
    }
    if (secret !== researchSecret) {
      return NextResponse.json(
        { error: "Unauthorized — invalid secret" },
        { status: 401 }
      );
    }

    if (typeof ideaId !== "number" || !Number.isFinite(ideaId)) {
      return NextResponse.json(
        { error: "ideaId must be a valid number" },
        { status: 400 }
      );
    }

    // ── Load the idea from DB ──
    const idea = await prisma.cROIdea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return NextResponse.json(
        { error: `Idea with id ${ideaId} not found` },
        { status: 404 }
      );
    }

    if (!idea.mockupPrompt) {
      return NextResponse.json(
        { error: `Idea ${ideaId} has no mockupPrompt — nothing to generate` },
        { status: 400 }
      );
    }

    // ── Build the full prompt with style guidance ──
    const fullPrompt = buildMockupPrompt(idea.mockupPrompt);

    // ── Call MiniMax API via the shared client ──
    let imageUrl: string;

    try {
      const result = await generateImage({
        prompt: fullPrompt,
        aspectRatio: "9:16",
      });
      imageUrl = result.url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      const statusCode =
        error instanceof MiniMaxAPIError ? (error.statusCode || 502) : 502;
      return NextResponse.json(
        { error: "MiniMax API call failed", details: message },
        { status: statusCode as 401 | 429 | 500 | 502 }
      );
    }

    // ── Download the image from MiniMax's URL ──
    let imageBuffer: Buffer;

    try {
      imageBuffer = await downloadImage(imageUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Failed to download generated image from MiniMax", details: message },
        { status: 502 }
      );
    }

    // ── Upload to Vercel Blob ──
    let blobUrl: string;

    try {
      const filename = `mockups/idea-${ideaId}-${Date.now()}.png`;
      blobUrl = await uploadImageToBlob(imageBuffer, filename);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Failed to upload image to blob storage", details: message },
        { status: 500 }
      );
    }

    // ── Update the idea in the database ──
    await prisma.cROIdea.update({
      where: { id: ideaId },
      data: { mockupUrl: blobUrl },
    });

    return NextResponse.json({
      ideaId,
      mockupUrl: blobUrl,
    });
  } catch (error) {
    console.error("[API] /api/research/mockup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
