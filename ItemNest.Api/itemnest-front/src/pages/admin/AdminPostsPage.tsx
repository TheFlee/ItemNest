import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAdminPost,
  getAdminPosts,
  updateAdminPostStatus,
} from "../../api/adminPostApi";
import PageState from "../../components/common/PageState";
import type { ItemPost } from "../../types/post";
import { buildFileUrl } from "../../utils/api";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import { getPostStatusLabel, getPostTypeLabel } from "../../utils/post";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getAdminPosts();
        setPosts(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPosts();
  }, []);

  async function handleStatusChange(postId: string, status: number) {
    setErrorMessage("");
    setSuccessMessage("");
    setProcessingId(postId);

    try {
      const updatedPost = await updateAdminPostStatus(postId, { status });

      setPosts((prev) => prev.map((post) => (post.id === postId ? updatedPost : post)));
      setSuccessMessage("Post status was updated successfully.");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(postId: string) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!isConfirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setProcessingId(postId);

    try {
      await deleteAdminPost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setSuccessMessage("Post was deleted successfully.");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  const metrics = useMemo(() => {
    return {
      total: posts.length,
      open: posts.filter((post) => post.status === 0).length,
      returned: posts.filter((post) => post.status === 1).length,
      closed: posts.filter((post) => post.status === 2).length,
    };
  }, [posts]);

  if (isLoading || errorMessage || posts.length === 0) {
    return (
      <div className="space-y-4">
        {successMessage && !isLoading && !errorMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && posts.length === 0}
          emptyMessage="There are no posts in the system."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Moderation
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Admin Posts
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Review posts across the platform, inspect ownership and metadata, update status, and delete invalid content when needed.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Back to Admin Dashboard
            </Link>
            <Link
              to="/admin/reports"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Open Reports
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Total posts</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Open</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.open}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Returned</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.returned}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Closed</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.closed}
            </p>
          </div>
        </div>
      </section>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Platform posts
        </h2>
        <p className="text-sm text-slate-600">
          Open any post for full details, or use direct admin actions below for moderation.
        </p>
      </section>

      <section className="grid gap-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="h-56 w-full shrink-0 overflow-hidden bg-slate-100 lg:h-auto lg:w-80">
                {post.primaryImageUrl ? (
                  <img
                    src={buildFileUrl(post.primaryImageUrl)}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-56 items-center justify-center text-sm text-slate-500">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Review owner information, timeline, status, and post content before taking moderation action.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          post.type === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {getPostTypeLabel(post.type)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {getPostStatusLabel(post.status)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Owner
                      </p>
                      <p className="mt-1 font-medium text-slate-700">{post.userFullName}</p>
                    </div>

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

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Created At
                      </p>
                      <p className="mt-1 font-medium text-slate-700">
                        {formatDateTime(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Description
                    </h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {post.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/posts/${post.id}`}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    View Post
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleStatusChange(post.id, 0)}
                    disabled={processingId === post.id}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId === post.id && post.status !== 0 ? "Processing..." : "Mark Open"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleStatusChange(post.id, 1)}
                    disabled={processingId === post.id}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId === post.id && post.status !== 1
                      ? "Processing..."
                      : "Mark Returned"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleStatusChange(post.id, 2)}
                    disabled={processingId === post.id}
                    className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId === post.id && post.status !== 2
                      ? "Processing..."
                      : "Mark Closed"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(post.id)}
                    disabled={processingId === post.id}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId === post.id ? "Processing..." : "Delete Post"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}