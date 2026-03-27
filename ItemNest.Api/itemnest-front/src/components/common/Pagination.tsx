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
        onClick={goToPreviousPage}
        disabled={pageNumber === 1}
        className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-lg px-3 py-2 text-sm ${
            page === pageNumber
              ? "bg-slate-800 text-white"
              : "border bg-white text-slate-700"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={goToNextPage}
        disabled={pageNumber === totalPages}
        className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}