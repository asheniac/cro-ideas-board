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
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const idea = await prisma.cROIdea.update({
    where: { id: parseInt(id) },
    data: {
      status: body.status,
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
