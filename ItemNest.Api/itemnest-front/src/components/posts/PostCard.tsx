import { Link } from "react-router-dom";
import type { ItemPost } from "../../types/post";
import { buildFileUrl } from "../../utils/api";
import { formatDate } from "../../utils/format";
import {
  getPostStatusClassName,
  getPostStatusLabel,
  getPostTypeClassName,
  getPostTypeLabel,
} from "../../utils/post";

interface PostCardProps {
  post: ItemPost;
  showOwnerActions?: boolean;
}

export default function PostCard({
  post,
  showOwnerActions = false,
}: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        {post.primaryImageUrl ? (
          <img
            src={buildFileUrl(post.primaryImageUrl)}
            alt={post.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No image
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getPostTypeClassName(
              post.type
            )}`}
          >
            {getPostTypeLabel(post.type)}
          </span>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${getPostStatusClassName(
              post.status
            )}`}
          >
            {getPostStatusLabel(post.status)}
          </span>

          {post.isOwner && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
              My Post
            </span>
          )}

          {post.isFavorited && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
              Favorited
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <h2 className="line-clamp-1 text-xl font-semibold tracking-tight text-slate-900">
            {post.title}
          </h2>
          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
            {post.description}
          </p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Category
            </p>
            <p className="mt-1 font-medium text-slate-700">{post.categoryName}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Location
            </p>
            <p className="mt-1 font-medium text-slate-700">{post.location}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Event Date
              </p>
              <p className="mt-1 font-medium text-slate-700">
                {formatDate(post.eventDate)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Posted By
              </p>
              <p className="mt-1 font-medium text-slate-700">{post.userFullName}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/posts/${post.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            View Details
          </Link>

          {showOwnerActions && post.isOwner && (
            <>
              <Link
                to={`/posts/${post.id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Edit
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}