"use client";
// src/app/admin/sources/page.tsx
import { useState, useEffect } from "react";

interface Source {
  id:           string;
  name:         string;
  type:         string;
  url:          string;
  active:       boolean;
  lastFetched:  string | null;
  articleCount: number;
}

const TYPE_COLORS: Record<string, string> = {
  WORDPRESS: "bg-blue-100 text-blue-700",
  RSS:       "bg-purple-100 text-purple-700",
  SCRAPER:   "bg-amber-100 text-amber-700",
};

export default function SourcesPage() {
  const [sources, setSources]   = useState<Source[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "WORDPRESS", url: "" });
  const [toast, setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  async function loadSources() {
    setLoading(true);
    const res  = await fetch("/api/sources");
    const data = await res.json();
    setSources(data || []);
    setLoading(false);
  }

  useEffect(() => { loadSources(); }, []);

  async function toggleSource(id: string, active: boolean) {
    await fetch(`/api/sources/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ active }),
    });
    showToast(active ? "Source सक्रिय केले" : "Source बंद केले");
    loadSources();
  }

  async function addSource() {
    if (!formData.name || !formData.url) return;
    await fetch("/api/sources", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(formData),
    });
    showToast("✅ Source जोडले");
    setShowForm(false);
    setFormData({ name: "", type: "WORDPRESS", url: "" });
    loadSources();
  }

  async function deleteSource(id: string) {
    if (!confirm("हे source delete करायचे का?")) return;
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    showToast("Source delete झाले");
    loadSources();
  }

  return (
    <div className="p-6 lg:p-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News Sources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Scraper चे sources manage करा</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-black text-white font-semibold rounded-xl hover:bg-black transition-colors text-sm">
          + नवीन Source
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-yellow-300 shadow-sm p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">नवीन Source जोडा</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jalgaon Today"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400">
                <option value="WORDPRESS">WordPress API</option>
                <option value="RSS">RSS Feed</option>
                <option value="SCRAPER">HTML Scraper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/feed/"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-400" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addSource}
              className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black transition-colors">
              जोडा
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sources list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">लोड होत आहे...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sources.map((source) => (
            <div key={source.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
              source.active ? "border-gray-100" : "border-gray-100 opacity-60"
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-base">{source.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[source.type] || "bg-gray-100 text-gray-600"}`}>
                      {source.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      source.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {source.active ? "🟢 Active" : "⚪ Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-mono break-all">{source.url}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>📰 {source.articleCount} articles</span>
                    {source.lastFetched && (
                      <span>🕐 Last: {new Date(source.lastFetched).toLocaleString("mr-IN")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleSource(source.id, !source.active)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                      source.active
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {source.active ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => deleteSource(source.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sources.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
              <p className="font-marathi text-sm">कोणतेही sources नाहीत. वर "+ नवीन Source" दाबा.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
