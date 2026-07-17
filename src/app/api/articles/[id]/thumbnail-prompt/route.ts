import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getArticleById, updateArticle } from "@/lib/db";

interface Props { params: { id: string } }

const THUMBNAIL_SYSTEM_PROMPT = `You are an advanced AI Prompt Generator for Marathi YouTube News Thumbnails.

Analyze the Marathi news article and optional source thumbnail image. Return ONLY valid JSON:
{
  "mode": "FULL_GENERATION or IDENTITY_PRESERVED",
  "prompt": "ONE final production-ready AI image-generation prompt written fully in English"
}

Choose IDENTITY_PRESERVED when a real public figure, official, celebrity, accused, victim, or recognizable person must remain accurate. Otherwise choose FULL_GENERATION.

The prompt must include:
- ultra-realistic Marathi YouTube breaking-news thumbnail aesthetic
- realistic Indian/Maharashtrian environment
- cinematic DSLR documentary photography style
- emotional local-news storytelling
- high contrast, realistic lighting, 4K ultra sharp quality
- large bold Marathi headline text and smaller Marathi subheadline text
- bold Devanagari typography, white/yellow/red TV-news style text, black outline, glow effect
- 16:9 aspect ratio
- no watermark, no LiveTrends logo, no LiveTrends name

For IDENTITY_PRESERVED, explicitly instruct: use uploaded/source image as primary identity reference, preserve exact face, identity, hairstyle, skin tone, and facial proportions, do not replace the real person.`;

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  return JSON.parse(cleaned);
}

export async function POST(_: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const article = await getArticleById(params.id);
  if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });

  const contentText = stripHtml(article.content || "").slice(0, 3500);
  const userContent: any[] = [{
    type: "text",
    text: [
      `Title: ${article.title}`,
      `Excerpt: ${article.excerpt || ""}`,
      `Content: ${contentText}`,
      `Source thumbnail URL: ${article.originalImageUrl || "none"}`,
    ].join("\n\n"),
  }];

  if (article.originalImageUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: article.originalImageUrl, detail: "low" },
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: THUMBNAIL_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 1000,
      temperature: 0.45,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error: `OpenAI prompt generation failed: ${error}` }, { status: 500 });
  }

  const data = await response.json();
  const parsed = parseJsonObject(data.choices?.[0]?.message?.content || "{}");
  const mode = parsed.mode === "IDENTITY_PRESERVED" ? "IDENTITY_PRESERVED" : "FULL_GENERATION";
  const prompt = typeof parsed.prompt === "string" ? parsed.prompt.trim() : "";

  if (!prompt) return NextResponse.json({ error: "Prompt generation returned empty prompt" }, { status: 500 });

  const updates = {
    thumbnailPrompt: prompt,
    thumbnailMode: mode,
    thumbnailRequiresReference: mode === "IDENTITY_PRESERVED",
  };

  await updateArticle(params.id, updates);
  return NextResponse.json(updates);
}
