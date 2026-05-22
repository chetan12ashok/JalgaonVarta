// scraper/index.js — ViralKatta Full Pipeline
// Fetch → Perplexity Rewrite → ChatGPT Thumbnail Prompt → gpt-image-2 → Firebase Storage → Firestore

const { initializeApp, getApps } = require("firebase/app");
const {
  getFirestore, collection, addDoc, getDocs,
  query, where, limit, updateDoc, doc, Timestamp, increment,
} = require("firebase/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const axios  = require("axios");
const cheerio = require("cheerio");
const xml2js  = require("xml2js");
const cron    = require("node-cron");
require("dotenv").config();

// ── Config ────────────────────────────────────────────────────────────────
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_API_KEY     = process.env.OPENAI_API_KEY;


const firebaseConfig = {
  apiKey:            "AIzaSyACapSCl0G6uALstmD7TfADDCNTSnQ_acE",
  authDomain:        "virralkatta.firebaseapp.com",
  projectId:         "virralkatta",
  storageBucket:     "virralkatta.firebasestorage.app",
  messagingSenderId: "410670993063",
  appId:             "1:410670993063:web:f7dfb909c1c155b1f9d582",
};

const app     = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db      = getFirestore(app);
const storage = getStorage(app);

// ── Thumbnail system prompt ───────────────────────────────────────────────
const THUMBNAIL_SYSTEM_PROMPT = `You are an advanced AI Prompt Generator for Marathi YouTube News Thumbnails.

Your task is to analyze:
1. The Marathi news article
2. The uploaded original thumbnail image (if provided)

Then intelligently decide the correct thumbnail-generation mode and generate ONE final production-ready AI image-generation prompt.

You MUST return ONLY valid JSON.

DO NOT return:
- markdown
- explanations
- notes
- extra text
- code blocks

==================================================
CORE OBJECTIVE
==================================================

Your job is to:
- understand the news story
- detect whether identity preservation is required
- choose the correct thumbnail mode
- generate a highly detailed cinematic AI image-generation prompt

The thumbnail must:
- look authentic
- feel emotionally powerful
- maximize click-through-rate
- preserve trust for Marathi local news audiences

==================================================
THUMBNAIL MODES
==================================================

--------------------------------------------------
MODE 1 — FULL_GENERATION
--------------------------------------------------

Use when:
- identity accuracy is NOT important
- no recognizable public figure is central
- generic characters are acceptable
- scene is symbolic or atmospheric

Examples:
- accidents
- robbery
- flood
- weather
- fire
- traffic
- social issue
- protest crowd
- awareness news
- emotional storytelling

In this mode:
- cinematic generation is allowed
- dramatic storytelling is encouraged
- new compositions may be created freely

--------------------------------------------------
MODE 2 — IDENTITY_PRESERVED
--------------------------------------------------

Use when:
- recognizable public figures are important
- official identities matter
- audience expects facial recognition
- uploaded thumbnail contains important real people

Examples:
- Collector
- SP
- MLA
- MP
- Mayor
- Minister
- celebrity
- political leaders
- known accused
- victim photo available
- local officials

In this mode:
- uploaded image becomes PRIMARY IDENTITY REFERENCE
- exact face must be preserved
- facial structure must remain recognizable
- hairstyle must remain recognizable
- do NOT replace faces with random AI-generated people
- maintain realistic Marathi news-photo authenticity
- enhance composition and realism ONLY

==================================================
MODE SELECTION RULES
==================================================

If there is ANY risk that changing a face may confuse viewers,
ALWAYS select:
IDENTITY_PRESERVED

ONLY use FULL_GENERATION when identity preservation is NOT important.

==================================================
VISUAL STYLE RULES
==================================================

ALL prompts must include:
- ultra-realistic
- Marathi YouTube breaking-news thumbnail aesthetic
- realistic Indian people
- realistic Maharashtrian environment
- DSLR documentary photography style
- cinematic composition
- emotional storytelling
- TV-news visual quality
- realistic lighting
- ultra-detailed textures
- realistic skin texture
- high contrast
- 4K ultra sharp quality
- thumbnail optimized
- authentic local-news realism
- no watermark
- 16:9 aspect ratio

==================================================
MODE-SPECIFIC RULES
==================================================

FOR FULL_GENERATION:
- allow cinematic drama
- allow AI-generated people
- focus on emotional impact
- create dynamic compositions

FOR IDENTITY_PRESERVED:
The prompt MUST explicitly instruct:
- Use uploaded image as PRIMARY identity reference
- Preserve exact face and identity
- Do not replace the real person
- Maintain recognizability
- Preserve hairstyle, skin tone, and facial proportions
- Enhance only:
  - composition
  - realism
  - lighting
  - sharpness
  - thumbnail quality

Avoid:
- fake celebrity look
- over-stylized redesign
- random AI faces
- unrealistic beauty enhancement

==================================================
TEXT OVERLAY RULES
==================================================

Always include inside the generated prompt:
- large bold Marathi headline text
- smaller Marathi subheadline text
- bold Devanagari typography
- white/yellow/red TV-news style text
- black outline
- glow effect
- mobile readable composition

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON in this exact structure:

{
  "mode": "FULL_GENERATION or IDENTITY_PRESERVED",
  "prompt": "FINAL highly detailed AI image-generation prompt"
}

The "prompt" field must contain:
- ONE final production-ready AI image-generation prompt
- written fully in ENGLISH
- optimized for image-generation models
- ready for direct use

Return ONLY JSON.`;

// ── Helpers ───────────────────────────────────────────────────────────────
function buildEnglishSlug(englishSlug) {
  const base = englishSlug
    .toLowerCase()
    .replace(/[^a-z0-9s-]/g, '')
    .trim()
    .replace(/s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-').slice(0, 10).join('-')
    .substring(0, 80);
  return (base || 'article') + '-' + Date.now().toString(36);
}

function makeSlug(text) {
  return text.toLowerCase()
    .replace(/[^ws-]/g, "").replace(/s+/g, "-")
    .replace(/-+/g, "-").trim().substring(0, 80) + "-" + Date.now().toString(36);
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#[0-9]+;/g, '')
    .replace(/&[a-z]+;/g, '');
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── STEP 1: Perplexity — Rewrite article in Marathi (JSON output) ─────────
async function rewriteWithPerplexity(originalTitle, originalContent) {
  console.log(`  ✍️  Rewriting: ${originalTitle.substring(0, 50)}...`);
  const cleanContent = stripHtml(originalContent).substring(0, 2000);

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        response_format: {
          type: 'json_schema',
          json_schema: {
            schema: {
              type: 'object',
              properties: {
                headline:    { type: 'string',  description: 'Attention-grabbing rewritten headline in Marathi' },
                article:     { type: 'string',  description: 'Full rewritten article body in Marathi using inverted pyramid structure. Use \n\n between paragraphs.' },
                excerpt:     { type: 'string',  description: 'One sentence summary of the article in Marathi (max 200 chars)' },
                alt_headlines: { type: 'array', items: { type: 'string' }, description: '3 alternative headlines in Marathi' },
                seo_keywords:  { type: 'array', items: { type: 'string' }, description: '5 SEO keywords in Marathi' },
                tags:          { type: 'array', items: { type: 'string' }, description: '5 tags in Marathi' },
                english_slug:  { type: 'string',  description: 'SEO-friendly URL slug in English only. Use lowercase letters, hyphens between words, no special characters. Max 10 words. Example: important-meeting-entrepreneurs-superintendent-police-jalgaon' },
                short_news:    { type: 'string',  description: 'Ultra-short news summary in Marathi. STRICTLY under 60 words. Must be punchy, complete, and self-contained. No filler words.' },
              },
              required: ['headline', 'article', 'excerpt', 'alt_headlines', 'seo_keywords', 'tags', 'english_slug', 'short_news'],
            },
          },
        },
        messages: [
          {
            role: 'system',
            content: `तुम्ही एक अनुभवी मराठी बातमीदार आणि संपादक आहात. तुम्हाला दिलेल्या बातमीचे पूर्णपणे नव्या शब्दांत मराठीत पुनर्लेखन करायचे आहे.

नियम:
1. मूळ तथ्ये जपा, पण शब्द आणि वाक्यरचना पूर्णपणे बदला
2. प्रसारमाध्यमांसाठी योग्य उलट्या पिरॅमिड रचनेचा वापर करा
3. ओळखण्यायोग्य शीर्षक तयार करा
4. तटस्थ आणि व्यावसायिक टोन ठेवा
5. लहान आणि स्पष्ट वाक्ये वापरा
6. फक्त JSON format मध्ये उत्तर द्या
7. english_slug: बातमीच्या मुख्य मुद्द्यावरून English मध्ये SEO-friendly URL slug तयार करा (फक्त lowercase letters आणि hyphens, जास्तीत जास्त 10 शब्द)
8. short_news: बातमीचा अत्यंत संक्षिप्त आणि आकर्षक सारांश मराठीत लिहा. कठोरपणे 60 शब्दांपेक्षा कमी. स्वतंत्र, पूर्ण आणि थेट असावे.`,
          },
          {
            role: 'user',
            content: `खालील बातमीचे मराठीत पुनर्लेखन करा:

शीर्षक: ${originalTitle}
मजकूर: ${cleanContent}`,
          },
        ],
      },
      {
        headers: {
          accept:         '*/*',
          authorization:  `Bearer ${PERPLEXITY_API_KEY}`,
          'content-type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const raw = response.data.choices[0].message.content;
    
    // Parse JSON — strip markdown fences if present
    const cleaned = raw.replace(/```json|[```]/g, '').trim();
    const parsed  = JSON.parse(cleaned);

    // Convert article paragraphs to HTML
    const htmlContent = parsed.article
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 10)
      .map((p) => `<p>${p.trim()}</p>`)
      .join('\n');

    console.log(`  ✅ Rewrite done: ${parsed.headline.substring(0, 50)}`);

    return {
      title:        parsed.headline,
      excerpt:      parsed.excerpt.substring(0, 300),
      content:      htmlContent || `<p>${parsed.article}</p>`,
      tags:         parsed.tags?.slice(0, 5) || [],
      keywords:     parsed.seo_keywords?.slice(0, 5) || [],
      altHeadlines: parsed.alt_headlines?.slice(0, 3) || [],
      englishSlug:  parsed.english_slug || '',
      shortContent: (parsed.short_news || '').trim().split(/\s+/).slice(0, 60).join(' '),
    };
  } catch (err) {
    console.error('  ⚠️  Rewrite failed:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

// ── STEP 2: ChatGPT (gpt-4o) — Generate thumbnail mode + prompt ──────────
// Returns { mode: "FULL_GENERATION"|"IDENTITY_PRESERVED", prompt: "..." } or null
async function generateThumbnailPrompt(articleTitle, articleContent, originalImageUrl = null) {
  console.log('  🎨 Generating thumbnail prompt with ChatGPT...');
  const plainContent = stripHtml(articleContent).substring(0, 1000);

  // Build message content — include original image if available
  const userContent = [];

  // Always include the article text
  userContent.push({
    type: "text",
    text: `Article Title: ${articleTitle}\n\nArticle Content: ${plainContent}`,
  });

  // If we have the original thumbnail, send it as vision input so GPT-4o
  // can decide whether identity preservation is needed
  if (originalImageUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: originalImageUrl, detail: "low" },
    });
    userContent.push({
      type: "text",
      text: "The image above is the original source thumbnail. Use it to decide the correct mode (FULL_GENERATION or IDENTITY_PRESERVED) and reference it in your prompt if needed.",
    });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model:           "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: THUMBNAIL_SYSTEM_PROMPT },
          { role: "user",   content: userContent },
        ],
        max_tokens:  1000,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization:  `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const raw    = response.data.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);

    const mode   = parsed.mode?.trim();
    const prompt = parsed.prompt?.trim();

    if (!mode || !prompt) throw new Error("Missing mode or prompt in JSON response");

    console.log(`  ✅ Mode: ${mode} | Prompt ready (${prompt.length} chars)`);
    return { mode, prompt };

  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error("  ⚠️  ChatGPT thumbnail failed:", msg);
    return null;
  }
}

// ── STEP 3a: Download image from URL → Buffer ────────────────────────────
async function downloadImageBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
  return Buffer.from(res.data);
}

// ── STEP 3b: gpt-image-2 — FULL_GENERATION (text prompt only) ────────────
async function generateImageFullGeneration(imagePrompt) {
  console.log(`  🖼️  [FULL_GENERATION] Generating with gpt-image-2...`);
  const response = await axios.post(
    "https://api.openai.com/v1/images/generations",
    {
      model:         "gpt-image-2",
      prompt:        imagePrompt,
      n:             1,
      size:          "1536x1024",
      quality:       "high",
      output_format: "jpeg",
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      timeout: 300000,
    }
  );
  return response.data.data[0].b64_json;
}

// ── STEP 3c: gpt-image-2 — IDENTITY_PRESERVED (image edit mode) ──────────
async function generateImageIdentityPreserved(imagePrompt, originalImageUrl) {
  console.log(`  🖼️  [IDENTITY_PRESERVED] Editing with original thumbnail reference...`);

  // Download the original image
  const imgBuffer = await downloadImageBuffer(originalImageUrl);

  // OpenAI edits endpoint requires multipart/form-data
  const FormData = require("form-data");
  const form = new FormData();
  form.append("model",  "gpt-image-2");
  form.append("prompt", imagePrompt);
  form.append("n",      "1");
  form.append("size",   "1536x1024");
  // Attach original image as reference (must be PNG for edits endpoint)
  // We send as JPEG — API accepts it
  form.append("image", imgBuffer, {
    filename:    "original_thumbnail.jpg",
    contentType: "image/jpeg",
  });

  const response = await axios.post(
    "https://api.openai.com/v1/images/edits",
    form,
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      timeout: 300000,
    }
  );

  // edits endpoint returns b64_json same as generations
  return response.data.data[0].b64_json;
}

// ── STEP 3: Main image generation dispatcher ──────────────────────────────
async function generateThumbnailImage(mode, imagePrompt, originalImageUrl = null) {
  try {
    let b64;

    if (mode === "IDENTITY_PRESERVED" && originalImageUrl) {
      b64 = await generateImageIdentityPreserved(imagePrompt, originalImageUrl);
    } else {
      // FULL_GENERATION or fallback if no original image available
      if (mode === "IDENTITY_PRESERVED" && !originalImageUrl) {
        console.log("  ⚠️  IDENTITY_PRESERVED but no original image — falling back to FULL_GENERATION");
      }
      b64 = await generateImageFullGeneration(imagePrompt);
    }

    console.log(`  ✅ gpt-image-2 image generated (mode: ${mode})`);
    return { b64 };

  } catch (err) {
    console.error("  ⚠️  gpt-image-2 failed:", err.response?.data?.error?.message || err.message);
    return null;
  }
}

// ── STEP 4: Upload image to Firebase Storage ─────────────────────────────
async function uploadToFirebaseStorage(imageData, slug) {
  console.log(`  ☁️  Uploading to Firebase Storage...`);
  try {
    // imageData.b64 is base64 string from gpt-image-2
    const imageBuffer = Buffer.from(imageData.b64, "base64");
    const filename    = `thumbnails/${slug}-${Date.now()}.jpg`;
    const storageRef  = ref(storage, filename);
    await uploadBytes(storageRef, imageBuffer, { contentType: "image/jpeg" });
    const publicUrl = await getDownloadURL(storageRef);
    console.log(`  ✅ Uploaded to Firebase Storage`);
    return publicUrl;
  } catch (err) {
    console.error("  ⚠️  Storage upload failed:", err.message);
    return null;
  }
}

// ── Category detection ────────────────────────────────────────────────────
async function detectCategory(title) {
  const keywords = {
    "jalgaon-shahar": ["जळगाव", "महापालिका", "नगरपालिका", "शहर"],
    "rajkaran":       ["राजकारण", "निवडणूक", "भाजप", "काँग्रेस", "मंत्री", "आमदार"],
    "krida":          ["क्रिकेट", "खेळ", "फुटबॉल", "संघ", "स्पर्धा"],
    "vyapar":         ["व्यापार", "बाजार", "उद्योग", "कंपनी", "शेअर"],
    "shikshan":       ["शाळा", "महाविद्यालय", "परीक्षा", "विद्यार्थी", "शिक्षण"],
    "manoranjan":     ["चित्रपट", "मनोरंजन", "कलाकार", "गाणे"],
    "gunhegari":      ["गुन्हा", "चोरी", "अटक", "पोलीस", "खून"],
    "krushi":         ["शेती", "शेतकरी", "पीक", "पाऊस", "कृषी"],
  };
  for (const [slug, words] of Object.entries(keywords)) {
    if (words.some((w) => title.includes(w))) {
      const snap = await getDocs(query(collection(db, "categories"), where("slug", "==", slug), limit(1)));
      if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
  }
  const snap = await getDocs(query(collection(db, "categories"), where("slug", "==", "jalgaon-shahar"), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function isDuplicate(originalTitle) {
  const snap = await getDocs(query(collection(db, "articles"), where("originalTitle", "==", originalTitle), limit(1)));
  return !snap.empty;
}

// ── Fetchers ──────────────────────────────────────────────────────────────

// Fetches the original thumbnail URL from WordPress media endpoint
async function fetchFeaturedImageUrl(mediaHref) {
  try {
    const res = await axios.get(mediaHref, { timeout: 10000 });
    return res.data?.guid?.rendered || null;
  } catch (err) {
    console.warn(`  ⚠️  Could not fetch featured image: ${err.message}`);
    return null;
  }
}

async function fetchWordPress(source) {
  const res = await axios.get(`${source.url}?per_page=1`, { timeout: 15000 });

  // Fetch featured image URLs in parallel for all posts
  const articles = await Promise.all(
    res.data.map(async (p) => {
      // Get media href from _links if available
      const mediaHref = p._links?.["wp:featuredmedia"]?.[0]?.href || null;
      const originalImageUrl = mediaHref ? await fetchFeaturedImageUrl(mediaHref) : null;

      return {
        originalTitle:    decodeEntities(p.title?.rendered || ""),
        originalContent:  p.content?.rendered || p.excerpt?.rendered || "",
        sourceUrl:        p.link || "",
        originalImageUrl: originalImageUrl,   // ← original thumbnail from source
      };
    })
  );

  return articles;
}

async function fetchRSS(source) {
  const res    = await axios.get(source.url, { timeout: 15000 });
  const parsed = await xml2js.parseStringPromise(res.data);
  const items  = parsed.rss?.channel?.[0]?.item || [];
  return items.slice(0, 1).map((item) =>({
    originalTitle:   item.title?.[0]       || "",
    originalContent: item.description?.[0] || item["content:encoded"]?.[0] || "",
    sourceUrl:       item.link?.[0]        || "",
  }));
}

async function fetchScraper(source) {
  const res = await axios.get(source.url, { timeout: 15000, headers: { "User-Agent": "Mozilla/5.0" } });
  const $   = cheerio.load(res.data);
  const out = [];
  $("article, .post, .news-item").slice(0, 5).each((_, el) => {
    const title   = $(el).find("h2, h3, .title").first().text().trim();
    const excerpt = $(el).find("p, .excerpt").first().text().trim();
    const link    = $(el).find("a").first().attr("href") || "";
    if (title) out.push({ originalTitle: title, originalContent: excerpt, sourceUrl: link });
  });
  return out;
}

// ── Main pipeline ─────────────────────────────────────────────────────────
async function processArticle(raw, source) {
  // Step 1: Rewrite
  const rewritten = await rewriteWithPerplexity(raw.originalTitle, raw.originalContent);
  if (!rewritten) return false;

  // Step 2: Generate thumbnail mode + prompt (pass original image for GPT-4o vision)
  const thumbnailResult = await generateThumbnailPrompt(
    rewritten.title,
    rewritten.content,
    raw.originalImageUrl || null,
  );

  // Step 3: Generate image with gpt-image-2 (mode-aware)
  let imageUrl = null;
  if (thumbnailResult && OPENAI_API_KEY !== "YOUR_OPENAI_API_KEY_HERE") {
    const { mode, prompt: thumbnailPrompt } = thumbnailResult;
    console.log(`  🎯 Thumbnail mode: ${mode}`);

    const imageData = await generateThumbnailImage(
      mode,
      thumbnailPrompt,
      raw.originalImageUrl || null,   // passed to edits API if IDENTITY_PRESERVED
    );

    if (imageData) {
      // Step 4: Upload to Firebase Storage
      const thumbSlug = rewritten.englishSlug ? buildEnglishSlug(rewritten.englishSlug) : makeSlug(rewritten.title);
      imageUrl = await uploadToFirebaseStorage(imageData, thumbSlug);
    }
  } else if (OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    console.log("  ⚠️  OpenAI key not set — skipping image generation");
  }

  // Fallback: use original thumbnail from source site if AI image failed/skipped
  if (!imageUrl && raw.originalImageUrl) {
    imageUrl = raw.originalImageUrl;
    console.log(`  🖼️  Using original source thumbnail: ${imageUrl}`);
  }

  // Extract thumbnailPrompt string for Firestore (may be null if thumbnailResult is null)
  const thumbnailPrompt = thumbnailResult?.prompt || null;
  const thumbnailMode   = thumbnailResult?.mode   || null;

  // Step 5: Detect category
  const cat = await detectCategory(rewritten.title);
  if (!cat) { console.log("  ⚠️  No category found"); return false; }

  // Step 6: Save to Firestore
  const now  = Timestamp.now();
  const slug = rewritten.englishSlug ? buildEnglishSlug(rewritten.englishSlug) : makeSlug(rewritten.title);
  await addDoc(collection(db, "articles"), {
    title:           rewritten.title,
    slug,
    excerpt:         rewritten.excerpt,
    content:         rewritten.content,
    imageUrl:         imageUrl || null,
    thumbnailPrompt:  thumbnailPrompt || null,
    thumbnailMode:    thumbnailMode    || null,        // FULL_GENERATION or IDENTITY_PRESERVED
    originalImageUrl: raw.originalImageUrl || null,   // original thumbnail from source site
    status:           "PENDING",
    originalTitle:    raw.originalTitle,
    sourceUrl:        raw.sourceUrl || null,
    views:           0,
    publishedAt:     null,
    createdAt:       now,
    updatedAt:       now,
    categoryId:      cat.id,
    categoryName:    cat.name,
    categorySlug:    cat.slug,
    categoryColor:   cat.color,
    sourceId:        source.id,
    sourceName:      source.name,
    tags:            rewritten.tags || [],
    shortContent:    rewritten.shortContent || null,
  });

  // Update source stats
  await updateDoc(doc(db, "sources", source.id), {
    lastFetched:  now,
    articleCount: increment(1),
  });

  console.log(`  ✅ Saved: ${rewritten.title.substring(0, 50)}`);
  console.log(`  🖼️  Image: ${imageUrl ? "✅ Saved to Storage" : "❌ None"}`);
  return true;
}

// ── Main run ──────────────────────────────────────────────────────────────
async function runScraper() {
  console.log(`\n🚀 ViralKatta Scraper — ${new Date().toLocaleString("mr-IN")}`);
  console.log("─".repeat(60));

  const sourcesSnap = await getDocs(query(collection(db, "sources"), where("active", "==", true)));
  const sources     = sourcesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`📋 Active sources: ${sources.length}`);

  let totalNew = 0;

  for (const source of sources) {
    console.log(`\n🌐 ${source.name} (${source.type})`);

    let rawArticles = [];
    try {
      if (source.type === "WORDPRESS")    rawArticles = await fetchWordPress(source);
      else if (source.type === "RSS")     rawArticles = await fetchRSS(source);
      else                                rawArticles = await fetchScraper(source);
      console.log(`  📄 Fetched: ${rawArticles.length} articles`);
    } catch (err) {
      console.error(`  ❌ Fetch failed: ${err.message}`);
      continue;
    }

    for (const raw of rawArticles) {
      if (!raw.originalTitle || raw.originalTitle.length < 10) continue;

      if (await isDuplicate(raw.originalTitle)) {
        console.log(`  ⏭️  Duplicate: ${raw.originalTitle.substring(0, 40)}`);
        continue;
      }

      const saved = await processArticle(raw, source);
      if (saved) totalNew++;

      // Rate limit — 3s between articles (DALL-E is slow)
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\n✨ Done! ${totalNew} new articles added to queue`);
  console.log("─".repeat(60));
}

// ── Start ─────────────────────────────────────────────────────────────────
console.log("🔶 ViralKatta Scraper — Full AI Pipeline");
console.log("   Perplexity Rewrite → Thumbnail Prompt → DALL-E 3 → Storage → Firestore");
console.log("📅 Runs every 10 minutes\n");

runScraper().catch(console.error);
cron.schedule("*/10 * * * *", () => runScraper().catch(console.error));