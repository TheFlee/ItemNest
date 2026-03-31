interface PageStateProps {
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export default function PageState({
  isLoading,
  errorMessage,
  emptyMessage,
  isEmpty,
}: PageStateProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
        <p className="mt-4 text-base font-medium text-slate-700">Loading...</p>
        <p className="mt-1 text-sm text-slate-500">
          Please wait while the data is being prepared.
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <p className="font-semibold">Something went wrong</p>
        <p className="mt-1 leading-6">{errorMessage}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600 shadow-sm">
        <p className="text-lg font-semibold text-slate-800">No data found</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {emptyMessage ?? "No data found."}
        </p>
      </div>
    );
  }

  return null;
}