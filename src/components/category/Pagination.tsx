import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export default function Pagination({
  currentPage,
  totalPages,
  hrefForPage,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link
          href={hrefForPage(currentPage - 1)}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-bold text-stone-400">
          Previous
        </span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={hrefForPage(page)}
          className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold ${
            page === currentPage
              ? "bg-blush text-stone-800"
              : "border border-stone-200 bg-white"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={hrefForPage(currentPage + 1)}
          className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-bold text-stone-400">
          Next
        </span>
      )}
    </nav>
  );
}
