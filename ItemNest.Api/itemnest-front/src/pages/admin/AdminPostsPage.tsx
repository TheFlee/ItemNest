import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAdminPost,
  getAdminPosts,
  updateAdminPostStatus,
} from "../../api/adminPostApi";
import PageState from "../../components/common/PageState";
import type { ItemPost } from "../../types/post";
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

      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? updatedPost : post))
      );

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

  if (isLoading || errorMessage || posts.length === 0) {
    return (
      <div className="space-y-4">
        {successMessage && !isLoading && !errorMessage && (
          <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Posts</h1>
        <p className="mt-2 text-slate-600">
          Review, update, and moderate posts across the platform.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{post.title}</h2>

                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Owner:</span>{" "}
                  {post.userFullName}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Type:</span>{" "}
                  {getPostTypeLabel(post.type)}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Status:</span>{" "}
                  {getPostStatusLabel(post.status)}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Category:</span>{" "}
                  {post.categoryName}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Created At:</span>{" "}
                  {formatDateTime(post.createdAt)}
                </p>
              </div>

              <Link
                to={`/posts/${post.id}`}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
              >
                View Post
              </Link>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {post.description}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleStatusChange(post.id, 0)}
                disabled={processingId === post.id}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {processingId === post.id && post.status !== 0
                  ? "Processing..."
                  : "Mark Open"}
              </button>

              <button
                type="button"
                onClick={() => void handleStatusChange(post.id, 1)}
                disabled={processingId === post.id}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {processingId === post.id && post.status !== 1
                  ? "Processing..."
                  : "Mark Returned"}
              </button>

              <button
                type="button"
                onClick={() => void handleStatusChange(post.id, 2)}
                disabled={processingId === post.id}
                className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
              >
                {processingId === post.id && post.status !== 2
                  ? "Processing..."
                  : "Mark Closed"}
              </button>

              <button
                type="button"
                onClick={() => void handleDelete(post.id)}
                disabled={processingId === post.id}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {processingId === post.id ? "Processing..." : "Delete Post"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}