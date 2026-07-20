"use client";
// src/app/admin/articles/page.tsx
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Article {
  id:          string;
  title:       string;
  status:      string;
  views:       number;
  publishedAt: string | null;
  createdAt:   string;
  category:    { name: string; color: string };
  source?:     { name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700",
  PENDING:   "bg-yellow-100 text-black",
  REJECTED:  "bg-red-100 text-red-700",
  APPROVED:  "bg-blue-100 text-blue-700",
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [toast, setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (filter !== "ALL") params.set("status", filter);
    if (search) params.set("search", search);
    const res  = await fetch(`/api/articles?${params}`);
    const data = await res.json();
    setArticles(data.articles || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [filter, search, page]);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  async function deleteArticle(id: string) {
    if (!confirm("ही बातमी delete करायची का?")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    showToast("बातमी delete झाली");
    loadArticles();
  }

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/articles/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
    showToast(`Status: ${status}`);
    loadArticles();
  }

  return (
    <div className="p-6 lg:p-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">सर्व बातम्या</h1>
          <p className="text-sm text-gray-500 mt-0.5">एकूण {total} बातम्या</p>
        </div>
        <Link href="/admin/articles/new"
          className="px-5 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-black transition-colors text-sm shadow-sm w-fit">
          + नवीन बातमी
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {["ALL", "PUBLISHED", "PENDING", "REJECTED"].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {s === "ALL" ? "सर्व" : s}
          </button>
        ))}
        <div className="ml-auto">
          <input type="text" placeholder="शोधा..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-4 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-yellow-400 font-marathi" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">लोड होत आहे...</div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-3xl mb-2">📰</div>
            <p className="font-marathi text-sm">कोणत्याही बातम्या नाहीत</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">बातमी</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600">Views</th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-marathi font-medium text-gray-900 line-clamp-2">{article.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{article.source?.name || "Manual"}</p>
                    </td>
                    <td className="px-3 py-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white font-marathi"
                        style={{ backgroundColor: article.category.color }}>
                        {article.category.name}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[article.status] || "bg-gray-100 text-gray-600"}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-gray-500">👁 {article.views}</td>
                    <td className="px-3 py-4 text-gray-400 text-xs">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString("mr-IN")}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {article.status !== "PUBLISHED" && (
                          <button onClick={() => changeStatus(article.id, "PUBLISHED")}
                            className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100 transition-colors">
                            Publish
                          </button>
                        )}
                        <Link href={`/admin/articles/${article.id}`}
                          className="px-2 py-1 bg-yellow-100 text-black rounded-lg text-xs hover:bg-yellow-100 transition-colors">
                          Edit
                        </Link>
                        <button onClick={() => deleteArticle(article.id)}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
            ← मागे
          </button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 15)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 15)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
            पुढे →
          </button>
        </div>
      )}
    </div>
  );
}
