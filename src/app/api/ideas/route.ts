import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ideas?status=pending|liked|disliked
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const ideas = await prisma.cROIdea.findMany({
    where: { status: status as "pending" | "liked" | "disliked" },
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
