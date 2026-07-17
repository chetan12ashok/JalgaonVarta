// src/app/search/page.tsx
import { getArticles } from "@/lib/db";
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import NewsCard from "@/components/portal/NewsCard";
import Pagination from "@/components/portal/Pagination";

const PAGE_SIZE = 20;

interface Props { searchParams: { q?: string; page?: string } }

function parsePage(value?: string) {
  const page = Number(value || "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || "";
  const currentPage = parsePage(searchParams.page);

  const { articles, total } = await getArticles({
    status: "PUBLISHED",
    search: query || undefined,
    page: currentPage,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold font-marathi text-gray-900">
            {query ? `"${query}" साठी शोध परिणाम` : "सर्व बातम्या"}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-marathi">{total} बातम्या सापडल्या</p>
        </div>

        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {articles.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/search"
              query={{ q: query || undefined }}
            />
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-marathi text-lg">
              {query ? `"${query}" साठी कोणत्याही बातम्या सापडल्या नाहीत` : "अजून बातम्या नाहीत"}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
