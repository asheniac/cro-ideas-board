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

const MINIMAX_API_URL = "https://api.minimax.chat/v1/image_generation";
const MINIMAX_MODEL = "image-01";

interface MiniMaxResponse {
  data?: {
    image_urls?: string[];
  };
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

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

    // ── Call MiniMax API to generate the image ──
    const minimaxApiKey = process.env.MINIMAX_API_KEY;
    if (!minimaxApiKey) {
      return NextResponse.json(
        { error: "MINIMAX_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    let imageUrl: string;

    try {
      const minimaxResponse = await fetch(MINIMAX_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${minimaxApiKey}`,
        },
        body: JSON.stringify({
          model: MINIMAX_MODEL,
          prompt: idea.mockupPrompt,
          aspect_ratio: "9:16",
          n: 1,
        }),
      });

      if (!minimaxResponse.ok) {
        const errorText = await minimaxResponse.text();
        return NextResponse.json(
          {
            error: `MiniMax API returned HTTP ${minimaxResponse.status}`,
            details: errorText,
          },
          { status: 502 }
        );
      }

      const data: MiniMaxResponse = await minimaxResponse.json();

      if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
        return NextResponse.json(
          {
            error: "MiniMax API error",
            details: data.base_resp.status_msg || "Unknown MiniMax error",
          },
          { status: 502 }
        );
      }

      const urls = data.data?.image_urls;
      if (!urls || urls.length === 0) {
        return NextResponse.json(
          { error: "MiniMax API returned no image URLs" },
          { status: 502 }
        );
      }

      imageUrl = urls[0];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "MiniMax API call failed", details: message },
        { status: 502 }
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
