// src/app/api/whatsapp-format/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const OPENAI_API_KEY = "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";
const SITE_URL       = "https://viralkatta.com";

const firebaseConfig = {
  apiKey: "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE",
  authDomain: "virralkatta.firebaseapp.com",
  projectId: "virralkatta",
  storageBucket: "virralkatta.firebasestorage.app",
  messagingSenderId: "410670993063",
  appId: "1:410670993063:web:f7dfb909c1c155b1f9d582",
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);

const SYSTEM_PROMPT = `You are ViralKatta's WhatsApp Content Editor for Marathi news.

Given a Marathi news article, generate a viral WhatsApp news message.

FORMAT:
Line 1: Main headline in *bold* — use the most fitting emojis based on the news content
Line 2: Key detail/subheadline in *bold* — use fitting emojis based on the news content
Line 3: Curiosity hook to make reader click — e.g. "सविस्तर वाचा 👇👇" or creative variation

EMOJI RULES:
- You have complete freedom to use ANY emojis that best match the news story
- Choose emojis that emotionally match the tone — shocking, happy, political etc
- Use 1-3 emojis per line placed naturally where they add impact
- Pick ones that truly represent this specific story

WRITING RULES:
- Write in Marathi language only
- Make line 1 extremely clickable — create curiosity, urgency or surprise
- Use *asterisks* for bold text (WhatsApp format)
- Keep each line punchy and impactful
- Return ONLY JSON: {"line1": "...", "line2": "...", "line3": "..."}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, excerpt, content, slug, articleId, save } = await req.json();
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

    // Fetch group link from settings
    const settingsSnap = await getDoc(doc(db, "settings", "whatsapp"));
    const groupLink = settingsSnap.exists() ? (settingsSnap.data().groupLink || "") : "";

    const articleUrl   = `${SITE_URL}/article/${slug}`;
    const plainContent = (content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().substring(0, 1200);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method:  "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model:           "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: `Title: ${title}\n\nExcerpt: ${excerpt || ""}\n\nContent: ${plainContent}` },
        ],
        max_tokens:  400,
        temperature: 0.85,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI: ${await response.text()}`);

    const data   = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    // Build group join appeal — only if group link is set
    const joinBlock = groupLink
      ? `\n\n💬 *ताज्या बातम्या सर्वात आधी मिळवा!*\n🟢 *आमच्या WhatsApp ग्रुपमध्ये सामील व्हा* 👇\n${groupLink}`
      : "";

    const message = `${parsed.line1}
${parsed.line2}
${parsed.line3}

${articleUrl}${joinBlock}`;

    // Save to Firestore article if requested
    if (save && articleId) {
      try {
        await updateDoc(doc(db, "articles", articleId), {
          whatsappMessage: message,
        });
      } catch (e) {
        console.error("Failed to save whatsappMessage:", e);
      }
    }

    return NextResponse.json({ message, articleUrl });
  } catch (err: any) {
    console.error("WhatsApp format error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Save existing message to article
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { articleId, message } = await req.json();
    await updateDoc(doc(db, "articles", articleId), { whatsappMessage: message });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
