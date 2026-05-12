import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ideas?status=pending|liked|disliked&batch=BATCH_ID&allPending=true
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const batch = searchParams.get("batch");
  const allPending = searchParams.get("allPending") === "true";

  const where: Record<string, unknown> = {
    status: status as "pending" | "liked" | "disliked",
  };

  if (batch) {
    where.batchId = batch;
  }

  if (allPending) {
    where.mockupPrompt = { not: null };
    where.mockupUrl = null;
  }

  const ideas = await prisma.cROIdea.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ideas);
}

// POST /api/ideas — create a new CRO idea
export async function POST(request: NextRequest) {
  const body = await request.json();

  const idea = await prisma.cROIdea.create({
    data: {
      title: body.title,
      description: body.description,
      reason: body.reason,
      purpose: body.purpose,
      categoryId: body.categoryId,
      mockupUrl: body.mockupUrl || null,
      mockupPrompt: body.mockupPrompt || null,
      sourceUrl: body.sourceUrl || null,
      batchId: body.batchId || null,
    },
    include: { category: true },
  });

  return NextResponse.json(idea, { status: 201 });
}
