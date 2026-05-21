// src/app/page.tsx
import { getArticles, getCategories } from "@/lib/db";
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import NewsCard from "@/components/portal/NewsCard";
import BreakingTicker from "@/components/portal/BreakingTicker";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const [{ articles: latest }, allCategories] = await Promise.all([
    getArticles({ status: "PUBLISHED", pageSize: 24 }),
    getCategories(),
  ]);

  const featured   = latest.slice(0, 5); // Latest articles first
  const trending   = [...latest].sort((a, b) => b.views - a.views).slice(0, 6);
  const breakingHeadlines = latest.slice(0, 8).map((a) => a.title);
  const byCategory = allCategories.map((cat) => ({
    ...cat,
    articles: latest.filter((a) => a.categoryId === cat.id).slice(0, 4),
  })).filter((c) => c.articles.length >= 2);

  return (
    <>
      <Header />
      <BreakingTicker headlines={breakingHeadlines} />

      {/* Shorts entry banner */}
      <div style={{ background: '#000', borderBottom: '1px solid #222' }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: '#fff', fontSize: '13px', fontWeight: 700 }}>
              JalgaonVarta Shorts — ६० शब्दांत बातमी
            </span>
          </div>
          <Link href="/shorts" style={{
            background: '#E8420A', color: '#fff', fontFamily: "'Noto Sans Devanagari', sans-serif",
            fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '20px', textDecoration: 'none',
          }}>
            पहा →
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 fade-up">

        {/* ── Hero Section ─────────────────────────── */}
        {featured.length > 0 && (
          <section className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main hero */}
              <div className="lg:col-span-2">
                <NewsCard article={featured[0]} variant="featured" />
              </div>
              {/* Side stories */}
              <div className="flex flex-col gap-3">
                {featured.slice(1, 4).map((a) => (
                  <NewsCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Main content + Sidebar ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          {/* Latest articles — 3 cols */}
          <div className="lg:col-span-3">
            <div className="section-header">
              <h2>ताज्या बातम्या</h2>
              <Link href="/search">सर्व पहा →</Link>
            </div>
            <div className="grid-4">
              {latest.slice(0, 8).map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>

          {/* Sidebar — Trending */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Trending */}
              <div className="vk-card p-4 mb-4">
                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "2px solid var(--brand)" }}>
                  <span className="text-lg">🔥</span>
                  <h3 className="font-black text-base" style={{ color: "var(--text-primary)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                    ट्रेंडिंग
                  </h3>
                </div>
                {trending.map((a, i) => (
                  <Link key={a.id} href={`/article/${a.slug}`}
                    className="flex items-start gap-3 py-3 group border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="text-2xl font-black flex-shrink-0 w-8 text-center"
                      style={{ color: i < 3 ? "var(--brand)" : "var(--text-light)" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-2 group-hover:text-[--brand] transition-colors"
                        style={{ color: "var(--text-primary)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                        {a.title}
                      </p>
                      <p className="vk-caption mt-1">👁 {a.views}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Categories quick links */}
              <div className="vk-card p-4">
                <h3 className="font-black text-base mb-3" style={{ color: "var(--text-primary)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  विभाग
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <Link key={cat.id} href={`/category/${cat.slug}`}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
                      style={{ background: cat.color, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Category sections ─────────────────────── */}
        {byCategory.map((cat) => (
          <section key={cat.id} className="mb-10">
            <div className="section-header">
              <h2 style={{ color: "var(--text-primary)" }}>{cat.name}</h2>
              <Link href={`/category/${cat.slug}`} style={{ color: cat.color }}>सर्व पहा →</Link>
            </div>
            <div className="grid-4">
              {cat.articles.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          </section>
        ))}

        {/* Empty state */}
        {latest.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-secondary)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              अजून बातम्या नाहीत
            </h2>
            <p style={{ color: "var(--text-light)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              Admin Panel मधून बातम्या publish करा
            </p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
