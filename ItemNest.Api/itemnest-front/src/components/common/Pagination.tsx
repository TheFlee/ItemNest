interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={pageNumber === 1}
        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

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

      <button
        type="button"
        onClick={goToNextPage}
        disabled={pageNumber === totalPages}
        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}