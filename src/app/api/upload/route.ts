// src/app/api/upload/route.ts
// Uses axios to upload directly to Firebase Storage REST API
// Avoids firebase/storage undici conflict in Next.js API routes

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PROJECT_ID   = "virralkatta";
const STORAGE_BUCKET = "virralkatta.firebasestorage.app";
const API_KEY = "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes    = await file.arrayBuffer();
    const buffer   = Buffer.from(bytes);
    const ext      = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `thumbnails/manual-${Date.now()}.${ext}`;

    // Firebase Storage REST API — no SDK needed, no undici conflict
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(filename)}&key=${API_KEY}`;

    const uploadRes = await fetch(uploadUrl, {
      method:  "POST",
      headers: { "Content-Type": file.type || "image/jpeg" },
      body:    buffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Storage upload failed: ${err}`);
    }

    const data = await uploadRes.json();
    // Build public download URL
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(filename)}?alt=media&token=${data.downloadTokens}`;

    return NextResponse.json({ url: downloadUrl });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
