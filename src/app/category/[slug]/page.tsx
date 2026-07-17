// src/app/category/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getCategoryBySlug, getArticles } from "@/lib/db";
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import NewsCard from "@/components/portal/NewsCard";
import Pagination from "@/components/portal/Pagination";

const MR_FONT = "'Noto Sans Devanagari', 'Mukta', sans-serif";
const PAGE_SIZE = 24;

interface Props { params: { slug: string }; searchParams?: { page?: string } }

function parsePage(value?: string) {
  const page = Number(value || "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export async function generateMetadata({ params }: Props) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: "Not Found" };
  return { title: `${cat.name} | ViralKatta`, description: cat.description || `${cat.name} बातम्या` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const currentPage = parsePage(searchParams?.page);
  const { articles, total } = await getArticles({
    status: "PUBLISHED", categoryId: category.id, page: currentPage, pageSize: PAGE_SIZE,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Category header */}
        <div className="mb-8 pb-5" style={{ borderBottom: `3px solid ${category.color}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "6px", height: "52px", borderRadius: "4px",
              background: category.color, flexShrink: 0,
            }} />
            <div>
              <h1 style={{
                fontFamily: MR_FONT,
                fontSize:   "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 900,
                color:      "var(--text-primary)",
                lineHeight: 1.2,
              }}>
                {category.name}
              </h1>
              {category.description && (
                <p style={{
                  fontFamily: MR_FONT,
                  fontSize:   "var(--fs-sm)",
                  color:      "var(--text-secondary)",
                  marginTop:  "4px",
                }}>
                  {category.description}
                </p>
              )}
              <p style={{
                fontFamily: MR_FONT,
                fontSize:   "12px",
                color:      "var(--text-light)",
                marginTop:  "4px",
              }}>
                {total} बातम्या
              </p>
            </div>
          </div>
        </div>

        {articles.length > 0 ? (
          <>
            <div className="grid-4">
              {articles.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/category/${category.slug}`}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📰</div>
            <p style={{ fontFamily: MR_FONT, color: "var(--text-secondary)", fontSize: "var(--fs-lg)" }}>
              या विभागात अजून बातम्या नाहीत
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
