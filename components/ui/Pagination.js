import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildQueryString(searchParams, overrides = {}) {
  const params = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    const normalized = sanitizeValue(value);
    if (!normalized || key === "page") {
      return;
    }
    params.set(key, String(normalized));
  });
  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default function Pagination({ pagination, searchParams, basePath = "/resources" }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages } = pagination;
  const createLink = (targetPage) => `${basePath}${buildQueryString(searchParams, { page: targetPage })}`;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  const windowSize = 5;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, Math.max(page + 2, windowSize));
  const pageNumbers = [];
  for (let i = start; i <= end; i += 1) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-8 flex flex-col gap-4 border-t border-neutral-200 pt-6" aria-label="Resource pagination">
      <div className="flex items-center justify-between text-sm">
        <Link
          href={isFirstPage ? "#" : createLink(page - 1)}
          aria-disabled={isFirstPage}
          className={`inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 font-semibold text-primary-ink transition hover:border-primary hover:text-primary ${isFirstPage ? "pointer-events-none opacity-50" : ""}`}
        >
          <ChevronLeft size={16} /> Previous
        </Link>
        <Link
          href={isLastPage ? "#" : createLink(page + 1)}
          aria-disabled={isLastPage}
          className={`inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 font-semibold text-primary-ink transition hover:border-primary hover:text-primary ${isLastPage ? "pointer-events-none opacity-50" : ""}`}
        >
          Next <ChevronRight size={16} />
        </Link>
      </div>
      <ul className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        {pageNumbers.map((pageNumber) => (
          <li key={pageNumber}>
            <Link
              href={createLink(pageNumber)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                pageNumber === page
                  ? "border-primary bg-primary text-white"
                  : "border-neutral-200 text-primary-ink hover:border-primary hover:text-primary"
              }`}
            >
              {pageNumber}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
