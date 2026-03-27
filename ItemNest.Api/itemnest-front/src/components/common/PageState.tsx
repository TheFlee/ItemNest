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
    return <div className="text-lg text-slate-700">Loading...</div>;
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg bg-red-100 px-4 py-3 text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl bg-white p-6 text-slate-600 shadow">
        {emptyMessage ?? "No data found."}
      </div>
    );
  }

  return null;
}