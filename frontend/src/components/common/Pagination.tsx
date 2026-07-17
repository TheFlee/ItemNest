import { useTranslation } from "react-i18next";

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const maxVisiblePages = 10;

function getVisiblePages(pageNumber: number, totalPages: number): number[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const halfWindow = Math.floor(maxVisiblePages / 2);
  let startPage = pageNumber - halfWindow + 1;
  let endPage = startPage + maxVisiblePages - 1;

  if (startPage < 1) {
    startPage = 1;
    endPage = maxVisiblePages;
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = totalPages - maxVisiblePages + 1;
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
}

const btnBase =
  "inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:bg-[var(--bg-surface)] transition disabled:cursor-not-allowed disabled:opacity-50";

export default function Pagination({
  pageNumber,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  function goToPreviousPage() {
    if (pageNumber > 1) onPageChange(pageNumber - 1);
  }

  function goToNextPage() {
    if (pageNumber < totalPages) onPageChange(pageNumber + 1);
  }

  const pages = getVisiblePages(pageNumber, totalPages);
  const firstVisiblePage = pages[0];
  const lastVisiblePage = pages[pages.length - 1];
  const showFirstPageShortcut = firstVisiblePage > 1;
  const showLastPageShortcut = lastVisiblePage < totalPages;

  return (
    <div className="mt-8 space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={pageNumber === 1}
          className={`${btnBase} px-4 py-2.5`}
        >
          {t("common.previous")}
        </button>

        {showFirstPageShortcut && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className={`${btnBase} h-10 min-w-10 px-3`}
            >
              1
            </button>
            <span className="px-1 text-sm text-[var(--text-secondary)]">...</span>
          </>
        )}

        {pages.map((page) => {
          const isActive = page === pageNumber;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : `${btnBase}`
              }`}
            >
              {page}
            </button>
          );
        })}

        {showLastPageShortcut && (
          <>
            <span className="px-1 text-sm text-[var(--text-secondary)]">...</span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={`${btnBase} h-10 min-w-10 px-3`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={goToNextPage}
          disabled={pageNumber === totalPages}
          className={`${btnBase} px-4 py-2.5`}
        >
          {t("common.next")}
        </button>
      </div>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        {t("common.pageOf", { page: pageNumber, total: totalPages })}
      </p>
    </div>
  );
}
