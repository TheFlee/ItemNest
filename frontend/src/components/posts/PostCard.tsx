import { useTranslation } from "react-i18next";
import { LLink } from "../common/LLink";
import type { ItemPost } from "../../types/post";
import { buildFileUrl } from "../../utils/api";
import { formatDate } from "../../utils/format";
import {
  getItemColorLabel,
  getPostStatusLabel,
  getPostTypeLabel,
} from "../../utils/post";

const itemColorMap: Record<number, string> = {
  0: "#94a3b8",
  1: "#1a1814",
  2: "#f0ede8",
  3: "#94a3b8",
  4: "#3b82f6",
  5: "#ef4444",
  6: "#22c55e",
  7: "#eab308",
  8: "#92400e",
  9: "#ec4899",
  10: "#a855f7",
  11: "#f97316",
  12: "#c8c8c8",
  13: "#ca8a04",
};

interface PostCardProps {
  post: ItemPost;
  showOwnerActions?: boolean;
}

export default function PostCard({ post, showOwnerActions = false }: PostCardProps) {
  const { t } = useTranslation();
  const isLost = post.type === 0;

  const statusDotColor =
    post.status === 0 ? "#4ade80"
    : post.status === 1 ? "#60a5fa"
    : "#94a3b8";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border)] hover:shadow-[0_12px_40px_rgba(28,26,23,0.12)]">

      {/* ── Image zone ──────────────────────────────────────── */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-surface)]">
        {post.primaryImageUrl ? (
          <img
            src={buildFileUrl(post.primaryImageUrl)}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ion-icon
              name="image-outline"
              style={{ fontSize: "36px", color: "var(--border)" }}
            />
          </div>
        )}

        {/* Gradient scrim — title readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* LOST / FOUND — sharp-corner stamp, top-left */}
        <div
          className="absolute left-0 top-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white"
          style={{ background: isLost ? "var(--accent)" : "var(--success)" }}
        >
          {getPostTypeLabel(post.type)}
        </div>

        {/* Status pill — top-right */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-md">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: statusDotColor }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/90">
            {getPostStatusLabel(post.status)}
          </span>
        </div>

        {/* My post / favorited — stacked under status */}
        <div className="absolute right-3 top-10 flex flex-col items-end gap-1.5">
          {post.isOwner && (
            <span className="rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md">
              {t("post.myPost")}
            </span>
          )}
          {post.isFavorited && (
            <span className="rounded-full px-2 py-1 text-[10px] font-bold text-amber-300 backdrop-blur-md">
              ♥
            </span>
          )}
        </div>

        {/* Title — Playfair Display over scrim */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-4">
          <h2
            className="line-clamp-2 text-[17px] font-bold leading-snug text-white"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
          >
            {post.title}
          </h2>
        </div>
      </div>

      {/* ── Content zone ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {post.description}
        </p>

        {/* Meta rows */}
        <div className="mt-auto space-y-2 border-t border-[var(--border)] pt-3">
          <div className="flex items-start gap-2">
            <ion-icon
              name="location-outline"
              style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "1px", flexShrink: 0 }}
            />
            <span className="line-clamp-1 text-xs font-medium text-[var(--text-primary)]">
              {post.location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ion-icon
              name="calendar-outline"
              style={{ fontSize: "13px", color: "var(--text-secondary)", flexShrink: 0 }}
            />
            <span className="text-xs font-medium text-[var(--text-primary)]">
              {formatDate(post.eventDate)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ion-icon
                name="pricetag-outline"
                style={{ fontSize: "13px", color: "var(--text-secondary)", flexShrink: 0 }}
              />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {post.categoryName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-[var(--border)] shadow-sm"
                style={{ backgroundColor: itemColorMap[post.color] ?? "#94a3b8" }}
              />
              <span className="text-xs text-[var(--text-secondary)]">
                {getItemColorLabel(post.color)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
          <span className="truncate text-[11px] text-[var(--text-secondary)]">
            {post.userFullName}
          </span>

          <div className="flex shrink-0 items-center gap-2">
            {showOwnerActions && post.isOwner && (
              <LLink
                to={`/posts/${post.slug}/edit`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <ion-icon name="create-outline" style={{ fontSize: "12px" }} />
                {t("post.edit")}
              </LLink>
            )}

            <LLink
              to={`/posts/${post.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-[0.97]"
              style={{ background: isLost ? "var(--accent)" : "var(--success)" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {t("post.viewDetails")}
              <ion-icon name="arrow-forward-outline" style={{ fontSize: "11px" }} />
            </LLink>
          </div>
        </div>
      </div>

      {/* Bottom accent sweep on hover */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{ background: isLost ? "var(--accent)" : "var(--success)" }}
      />
    </article>
  );
}
