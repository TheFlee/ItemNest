import Skeleton from "../common/Skeleton";

function SingleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="rounded-2xl border border-[var(--border)] p-4 space-y-3">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

export default function PostCardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      <SingleCardSkeleton />
      <SingleCardSkeleton />
      <SingleCardSkeleton />
    </div>
  );
}
