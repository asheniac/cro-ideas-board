import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ideas/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = await prisma.cROIdea.findUnique({
    where: { id: parseInt(id) },
    include: { category: true },
  });

  if (!idea) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(idea);
}

// PATCH /api/ideas/[id] — update status (like/dislike)
// Stores current status in previousStatus before updating, enabling undo.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Read current idea to capture its existing status as previousStatus
  const current = await prisma.cROIdea.findUnique({
    where: { id: parseInt(id) },
    select: { status: true },
  });

  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const idea = await prisma.cROIdea.update({
    where: { id: parseInt(id) },
    data: {
      status: body.status,
      previousStatus: current.status,
    },
    include: { category: true },
  });

  return NextResponse.json(idea);
}

// DELETE /api/ideas/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.cROIdea.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
