import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMyPosts } from "../../api/itemPostApi";
import PageState from "../../components/common/PageState";
import PostCard from "../../components/posts/PostCard";
import type { ItemPost } from "../../types/post";
import { getApiErrorMessage } from "../../utils/error";
import { getPostStatusLabel, getPostTypeLabel } from "../../utils/post";

export default function MyPostsPage() {
  const location = useLocation();
  const routeSuccessMessage = location.state?.successMessage as string | undefined;

  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyPosts();
        setPosts(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPosts();
  }, []);

  const metrics = useMemo(() => {
    const openCount = posts.filter((post) => post.status === 0).length;
    const returnedCount = posts.filter((post) => post.status === 1).length;
    const closedCount = posts.filter((post) => post.status === 2).length;
    const lostCount = posts.filter((post) => post.type === 0).length;
    const foundCount = posts.filter((post) => post.type === 1).length;

    return {
      total: posts.length,
      openCount,
      returnedCount,
      closedCount,
      lostCount,
      foundCount,
    };
  }, [posts]);

  if (isLoading || errorMessage || posts.length === 0) {
    return (
      <div className="space-y-4">
        {routeSuccessMessage && !isLoading && !errorMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {routeSuccessMessage}
          </div>
        )}

        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && posts.length === 0}
          emptyMessage="You have not created any posts yet."
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
              Personal content
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              My Posts
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Manage the posts you created, review their current status, and open any post for editing, status changes, matches, images, and owner actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/create-post"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Create Post
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{getPostStatusLabel(0)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.openCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{getPostStatusLabel(1)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.returnedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{getPostStatusLabel(2)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.closedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{getPostTypeLabel(0)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.lostCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{getPostTypeLabel(1)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.foundCount}
            </p>
          </div>
        </div>
      </section>

      {routeSuccessMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {routeSuccessMessage}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          All created posts
        </h2>
        <p className="text-sm text-slate-600">
          Open any card to update details, manage images, check matches, or change status.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showOwnerActions />
        ))}
      </section>
    </div>
  );
}