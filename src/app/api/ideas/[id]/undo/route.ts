import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/ideas/[id]/undo — revert to previous status
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Read the idea to check if it has a previousStatus to revert to
  const idea = await prisma.cROIdea.findUnique({
    where: { id: parseInt(id) },
    select: { previousStatus: true, status: true },
  });

  if (!idea) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!idea.previousStatus) {
    return NextResponse.json(
      { error: "No previous status to undo" },
      { status: 400 }
    );
  }

  // Revert: set status to previousStatus, clear previousStatus
  const updated = await prisma.cROIdea.update({
    where: { id: parseInt(id) },
    data: {
      status: idea.previousStatus,
      previousStatus: null,
    },
    include: { category: true },
  });

  return NextResponse.json(updated);
}
