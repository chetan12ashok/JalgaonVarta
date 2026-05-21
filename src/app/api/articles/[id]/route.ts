// src/app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db";

interface Props { params: { id: string } }

export async function GET(_: NextRequest, { params }: Props) {
  const article = await getArticleById(params.id);
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await updateArticle(params.id, body);
  const updated = await getArticleById(params.id);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteArticle(params.id);
  return NextResponse.json({ success: true });
}
