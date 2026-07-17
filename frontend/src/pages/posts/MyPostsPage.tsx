import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMyPosts } from "../../api/itemPostApi";
import PageState from "../../components/common/PageState";
import PostCard from "../../components/posts/PostCard";
import PostCardSkeleton from "../../components/posts/PostCardSkeleton";
import type { ItemPost } from "../../types/post";
import { getApiErrorMessage } from "../../utils/error";
import { getPostStatusLabel, getPostTypeLabel } from "../../utils/post";

export default function MyPostsPage() {
  const { t } = useTranslation();
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

  if (isLoading) {
    return <PostCardSkeleton />;
  }

  if (errorMessage || posts.length === 0) {
    return (
      <div className="space-y-4">
        {routeSuccessMessage && !errorMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {routeSuccessMessage}
          </div>
        )}

        <PageState
          isLoading={false}
          errorMessage={errorMessage}
          isEmpty={!errorMessage && posts.length === 0}
          emptyMessage={t("myPostsPage.empty")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("myPostsPage.badge")}
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              <ion-icon name="document-text-outline" style={{ fontSize: "32px" }} />
              {t("myPostsPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("myPostsPage.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/create-post"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
            >
              {t("myPostsPage.actions.createPost")}
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
            >
              {t("myPostsPage.actions.backToDashboard")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("myPostsPage.metrics.total")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{getPostStatusLabel(0)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.openCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{getPostStatusLabel(1)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.returnedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{getPostStatusLabel(2)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.closedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{getPostTypeLabel(0)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.lostCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{getPostTypeLabel(1)}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
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
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {t("myPostsPage.list.title")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t("myPostsPage.list.description")}
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
