/**
 * POST /api/research/generate
 *
 * Generates CRO ideas using the LLM-powered generator module
 * and stores them in the database via Prisma.
 *
 * Auth: Requires `RESEARCH_SECRET` env var matching request body's `secret` field.
 *
 * Body: { secret: string, count?: number }
 * Response: { ideas: GeneratedCROIdea[], batchId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCROIdeas, GeneratedCROIdea } from "@/lib/research/generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Auth check ──
    const researchSecret = process.env.RESEARCH_SECRET;
    if (researchSecret && body.secret !== researchSecret) {
      return NextResponse.json(
        { error: "Unauthorized — invalid or missing secret" },
        { status: 401 }
      );
    }

    // ── Parse parameters ──
    const count = typeof body.count === "number" ? Math.max(3, Math.min(5, body.count)) : 4;

    // ── Generate ideas ──
    const ideas = await generateCROIdeas({ count });

    if (ideas.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any valid ideas" },
        { status: 500 }
      );
    }

    // ── Store in database ──
    const batchId = `batch-${Date.now()}`;
    const storedIdeas: GeneratedCROIdea[] = [];

    for (const idea of ideas) {
      try {
        // Find or create the category
        let category = await prisma.category.findUnique({
          where: { slug: idea.category },
        });

        if (!category) {
          // Build a proper name from the slug
          const name = idea.category
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          category = await prisma.category.create({
            data: { name, slug: idea.category },
          });
        }

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

        storedIdeas.push(idea);
      } catch (dbError) {
        console.error("[API] Failed to store idea in DB:", dbError);
      }
    }

    return NextResponse.json(
      {
        ideas: storedIdeas,
        batchId,
        generated: storedIdeas.length,
        requested: count,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] /api/research/generate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
