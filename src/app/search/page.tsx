// src/app/search/page.tsx
import { getArticles } from "@/lib/db";
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import NewsCard from "@/components/portal/NewsCard";

interface Props { searchParams: { q?: string } }

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "";

  const { articles } = query
    ? await getArticles({ status: "PUBLISHED", search: query, pageSize: 20 })
    : { articles: [] };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold font-marathi text-gray-900">
            {query ? `"${query}" साठी शोध परिणाम` : "बातमी शोधा"}
          </h1>
          {query && (
            <p className="text-gray-500 text-sm mt-1 font-marathi">{articles.length} बातम्या सापडल्या</p>
          )}
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {articles.map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        ) : query ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-marathi text-lg">"{query}" साठी कोणत्याही बातम्या सापडल्या नाहीत</p>
          </div>
        ) : null}
      </div>
      <Footer />
    </>
  );
}