interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] ${className}`}
    />
  );
}
