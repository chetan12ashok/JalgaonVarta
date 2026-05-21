"use client";
import { useState, useEffect } from "react";

const MR = { fontFamily: "'Noto Sans Devanagari','Mukta',sans-serif" };

export default function SettingsPage() {
  const [groupLink, setGroupLink] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);
  const [preview,   setPreview]   = useState(false);

  useEffect(() => {
    fetch("/api/whatsapp-settings")
      .then(r => r.json())
      .then(d => setGroupLink(d.groupLink || ""));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  async function save() {
    setSaving(true);
    const res = await fetch("/api/whatsapp-settings", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ groupLink }),
    });
    setSaving(false);
    if (res.ok) showToast("✅ Link सेव्ह झाला!");
    else showToast("❌ Error saving");
  }

  const previewMsg = `⭕ *उदाहरण बातमी शीर्षक येथे* ⭕
🔘 *मुख्य माहिती येथे दिसेल* 🔘
सविस्तर वाचा 👇👇

https://viralkatta.com/article/example-slug${groupLink ? `\n\n💬 *ताज्या बातम्या सर्वात आधी मिळवा!*\n🟢 *आमच्या WhatsApp ग्रुपमध्ये सामील व्हा* 👇\n${groupLink}` : ""}`;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">ViralKatta CMS Configuration</p>
      </div>

      <div className="space-y-5">

        {/* WhatsApp Group Link */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-gray-100"
            style={{ background:"linear-gradient(135deg,#25D366 0%,#128C7E 100%)" }}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-white text-base">WhatsApp Group Link</h2>
              <p className="text-white/70 text-xs" style={MR}>Share message मध्ये जोडला जाईल</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" style={MR}>
                💬 Group Invite Link
              </label>
              <input
                type="url"
                value={groupLink}
                onChange={e => setGroupLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1" style={MR}>WhatsApp Group → Invite Link copy करा</p>
            </div>

            {/* Preview */}
            <button onClick={() => setPreview(p => !p)}
              className="text-sm text-green-600 hover:text-green-700 font-medium" style={MR}>
              {preview ? "👆 Preview बंद करा" : "👁 Message Preview पहा"}
            </button>

            {preview && (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gray-100 px-3 py-2 text-xs text-gray-500 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  WhatsApp Preview
                </div>
                <div style={{
                  background:"#e7ffd8", padding:"14px 16px",
                  ...MR, fontSize:13, lineHeight:1.75,
                  whiteSpace:"pre-wrap", wordBreak:"break-word", color:"#1a1a1a",
                }}>
                  {previewMsg}
                </div>
              </div>
            )}

            <button onClick={save} disabled={saving}
              className="w-full py-3 font-bold text-white rounded-xl transition-colors disabled:opacity-50"
              style={{ background: saving ? "#9ca3af" : "#25D366", ...MR }}>
              {saving ? "सेव्ह होत आहे..." : "💾 Link सेव्ह करा"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3">🤖 Scraper Info</h2>
          <div className="text-sm text-gray-500 space-y-1.5" style={MR}>
            <p>📅 Runs every <strong className="text-gray-700">30 minutes</strong></p>
            <p>✍️ Rewrite: <strong className="text-gray-700">Perplexity sonar</strong></p>
            <p>⚡ Shorts: <strong className="text-gray-700">Perplexity sonar (60 words)</strong></p>
            <p>🎨 Thumbnail Prompt: <strong className="text-gray-700">ChatGPT gpt-4o</strong></p>
            <p>🖼️ Image: <strong className="text-gray-700">gpt-image-2</strong></p>
            <p>💬 WhatsApp Format: <strong className="text-gray-700">gpt-4o-mini</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
