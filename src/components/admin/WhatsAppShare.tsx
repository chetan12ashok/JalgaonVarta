"use client";
import { useState } from "react";

interface Props {
  articleId: string;
  title:     string;
  excerpt:   string;
  content:   string;
  slug:      string;
}

export default function WhatsAppShare({ articleId, title, excerpt, content, slug }: Props) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [message, setMessage] = useState("");
  const [error,   setError]   = useState("");

  const MR = { fontFamily: "'Noto Sans Devanagari','Mukta',sans-serif" };

  async function generate(saveAfter = false) {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const res  = await fetch("/api/whatsapp-format", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, excerpt, content, slug, articleId, save: saveAfter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(data.message);
      if (saveAfter) setSaved(true);
      setOpen(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function saveMessage() {
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp-format", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ articleId, message }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareOnWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => generate(false)}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px",
          background: loading ? "#9ca3af" : "#25D366",
          color: "#fff", border: "none", borderRadius: 12,
          fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
          ...MR, boxShadow: "0 4px 12px rgba(37,211,102,0.3)",
          transition: "all 0.2s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {loading ? "तयार होत आहे..." : "📲 WhatsApp Share"}
      </button>

      {error && <p style={{ color:"#ef4444", fontSize:12, marginTop:6, ...MR }}>⚠️ {error}</p>}

      {/* Modal */}
      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position:"fixed", inset:0, zIndex:1000,
            background:"rgba(0,0,0,0.65)",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:16,
          }}
        >
          <div style={{
            background:"#fff", borderRadius:20, width:"100%", maxWidth:520,
            boxShadow:"0 24px 64px rgba(0,0,0,0.25)",
            overflow:"hidden",
          }}>

            {/* Modal header */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"16px 20px",
              background:"linear-gradient(135deg,#25D366,#128C7E)",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <div style={{ color:"#fff", fontWeight:800, fontSize:15 }}>WhatsApp Share</div>
                  <div style={{ color:"rgba(255,255,255,0.75)", fontSize:11, ...MR }}>
                    {saved ? "✅ Firestore मध्ये सेव्ह झाले" : "Message तयार आहे"}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background:"rgba(255,255,255,0.2)", border:"none", borderRadius:8,
                  width:30, height:30, color:"#fff", cursor:"pointer", fontSize:16, display:"flex",
                  alignItems:"center", justifyContent:"center" }}>
                ✕
              </button>
            </div>

            {/* Message preview */}
            <div style={{ padding:"16px 20px 0" }}>
              <div style={{
                background:"#e7ffd8", border:"1px solid #c3f0a0",
                borderRadius:14, padding:"14px 16px", marginBottom:12,
                ...MR, fontSize:13, lineHeight:1.75,
                color:"#1a1a1a", whiteSpace:"pre-wrap", wordBreak:"break-word",
              }}>
                {message}
              </div>

              {/* Editable */}
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={7}
                style={{
                  width:"100%", padding:"12px 14px",
                  border:"1.5px solid #e5e7eb", borderRadius:12,
                  fontSize:12, ...MR, lineHeight:1.7,
                  color:"#374151", resize:"vertical", outline:"none",
                  boxSizing:"border-box", marginBottom:14,
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ padding:"0 20px 20px", display:"flex", flexDirection:"column", gap:8 }}>

              {/* Row 1 — Copy + WhatsApp */}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={copyToClipboard} style={{
                  flex:1, padding:"11px 0", borderRadius:12,
                  background: copied ? "#10b981" : "#f3f4f6",
                  color: copied ? "#fff" : "#374151",
                  border:"none", fontWeight:700, fontSize:13,
                  cursor:"pointer", ...MR, transition:"all 0.2s",
                }}>
                  {copied ? "✅ कॉपी झाले!" : "📋 Copy करा"}
                </button>
                <button onClick={shareOnWhatsApp} style={{
                  flex:1, padding:"11px 0", borderRadius:12,
                  background:"#25D366", color:"#fff",
                  border:"none", fontWeight:700, fontSize:13,
                  cursor:"pointer", ...MR,
                  boxShadow:"0 4px 12px rgba(37,211,102,0.3)",
                }}>
                  📲 WhatsApp वर पाठवा
                </button>
              </div>

              {/* Row 2 — Save to Firestore */}
              <button onClick={saveMessage} disabled={saving || saved} style={{
                width:"100%", padding:"11px 0", borderRadius:12,
                background: saved ? "#dcfce7" : saving ? "#e5e7eb" : "#fff3cd",
                color: saved ? "#15803d" : saving ? "#9ca3af" : "#92400e",
                border: `1.5px solid ${saved ? "#86efac" : saving ? "#e5e7eb" : "#fcd34d"}`,
                fontWeight:700, fontSize:13, cursor: (saving || saved) ? "not-allowed" : "pointer",
                ...MR, transition:"all 0.2s",
              }}>
                {saved ? "✅ Firestore मध्ये सेव्ह झाले!" : saving ? "सेव्ह होत आहे..." : "💾 Article मध्ये Save करा"}
              </button>

              {/* Row 3 — Regenerate */}
              <button onClick={() => generate(false)} disabled={loading} style={{
                width:"100%", padding:"9px 0", borderRadius:12,
                background:"none", color:"#6b7280",
                border:"1px dashed #d1d5db",
                fontSize:12, cursor:"pointer", ...MR,
              }}>
                🔄 नवीन Format तयार करा
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
