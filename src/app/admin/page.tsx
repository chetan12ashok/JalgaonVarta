// src/app/admin/page.tsx
import Link from "next/link";
import { getArticles, getDashboardStats } from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";

export default async function AdminDashboard() {
  const [stats, { articles: recentPending }, { articles: topArticles }] = await Promise.all([
    getDashboardStats(),
    getArticles({ status: "PENDING", pageSize: 5 }),
    getArticles({ status: "PUBLISHED", pageSize: 5 }),
  ]);

  const sortedTop = [...topArticles].sort((a, b) => b.views - a.views);

  const statCards = [
    { label: "Published",      value: stats.totalPublished, icon: "✅", color: "bg-green-50  text-green-700  border-green-200",  href: "/admin/articles?status=PUBLISHED" },
    { label: "Pending Review", value: stats.totalPending,   icon: "📋", color: "bg-yellow-100 text-black border-yellow-300", href: "/admin/queue" },
    { label: "Active Sources", value: stats.totalSources,   icon: "🌐", color: "bg-blue-50   text-blue-700   border-blue-200",   href: "/admin/sources" },
    { label: "Rejected",       value: stats.totalRejected,  icon: "❌", color: "bg-red-50    text-red-700    border-red-200",    href: "/admin/articles?status=REJECTED" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">डॅशबोर्ड</h1>
        <p className="text-gray-500 text-sm mt-1">ViralKatta CMS · Firebase Firestore</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}
            className={`p-5 rounded-2xl border ${s.color} hover:scale-105 transition-transform cursor-pointer`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              📋 Pending Review
              {stats.totalPending > 0 && (
                <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats.totalPending}
                </span>
              )}
            </h2>
            <Link href="/admin/queue" className="text-sm text-black hover:underline">सर्व पहा</Link>
          </div>
          {recentPending.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-marathi">Queue रिकामी!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentPending.map((a) => (
                <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-yellow-300 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-marathi text-gray-900 line-clamp-2">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span style={{ color: a.categoryColor }} className="font-medium">{a.categoryName}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(a.createdAt)}</span>
                      </div>
                    </div>
                    <Link href="/admin/queue"
                      className="px-3 py-1 bg-yellow-100 text-black text-xs font-medium rounded-full hover:bg-yellow-200">
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top articles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">🔥 Top Articles</h2>
            <Link href="/admin/articles" className="text-sm text-black hover:underline">सर्व पहा</Link>
          </div>
          {sortedTop.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm font-marathi">अजून published बातम्या नाहीत</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sortedTop.map((a, i) => (
                <div key={a.id} className="p-4 flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? "bg-black text-white" :
                    i === 1 ? "bg-yellow-200 text-yellow-900" :
                    i === 2 ? "bg-yellow-100 text-black" : "bg-gray-100 text-gray-500"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-marathi text-gray-900 line-clamp-1">{a.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span style={{ color: a.categoryColor }}>{a.categoryName}</span>
                      <span>•</span>
                      <span>👁 {a.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
