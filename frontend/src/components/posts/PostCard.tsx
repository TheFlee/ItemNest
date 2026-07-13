import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ItemPost } from "../../types/post";
import { buildFileUrl } from "../../utils/api";
import { formatDate } from "../../utils/format";
import {
  getPostStatusClassName,
  getPostStatusLabel,
  getPostTypeClassName,
  getPostTypeLabel,
} from "../../utils/post";

const itemColorMap: Record<number, string> = {
  0: "#94a3b8",
  1: "#0f172a",
  2: "#f8fafc",
  3: "#94a3b8",
  4: "#3b82f6",
  5: "#ef4444",
  6: "#22c55e",
  7: "#eab308",
  8: "#92400e",
  9: "#ec4899",
  10: "#a855f7",
  11: "#f97316",
  12: "#cbd5e1",
  13: "#ca8a04",
};

interface PostCardProps {
  post: ItemPost;
  showOwnerActions?: boolean;
}

export default function PostCard({ post, showOwnerActions = false }: PostCardProps) {
  const { t } = useTranslation();

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-100/30 dark:hover:shadow-black/30">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-surface)]">
        {post.primaryImageUrl ? (
          <img
            src={buildFileUrl(post.primaryImageUrl)}
            alt={post.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
            <ion-icon name="image-outline" style={{ fontSize: "32px", opacity: 0.4 }} />
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getPostTypeClassName(post.type)}`}>
            {getPostTypeLabel(post.type)}
          </span>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getPostStatusClassName(post.status)}`}>
            {getPostStatusLabel(post.status)}
          </span>
          {post.isOwner && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-300">
              {t("post.myPost")}
            </span>
          )}
          {post.isFavorited && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm dark:bg-amber-950 dark:text-amber-300">
              {t("post.favorited")}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <h2 className="line-clamp-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
            {post.description}
          </p>
        </div>

        <div className="grid gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <ion-icon name="pricetag-outline" style={{ fontSize: "13px", flexShrink: 0 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("common.category")}</span>
            <span className="ml-auto font-medium text-[var(--text-primary)]">{post.categoryName}</span>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <ion-icon name="location-outline" style={{ fontSize: "13px", flexShrink: 0 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("common.location")}</span>
            <span className="ml-auto font-medium text-[var(--text-primary)] line-clamp-1">{post.location}</span>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <ion-icon name="calendar-outline" style={{ fontSize: "13px", flexShrink: 0 }} />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("post.eventDate")}</span>
            <span className="ml-auto font-medium text-[var(--text-primary)]">{formatDate(post.eventDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <span
              className="h-3 w-3 rounded-full border border-white/20 shadow-sm flex-shrink-0"
              style={{ backgroundColor: itemColorMap[post.color] ?? "#94a3b8" }}
            />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("common.color")}</span>
            <span className="ml-auto font-medium text-[var(--text-primary)]">{post.userFullName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/posts/${post.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
          >
            <ion-icon name="eye-outline" style={{ fontSize: "14px" }} />
            {t("post.viewDetails")}
          </Link>

          {showOwnerActions && post.isOwner && (
            <Link
              to={`/posts/${post.id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              <ion-icon name="create-outline" style={{ fontSize: "14px" }} />
              {t("post.edit")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
