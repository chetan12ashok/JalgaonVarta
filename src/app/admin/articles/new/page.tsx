"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category { id: string; name: string; }

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState<{msg:string;type:"success"|"error"}|null>(null);

  const [title,      setTitle]      = useState("");
  const [excerpt,    setExcerpt]    = useState("");
  const [content,    setContent]    = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl,   setImageUrl]   = useState("");
  const [status,     setStatus]     = useState("PENDING");

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

  async function handleSave() {
    if (!title.trim() || !content.trim() || !excerpt.trim() || !categoryId) {
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

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">नवीन बातमी</h1>
          <p className="text-gray-500 text-sm mt-1">नवीन बातमी तयार करा</p>
        </div>
        <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors">
          ← परत
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            शीर्षक <span className="text-red-500">*</span>
          </label>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="बातमीचे शीर्षक लिहा..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          />
        </div>

        {/* Category + Status row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
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
          <input
            type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Excerpt (सारांश) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)}
            placeholder="एक-दोन वाक्यांचा सारांश..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 resize-none"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Content (मजकूर) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={14} value={content} onChange={e => setContent(e.target.value)}
            placeholder="<p>बातमीचा संपूर्ण मजकूर HTML मध्ये...</p>"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 resize-none text-sm font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">HTML tags वापरा: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;</p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 text-base"
          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        >
          {saving ? "सेव्ह होत आहे..." : "✅ बातमी सेव्ह करा"}
        </button>
        <button onClick={() => router.push("/admin/articles")}
          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
