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

export default function Pagination({
  pageNumber,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function goToPreviousPage() {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  }

  function goToNextPage() {
    if (pageNumber < totalPages) {
      onPageChange(pageNumber + 1);
    }
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
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {showFirstPageShortcut && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              1
            </button>
            <span className="px-1 text-sm text-slate-400">...</span>
          </>
        )}

        {pages.map((page) => {
          const isActive = page === pageNumber;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          );
        })}

        {showLastPageShortcut && (
          <>
            <span className="px-1 text-sm text-slate-400">...</span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={goToNextPage}
          disabled={pageNumber === totalPages}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <p className="text-center text-sm text-slate-500">
        Page {pageNumber} of {totalPages}
      </p>
    </div>
  );
}