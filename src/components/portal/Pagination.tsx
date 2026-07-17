import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}

function pageHref(basePath: string, page: number, query: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  const pages = [];
  for (let page = start; page <= end; page++) pages.push(page);
  return pages;
}

export default function Pagination({ currentPage, totalPages, basePath, query = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);
  const canGoBack = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <nav className="pagination-wrap" aria-label="Pagination">
      {canGoBack ? (
        <Link className="pagination-btn" href={pageHref(basePath, currentPage - 1, query)}>
          मागे
        </Link>
      ) : (
        <span className="pagination-btn disabled">मागे</span>
      )}

      {pages[0] > 1 && (
        <>
          <Link className="pagination-page" href={pageHref(basePath, 1, query)}>1</Link>
          {pages[0] > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          className={`pagination-page ${page === currentPage ? "active" : ""}`}
          href={pageHref(basePath, page, query)}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
          <Link className="pagination-page" href={pageHref(basePath, totalPages, query)}>{totalPages}</Link>
        </>
      )}

      {canGoNext ? (
        <Link className="pagination-btn" href={pageHref(basePath, currentPage + 1, query)}>
          पुढे
        </Link>
      ) : (
        <span className="pagination-btn disabled">पुढे</span>
      )}
    </nav>
  );
}
