"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import WhatsAppShare from "@/components/admin/WhatsAppShare";
interface Article {
  id:            string;
  title:         string;
  excerpt:       string;
  content:       string;
  imageUrl?:     string | null;
  originalTitle: string | null;
  sourceUrl?:    string | null;
  createdAt:     string;
  categoryId:    string;
  categoryName:  string;
  categoryColor: string;
  sourceName?:   string | null;
}

interface Category { id: string; name: string; }

export default function QueuePage() {
  const [articles,      setArticles]      = useState<Article[]>([]);
  const [categories,    setCategories]    = useState<Category[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState<Article | null>(null);
  const [editTitle,     setEditTitle]     = useState("");
  const [editExcerpt,   setEditExcerpt]   = useState("");
  const [editContent,   setEditContent]   = useState("");
  const [editCategory,  setEditCategory]  = useState("");
  const [editImage,     setEditImage]     = useState<string | null>(null);
  const [uploading,     setUploading]     = useState(false);
  const [processing,    setProcessing]    = useState<string | null>(null);
  const [page,          setPage]          = useState(1);
  const [total,         setTotal]         = useState(0);
  const [toast,         setToast]         = useState<{ msg: string; type: "success"|"error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 20;

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/articles?status=PENDING&page=${page}&limit=${pageSize}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch { showToast("Queue लोड करताना error", "error"); }
    setLoading(false);
  }, [page]);

  const loadCategories = useCallback(async () => {
    const res  = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data || []);
  }, []);

  useEffect(() => { loadQueue(); loadCategories(); }, [loadQueue, loadCategories]);

  function openArticle(article: Article) {
    setSelected(article);
    setEditTitle(article.title);
    setEditExcerpt(article.excerpt);
    setEditContent(article.content);
    setEditCategory(article.categoryId);
    setEditImage(article.imageUrl || null);
  }

  // ── Image upload to Firebase Storage via API ──────────────────────────
  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res  = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setEditImage(data.url);
        showToast("✅ Image upload झाले!");
      } else throw new Error(data.error || "Upload failed");
    } catch (err: any) {
      showToast("Image upload failed: " + err.message, "error");
    }
    setUploading(false);
  }

  // ── Image URL paste ──────────────────────────────────────────────────
  function handleImageUrl(url: string) {
    if (url.startsWith("http")) setEditImage(url);
  }

  async function handleAction(id: string, status: "PUBLISHED" | "REJECTED") {
    setProcessing(id);
    try {
      const body: any = { status };
      if (selected?.id === id) {
        body.title      = editTitle;
        body.excerpt    = editExcerpt;
        body.content    = editContent;
        body.categoryId = editCategory;
        body.imageUrl   = editImage;
      }
      const res = await fetch(`/api/articles/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      showToast(status === "PUBLISHED" ? "✅ बातमी publish झाली!" : "❌ बातमी reject झाली");
      setSelected(null);
      await loadQueue();
    } catch { showToast("Action failed", "error"); }
    setProcessing(null);
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>{toast.msg}</div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Queue</h1>
          <p className="text-gray-500 text-sm mt-1">{total} बातम्या review साठी</p>
        </div>
        <button onClick={loadQueue} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-200 transition-colors">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-3">⏳</div>
          <p>Queue लोड होत आहे...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-700 font-marathi mb-2">Queue रिकामी!</h2>
          <p className="text-gray-400 text-sm font-marathi">सर्व बातम्या review झाल्या आहेत</p>
        </div>
      ) : selected ? (
        /* ── Detail / Edit View ── */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-marathi">
              ← परत जा
            </button>
            {selected.sourceUrl && (
              <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="text-orange-500 hover:underline text-xs">
                मूळ बातमी ↗
              </a>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* ── Thumbnail section ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Thumbnail Image
              </label>

              {/* Current image preview */}
              {editImage && (
                <div className="relative rounded-xl overflow-hidden mb-3 bg-black" style={{ aspectRatio: "3/2", maxWidth: "480px" }}>
                  <Image
                    src={editImage}
                    alt="Thumbnail"
                    fill
                    className="object-contain"
                  />
                  <button
                    onClick={() => setEditImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              {!editImage && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-3 bg-gray-50" style={{ maxWidth: "480px" }}>
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="text-sm text-gray-400 font-marathi">कोणतेही thumbnail नाही</p>
                </div>
              )}

              {/* Upload options */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* File upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "📁 Image Upload करा"}
                </button>

                {/* URL paste */}
                <div className="flex items-center gap-2 flex-1 min-w-48">
                  <input
                    type="url"
                    placeholder="किंवा image URL paste करा..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400"
                    onBlur={(e) => handleImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleImageUrl((e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>
            </div>

            {/* Original title reference */}
            {selected.originalTitle && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Original Title (Reference)</p>
                <p className="text-sm text-gray-600 font-marathi">{selected.originalTitle}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-marathi text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-marathi text-gray-900 focus:outline-none focus:border-orange-400">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt</label>
              <textarea rows={3} value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-marathi text-gray-900 focus:outline-none focus:border-orange-400 resize-none" />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
              <textarea rows={10} value={editContent} onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-marathi text-gray-900 focus:outline-none focus:border-orange-400 resize-none text-sm" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => handleAction(selected.id, "PUBLISHED")}
              disabled={!!processing}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 shadow-sm"
            >
              {processing ? "..." : "✅ Publish करा"}
            </button>
            <button
              onClick={() => handleAction(selected.id, "REJECTED")}
              disabled={!!processing}
              className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ) : (
        /* ── List View ── */
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all overflow-hidden">
              <div className="flex gap-0">
                {/* Thumbnail preview */}
                <div className="relative flex-shrink-0 bg-black" style={{ width: "160px", aspectRatio: "3/2" }}>
                  {article.imageUrl ? (
                    <Image src={article.imageUrl} alt={article.title} fill className="object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-300 text-3xl">🖼️</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white font-marathi"
                      style={{ backgroundColor: article.categoryColor }}>
                      {article.categoryName}
                    </span>
                    {article.sourceName && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {article.sourceName}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(article.createdAt).toLocaleDateString("mr-IN")}
                    </span>
                  </div>
                  <h3 className="font-bold font-marathi text-gray-900 line-clamp-2 mb-1 text-sm">{article.title}</h3>
                  <p className="text-xs text-gray-500 font-marathi line-clamp-1">{article.excerpt}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-50 bg-gray-50">
                <button onClick={() => openArticle(article)}
                  className="flex-1 py-2 bg-orange-50 text-orange-700 font-medium rounded-xl text-sm hover:bg-orange-100 transition-colors">
                  ✏️ Review & Edit
                </button>
                <button
                  onClick={() => handleAction(article.id, "PUBLISHED")}
                  disabled={processing === article.id}
                  className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-xl text-sm hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {processing === article.id ? "..." : "✅ Publish"}
                </button>
                <WhatsAppShare
                  articleId={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  content={article.content}
                  slug={article.id}
                />
                <button
                  onClick={() => handleAction(article.id, "REJECTED")}
                  disabled={processing === article.id}
                  className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-xl text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  ❌
                </button>
              </div>
            </div>
          ))}

          {total > pageSize && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                मागे
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                पुढे
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
