import { Link } from "react-router-dom";
import type { ItemPost } from "../../types/post";
import { buildFileUrl } from "../../utils/api";
import { formatDate } from "../../utils/format";
import { getPostTypeLabel } from "../../utils/post";

interface PostCardProps {
  post: ItemPost;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-md">
      <div className="h-52 w-full bg-slate-200">
        {post.primaryImageUrl ? (
          <img
            src={buildFileUrl(post.primaryImageUrl)}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="line-clamp-1 text-lg font-semibold text-slate-800">
            {post.title}
          </h2>

          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
              post.type === 0
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {getPostTypeLabel(post.type)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">{post.description}</p>

        <div className="mt-4 space-y-1 text-sm text-slate-500">
          <p>
            <span className="font-medium text-slate-700">Category:</span>{" "}
            {post.categoryName}
          </p>
          <p>
            <span className="font-medium text-slate-700">Location:</span>{" "}
            {post.location}
          </p>
          <p>
            <span className="font-medium text-slate-700">Event Date:</span>{" "}
            {formatDate(post.eventDate)}
          </p>
          <p>
            <span className="font-medium text-slate-700">Posted By:</span>{" "}
            {post.userFullName}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {post.isOwner && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                My Post
              </span>
            )}

            {post.isFavorited && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                Favorited
              </span>
            )}
          </div>

          <Link
            to={`/posts/${post.id}`}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-900"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}