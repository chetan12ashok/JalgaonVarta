"use client";
import { useState, useEffect } from "react";

interface Category {
  id: string; name: string; slug: string;
  color: string; description: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 lg:p-8">
      {toast && <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-lg text-sm">{toast}</div>}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 text-sm mt-1">सर्व विभाग</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">लोड होत आहे...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  {cat.name}
                </h3>
              </div>
              <p className="text-xs text-gray-400 font-mono mb-1">/{cat.slug}</p>
              {cat.description && <p className="text-sm text-gray-500" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{cat.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
