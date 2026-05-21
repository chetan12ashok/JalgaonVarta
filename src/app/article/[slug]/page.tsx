import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, getArticles, incrementViews } from "@/lib/db";
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import ArticleContent from "@/components/portal/ArticleContent";
import ShareButtons from "@/components/portal/ShareButtons";
import NewsCard from "@/components/portal/NewsCard";
import ReadingToolbar from "@/components/portal/ReadingToolbar";

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("mr-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(date));
}

function timeAgo(date: Date | string) {
  const diffMs    = new Date().getTime() - new Date(date).getTime();
  const diffMins  = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins  < 1)  return "आत्ताच";
  if (diffMins  < 60) return `${diffMins} मि. पूर्वी`;
  if (diffHours < 24) return `${diffHours} तास पूर्वी`;
  if (diffDays  < 7)  return `${diffDays} दिवस पूर्वी`;
  return formatDate(date);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Not Found" };
  return {
    title:       article.title,
    description: article.excerpt,
    openGraph:   {
      title:       article.title,
      description: article.excerpt,
      images:      article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);
  if (!article || article.status !== "PUBLISHED") notFound();

  incrementViews(article.id).catch(() => {});

  const { articles: moreArticles } = await getArticles({
    status: "PUBLISHED", categoryId: article.categoryId, pageSize: 6,
  });
  const related     = moreArticles.filter((a) => a.id !== article.id).slice(0, 5);
  const displayDate = article.publishedAt || article.createdAt;
  const plainText   = stripHtml(article.content);

  return (
    <>
      <Header />

      {/* Reading toolbar — sticky, with progress bar */}
      <ReadingToolbar content={plainText} title={article.title} />

      <main className="max-w-7xl mx-auto px-4 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-5 flex-wrap"
          style={{ fontSize: "var(--fs-sm)", color: "var(--text-light)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--brand)" }}>मुख्यपृष्ठ</Link>
          <span>/</span>
          <Link href={`/category/${article.categorySlug}`} className="hover:underline" style={{ color: "var(--brand)" }}>
            {article.categoryName}
          </Link>
          <span>/</span>
          <span className="truncate max-w-xs">{article.title.substring(0, 45)}...</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main Article ───────────────────────── */}
          <article className="lg:col-span-2" id="article-wrapper">

            {/* Category badge */}
            <Link href={`/category/${article.categorySlug}`}
              className="cat-badge mb-4 inline-block hover:opacity-80 transition-opacity"
              style={{ background: article.categoryColor, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
              {article.categoryName}
            </Link>

            {/* Title */}
            <h1 style={{
              fontFamily:   "'Noto Sans Devanagari', sans-serif",
              fontSize:     "clamp(1.5rem, 3.5vw, 2.2rem)",
              fontWeight:   900,
              lineHeight:   1.35,
              color:        "var(--text-primary)",
              marginBottom: "1.25rem",
            }}>
              {article.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 mb-6"
              style={{ borderBottom: "2px solid var(--border)", fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: "var(--fs-sm)", color: "var(--text-light)" }}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(displayDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeAgo(displayDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views} वाचन
              </span>
              {article.sourceUrl && (
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--brand)" }} className="flex items-center gap-1 hover:underline">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  मूळ स्रोत
                </a>
              )}
            </div>

            {/* Featured image */}
            {article.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden mb-6 bg-gray-100" style={{ aspectRatio: "16/9" }}>
                <Image src={article.imageUrl} alt={article.title} fill className="object-contain" style={{ background: "#111" }} priority />
              </div>
            )}

            {/* Excerpt / Lead */}
            <div className="rounded-xl p-5 mb-7" style={{
              background:   "var(--brand-light)",
              borderLeft:   "5px solid var(--brand)",
              borderRadius: "0 12px 12px 0",
              fontFamily:   "'Noto Sans Devanagari', sans-serif",
              fontSize:     "clamp(1rem, 2vw, 1.15rem)",
              fontWeight:   700,
              lineHeight:   1.9,
              color:        "var(--text-primary)",
            }}>
              {article.excerpt}
            </div>

            {/* Article body — id for bionic reading targeting */}
            <ArticleContent content={article.content} />

            {/* Tags */}
            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="mt-8 pt-4 flex flex-wrap gap-2 items-center"
                style={{ borderTop: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-light)", fontSize: "var(--fs-sm)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  टॅग:
                </span>
                {article.tags.map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ background: "var(--brand-light)", color: "var(--brand)", fontFamily: "'Noto Sans Devanagari', sans-serif", border: "1px solid var(--brand)" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <ShareButtons title={article.title} slug={article.slug} whatsappMessage={(article as any).whatsappMessage || null} />
          </article>

          {/* ── Sidebar ────────────────────────────── */}
          <aside id="article-sidebar">
            <div className="sticky top-24 space-y-5">
              <div className="vk-card p-4">
                <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "2px solid var(--brand)" }}>
                  <span className="text-lg">📰</span>
                  <h3 className="font-black" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", color: "var(--text-primary)", fontSize: "var(--fs-md)" }}>
                    संबंधित बातम्या
                  </h3>
                </div>
                {related.length > 0 ? related.map((a) => (
                  <Link key={a.id} href={`/article/${a.slug}`}
                    className="flex items-start gap-3 py-3 group"
                    style={{ borderBottom: "1px solid var(--border)" }}>
                    {a.imageUrl && (
                      <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image src={a.imageUrl} alt={a.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold line-clamp-2 group-hover:text-[--brand] transition-colors text-sm"
                        style={{ color: "var(--text-primary)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                        {a.title}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-light)" }}>👁 {a.views}</p>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm" style={{ color: "var(--text-light)", fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                    अजून बातम्या नाहीत
                  </p>
                )}
              </div>

              <div className="vk-card p-4">
                <Link href={`/category/${article.categorySlug}`}
                  className="flex items-center justify-between font-bold text-white px-4 py-3 rounded-xl"
                  style={{ background: article.categoryColor, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                  <span>{article.categoryName} च्या अजून बातम्या</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* More articles */}
        {related.length > 0 && (
          <section className="mt-12" id="article-more">
            <div className="section-header">
              <h2>{article.categoryName} — अजून वाचा</h2>
              <Link href={`/category/${article.categorySlug}`} style={{ color: article.categoryColor }}>
                सर्व पहा →
              </Link>
            </div>
            <div className="grid-4">
              {related.slice(0, 4).map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  );
}
