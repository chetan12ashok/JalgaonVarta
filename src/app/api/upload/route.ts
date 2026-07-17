// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";

const STORAGE_BUCKET = "virralkatta.firebasestorage.app";
const API_KEY = "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE";
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;
const JPEG_QUALITY = 72;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);
    const optimizedBuffer = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: JPEG_QUALITY,
        mozjpeg: true,
        progressive: true,
      })
      .toBuffer();

    const filename = `thumbnails/manual-${Date.now()}.jpg`;

    // Firebase Storage REST API — no SDK needed, no undici conflict
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(filename)}&key=${API_KEY}`;

    const uploadRes = await fetch(uploadUrl, {
      method:  "POST",
      headers: { "Content-Type": "image/jpeg" },
      body:    optimizedBuffer as unknown as BodyInit,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Storage upload failed: ${err}`);
    }

    const data = await uploadRes.json();
    // Build public download URL
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(filename)}?alt=media&token=${data.downloadTokens}`;

    return NextResponse.json({
      url: downloadUrl,
      originalSize: inputBuffer.length,
      optimizedSize: optimizedBuffer.length,
      savedBytes: Math.max(0, inputBuffer.length - optimizedBuffer.length),
    });
  } catch (err: any) {
    console.error("Upload error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
