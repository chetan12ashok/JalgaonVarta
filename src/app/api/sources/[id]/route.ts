// src/app/api/sources/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateSource, deleteSource } from "@/lib/db";

interface Props { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await updateSource(params.id, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteSource(params.id);
  return NextResponse.json({ success: true });
}
