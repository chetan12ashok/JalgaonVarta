"use client";
import { useState, useEffect, useRef } from "react";
import WhatsAppShare from "@/components/admin/WhatsAppShare";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category { id: string; name: string; }
interface Article {
  id: string; title: string; excerpt: string; content: string;
  shortContent: string | null;
  imageUrl: string | null; status: string; categoryId: string;
  categoryName: string; categoryColor: string;
  originalTitle: string | null; sourceUrl: string | null;
  views: number; slug: string;
}

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article,    setArticle]    = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [activeTab,  setActiveTab]  = useState<"content"|"media"|"seo">("content");
  const [toast,      setToast]      = useState<{msg:string;type:"success"|"error"}|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title,      setTitle]      = useState("");
  const [excerpt,    setExcerpt]    = useState("");
  const [content,    setContent]    = useState("");
  const [shortNews,  setShortNews]  = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status,     setStatus]     = useState("");
  const [imageUrl,   setImageUrl]   = useState<string|null>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/articles/${params.id}`).then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([art, cats]) => {
      setArticle(art);
      setTitle(art.title || "");
      setExcerpt(art.excerpt || "");
      setContent(art.content || "");
      setShortNews(art.shortContent || art.shortNews || "");
      setCategoryId(art.categoryId || "");
      setStatus(art.status || "PENDING");
      setImageUrl(art.imageUrl || null);
      setCategories(cats || []);
      setLoading(false);
    }).catch(() => { showToast("Article लोड करताना error", "error"); setLoading(false); });
  }, [params.id]);

  async function handleSave() {
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      showToast("Title, Excerpt आणि Content आवश्यक आहे", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${params.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, excerpt, content, shortNews, shortContent: shortNews, categoryId, status, imageUrl }),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("✅ बातमी अपडेट झाली!");
      setTimeout(() => router.push("/admin/articles"), 1200);
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("ही बातमी कायमची delete करायची का?")) return;
    await fetch(`/api/articles/${params.id}`, { method: "DELETE" });
    showToast("बातमी delete झाली");
    setTimeout(() => router.push("/admin/articles"), 1000);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) { setImageUrl(data.url); showToast("✅ Image upload झाले!"); }
      else throw new Error(data.error || "Upload failed");
    } catch (err: any) { showToast("Upload failed: " + err.message, "error"); }
    setUploading(false);
  }

  const MR = { fontFamily: "'Noto Sans Devanagari', 'Mukta', sans-serif" };
  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  if (loading) return (
    <div className="p-8 text-center text-gray-400">
      <div className="text-3xl mb-3 animate-pulse">⏳</div>
      <p style={MR}>लोड होत आहे...</p>
    </div>
  );

  if (!article) return (
    <div className="p-8 text-center">
      <p className="text-gray-500 mb-4">Article सापडला नाही</p>
      <button onClick={() => router.push("/admin/articles")} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm">
        परत जा
      </button>
    </div>
  );

  const tabs = [
    { id: "content", label: "📝 Content" },
    { id: "media",   label: "🖼️ Thumbnail" },
    { id: "seo",     label: "⚡ Shorts" },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">बातमी Edit करा</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              status === "PUBLISHED" ? "bg-green-100 text-green-700" :
              status === "PENDING"   ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-600"
            }`}>{status}</span>
            <span className="text-gray-400 text-xs font-mono">{article.slug.substring(0, 40)}...</span>
          </div>
        </div>
        <div className="flex gap-2">
          {article.status === "PUBLISHED" && (
            <a href={`/article/${article.slug}`} target="_blank"
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm hover:bg-blue-100">
              🔗 View
            </a>
          )}
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200">
            ← परत
          </button>
        </div>
      </div>

      {/* Category + Status — always visible */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className={inputCls} style={MR}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
            <option value="PENDING">PENDING</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.id ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {/* ── CONTENT TAB ── */}
        {activeTab === "content" && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">शीर्षक *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className={inputCls} style={MR} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt (सारांश) *</label>
              <textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)}
                className={`${inputCls} resize-none`} style={MR} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content *</label>
              <textarea rows={14} value={content} onChange={e => setContent(e.target.value)}
                className={`${inputCls} resize-none text-sm font-mono`} />
              <p className="text-xs text-gray-400 mt-1">HTML: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;</p>
            </div>
            {article.originalTitle && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Original Title</p>
                <p className="text-sm text-gray-500" style={MR}>{article.originalTitle}</p>
              </div>
            )}
          </div>
        )}

        {/* ── MEDIA TAB ── */}
        {activeTab === "media" && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Thumbnail Image</label>
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio:"16/9", maxWidth:"480px" }}>
                <Image src={imageUrl} alt="Thumbnail" fill className="object-contain" />
                <button onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 font-bold">
                  ✕
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50" style={{ maxWidth:"480px" }}>
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm text-gray-400" style={MR}>कोणतेही thumbnail नाही</p>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                {uploading ? "⏳ Uploading..." : "📁 Image Upload करा"}
              </button>
              <input type="url" placeholder="किंवा image URL paste करा..."
                className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
                onBlur={e => { if (e.target.value.startsWith("http")) { setImageUrl(e.target.value); e.target.value = ""; } }}
                onKeyDown={e => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value; if (v.startsWith("http")) { setImageUrl(v); (e.target as HTMLInputElement).value = ""; } } }}
              />
            </div>
          </div>
        )}

        {/* ── SHORTS TAB ── */}
        {activeTab === "seo" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ⚡ Short News (Shorts साठी — ६० शब्दांत)
              </label>
              <textarea
                rows={5}
                value={shortNews}
                onChange={e => setShortNews(e.target.value)}
                placeholder="६० शब्दांत किंवा कमी शब्दांत संपूर्ण बातमी. WHO, WHAT, WHERE, WHEN सर्व cover करा..."
                className={`${inputCls} resize-none`}
                style={MR}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">Shorts page वर हा मजकूर दिसतो</p>
                <span className={`text-xs font-medium ${shortNews.split(/\s+/).filter(Boolean).length > 60 ? "text-red-500" : "text-green-600"}`}>
                  {shortNews.split(/\s+/).filter(Boolean).length} / 60 शब्द
                </span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-xs font-semibold text-orange-700 mb-1" style={MR}>💡 Tip</p>
              <p className="text-xs text-orange-600" style={MR}>
                Scraper आपोआप ६० शब्दांचा सारांश तयार करतो. हा field खाली असेल तर Excerpt वापरला जातो.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {/* WhatsApp Share */}
      {article && (
        <div className="mt-4">
          <WhatsAppShare
            articleId={article.id}
            title={title}
            excerpt={excerpt}
            content={content}
            slug={article.slug}
          />
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 text-base"
          style={MR}>
          {saving ? "सेव्ह होत आहे..." : "✅ बदल सेव्ह करा"}
        </button>
        <button onClick={handleDelete}
          className="px-6 py-3.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100">
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
