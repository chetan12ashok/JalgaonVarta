// src/app/api/sources/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSources, createSource } from "@/lib/db";

export async function GET() {
  const sources = await getSources();
  return NextResponse.json(sources);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, type, url } = body;
  if (!name || !type || !url)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const source = await createSource({ name, type, url });
  return NextResponse.json(source, { status: 201 });
}
