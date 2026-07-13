import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAdminDashboard } from "../../api/dashboardApi";
import PageState from "../../components/common/PageState";
import type { AdminDashboard } from "../../types/dashboard";
import { getApiErrorMessage } from "../../utils/error";

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getAdminDashboard();
        setDashboard(data);
      } catch (error: unknown) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (isLoading || errorMessage || !dashboard) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && !dashboard}
        emptyMessage={t("adminPages.dashboard.emptyMessage")}
      />
    );
  }

  const cards = [
    {
      title: t("adminPages.dashboard.cards.totalUsers"),
      value: dashboard.totalUsersCount,
      description: t("adminPages.dashboard.cards.totalUsersDescription"),
      to: "/admin/users",
    },
    {
      title: t("adminPages.dashboard.cards.totalPosts"),
      value: dashboard.totalPostsCount,
      description: t("adminPages.dashboard.cards.totalPostsDescription"),
      to: "/admin/posts",
    },
    {
      title: t("adminPages.dashboard.cards.openPosts"),
      value: dashboard.openPostsCount,
      description: t("adminPages.dashboard.cards.openPostsDescription"),
      to: "/admin/posts",
    },
    {
      title: t("adminPages.dashboard.cards.returnedPosts"),
      value: dashboard.returnedPostsCount,
      description: t("adminPages.dashboard.cards.returnedPostsDescription"),
      to: "/admin/posts",
    },
    {
      title: t("adminPages.dashboard.cards.closedPosts"),
      value: dashboard.closedPostsCount,
      description: t("adminPages.dashboard.cards.closedPostsDescription"),
      to: "/admin/posts",
    },
    {
      title: t("adminPages.dashboard.cards.categories"),
      value: dashboard.totalCategoriesCount,
      description: t("adminPages.dashboard.cards.categoriesDescription"),
      to: "/admin/categories",
    },
    {
      title: t("adminPages.dashboard.cards.pendingReports"),
      value: dashboard.pendingReportsCount,
      description: t("adminPages.dashboard.cards.pendingReportsDescription"),
      to: "/admin/reports",
    },
    {
      title: t("adminPages.dashboard.cards.pendingContactRequests"),
      value: dashboard.pendingContactRequestsCount,
      description: t("adminPages.dashboard.cards.pendingContactRequestsDescription"),
    },
  ];

  const moderationRows = [
    {
      label: t("adminPages.dashboard.moderationRows.pendingReports"),
      value: dashboard.pendingReportsCount,
      percentage: getPercentage(dashboard.pendingReportsCount, dashboard.totalPostsCount),
    },
    {
      label: t("adminPages.dashboard.moderationRows.openPosts"),
      value: dashboard.openPostsCount,
      percentage: getPercentage(dashboard.openPostsCount, dashboard.totalPostsCount),
    },
    {
      label: t("adminPages.dashboard.moderationRows.returnedPosts"),
      value: dashboard.returnedPostsCount,
      percentage: getPercentage(dashboard.returnedPostsCount, dashboard.totalPostsCount),
    },
    {
      label: t("adminPages.dashboard.moderationRows.closedPosts"),
      value: dashboard.closedPostsCount,
      percentage: getPercentage(dashboard.closedPostsCount, dashboard.totalPostsCount),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("adminPages.dashboard.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              {t("adminPages.dashboard.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("adminPages.dashboard.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/reports"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
            >
              {t("adminPages.dashboard.reviewReports")}
            </Link>
            <Link
              to="/admin/posts"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              {t("adminPages.dashboard.managePosts")}
            </Link>
            <Link
              to="/admin/categories"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              <ion-icon name="pricetag-outline" style={{ fontSize: "15px" }} />
              {t("nav.adminCategories")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-2">
              <ion-icon name="people-outline" style={{ fontSize: "18px" }} />
              <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.dashboard.users")}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {dashboard.totalUsersCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("adminPages.dashboard.usersDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-2">
              <ion-icon name="layers-outline" style={{ fontSize: "18px" }} />
              <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.dashboard.posts")}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {dashboard.totalPostsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("adminPages.dashboard.postsDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-2">
              <ion-icon name="flag-outline" style={{ fontSize: "18px" }} />
              <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.dashboard.reportsWaiting")}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {dashboard.pendingReportsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("adminPages.dashboard.reportsDescription")}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t("adminPages.dashboard.adminOverview")}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("adminPages.dashboard.adminOverviewDescription")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) =>
            card.to ? (
              <Link
                key={card.title}
                to={card.to}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--border)] hover:shadow-md"
              >
                <p className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.description}</p>
                <p className="mt-5 text-sm font-medium text-[var(--text-primary)]">
                  {t("adminPages.dashboard.openSection")}
                </p>
              </Link>
            ) : (
              <div
                key={card.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.description}</p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {t("adminPages.dashboard.moderationSummary")}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("adminPages.dashboard.moderationSummaryDescription")}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                {t("adminPages.dashboard.totalPostsLabel")}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                {dashboard.totalPostsCount}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {moderationRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{row.label}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {t("adminPages.dashboard.moderationRows.ofPostVolume", {
                        percentage: row.percentage,
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{row.value}</p>
                </div>

                <div className="h-2.5 rounded-full bg-[var(--bg-surface)]">
                  <div
                    className="h-2.5 rounded-full bg-[var(--accent)]"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t("adminPages.dashboard.adminActions")}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("adminPages.dashboard.adminActionsDescription")}
          </p>

          <div className="mt-5 space-y-3">
            <Link
              to="/admin/reports"
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              <span>{t("adminPages.dashboard.actions.reviewReports")}</span>
              <span>{dashboard.pendingReportsCount}</span>
            </Link>

            <Link
              to="/admin/posts"
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              <span>{t("adminPages.dashboard.actions.managePosts")}</span>
              <span>{dashboard.totalPostsCount}</span>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              <span>{t("adminPages.dashboard.actions.manageUsers")}</span>
              <span>{dashboard.totalUsersCount}</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              <span>{t("adminPages.dashboard.actions.openUserDashboard")}</span>
              <span>{t("adminPages.dashboard.actions.go")}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
