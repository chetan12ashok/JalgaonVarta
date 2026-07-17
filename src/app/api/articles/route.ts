// src/app/api/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getArticles, createArticle } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status     = searchParams.get("status")   || undefined;
  const search     = searchParams.get("search")   || undefined;
  const categoryId = searchParams.get("category") || undefined;
  const page       = parseInt(searchParams.get("page")  || "1");
  const pageSize   = parseInt(searchParams.get("limit") || "15");

  const result = await getArticles({ status, search, categoryId, page, pageSize });
  return NextResponse.json({ ...result, pages: Math.ceil(result.total / pageSize) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, content, excerpt, imageUrl, categoryId, sourceId, sourceUrl, originalTitle, status } = body;

  if (!title || !content || !excerpt || !categoryId)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  if (status === "PUBLISHED" && !imageUrl)
    return NextResponse.json({ error: "Thumbnail image is required before publishing" }, { status: 400 });

  const article = await createArticle({
    title, content, excerpt, imageUrl, categoryId, sourceId, sourceUrl, originalTitle, status,
  });

  return NextResponse.json(article, { status: 201 });
}
