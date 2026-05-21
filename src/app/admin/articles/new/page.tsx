"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Category { id: string; name: string; }

const MR = { fontFamily: "'Noto Sans Devanagari','Mukta',sans-serif" };

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [title,      setTitle]      = useState("");
  const [excerpt,    setExcerpt]    = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status,     setStatus]     = useState("PENDING");
  const [imageUrl,   setImageUrl]   = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(data => {
      setCategories(data || []);
      if (data?.length) setCategoryId(data[0].id);
    });
  }, []);

  // ── Toolbar command ──────────────────────────────────────────────────────
  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  }

  function insertHeading(tag: string) {
    exec("formatBlock", tag);
  }

  async function handleSave() {
    const content = editorRef.current?.innerHTML || "";
    if (!title.trim() || !content || content === "<br>" || !excerpt.trim() || !categoryId) {
      showToast("Title, Excerpt, Content आणि Category आवश्यक आहे", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/articles", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, excerpt, content, categoryId, imageUrl: imageUrl || null, status }),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("✅ बातमी सेव्ह झाली!");
      setTimeout(() => router.push("/admin/articles"), 1200);
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    }
    setSaving(false);
  }

  const toolbarBtn = (onClick: () => void, label: string, title: string, active = false) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: "5px 10px",
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
        background: active ? "#f97316" : "#f9fafb",
        color: active ? "#fff" : "#374151",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        lineHeight: 1.4,
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>{toast.msg}</div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">नवीन बातमी</h1>
          <p className="text-gray-500 text-sm mt-1" style={MR}>नवीन बातमी तयार करा</p>
        </div>
        <button onClick={() => router.back()}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200">
          ← परत
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" style={MR}>
            शीर्षक <span className="text-red-500">*</span>
          </label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="बातमीचे शीर्षक लिहा..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            style={MR} />
        </div>

        {/* Category + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" style={MR}>Category *</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400"
              style={MR}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400">
              <option value="PENDING">PENDING</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thumbnail URL (optional)</label>
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400" />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5" style={MR}>
            Excerpt (सारांश) <span className="text-red-500">*</span>
          </label>
          <textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)}
            placeholder="एक-दोन वाक्यांचा सारांश..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 resize-none"
            style={MR} />
        </div>

        {/* Rich text editor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" style={MR}>
            Content (मजकूर) <span className="text-red-500">*</span>
          </label>

          {/* Toolbar */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "6px",
            padding: "10px 12px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderBottom: "none",
            borderRadius: "12px 12px 0 0",
          }}>
            {toolbarBtn(() => exec("bold"),          "B",      "Bold")}
            {toolbarBtn(() => exec("italic"),        "I",      "Italic")}
            {toolbarBtn(() => exec("underline"),     "U",      "Underline")}
            <div style={{ width: "1px", background: "#e5e7eb", margin: "0 2px" }} />
            {toolbarBtn(() => insertHeading("h2"),   "H2",     "Heading 2")}
            {toolbarBtn(() => insertHeading("h3"),   "H3",     "Heading 3")}
            {toolbarBtn(() => insertHeading("p"),    "¶",      "Paragraph")}
            <div style={{ width: "1px", background: "#e5e7eb", margin: "0 2px" }} />
            {toolbarBtn(() => exec("insertUnorderedList"), "• List",  "Bullet List")}
            {toolbarBtn(() => exec("insertOrderedList"),   "1. List", "Numbered List")}
            <div style={{ width: "1px", background: "#e5e7eb", margin: "0 2px" }} />
            {toolbarBtn(() => exec("removeFormat"),  "Clear",  "Clear Formatting")}
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="येथे बातमीचा मजकूर लिहा..."
            style={{
              minHeight: "280px",
              padding: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "0 0 12px 12px",
              outline: "none",
              fontFamily: "'Noto Sans Devanagari','Mukta',sans-serif",
              fontSize: "15px",
              lineHeight: "1.85",
              color: "#1f2937",
              background: "#fff",
            }}
            onFocus={e => {
              if (e.currentTarget.innerHTML === "") {
                e.currentTarget.style.color = "#1f2937";
              }
            }}
          />

          <style>{`
            [contenteditable]:empty:before {
              content: attr(data-placeholder);
              color: #9ca3af;
              pointer-events: none;
            }
            [contenteditable] h2 { font-size: 1.4rem; font-weight: 800; margin: 1rem 0 0.5rem; }
            [contenteditable] h3 { font-size: 1.2rem; font-weight: 700; margin: 0.75rem 0 0.4rem; }
            [contenteditable] p  { margin-bottom: 0.75rem; }
            [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
            [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
            [contenteditable] b, [contenteditable] strong { font-weight: 800; }
          `}</style>
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3 mt-5">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 text-base"
          style={MR}>
          {saving ? "सेव्ह होत आहे..." : "✅ बातमी सेव्ह करा"}
        </button>
        <button onClick={() => router.push("/admin/articles")}
          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200">
          Cancel
        </button>
      </div>
    </div>
  );
}
