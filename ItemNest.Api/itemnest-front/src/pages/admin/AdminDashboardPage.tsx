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
      } catch (error: any) {
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
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("adminPages.dashboard.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("adminPages.dashboard.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("adminPages.dashboard.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/reports"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {t("adminPages.dashboard.reviewReports")}
            </Link>
            <Link
              to="/admin/posts"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("adminPages.dashboard.managePosts")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("adminPages.dashboard.users")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.totalUsersCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("adminPages.dashboard.usersDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("adminPages.dashboard.posts")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.totalPostsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("adminPages.dashboard.postsDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("adminPages.dashboard.reportsWaiting")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.pendingReportsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("adminPages.dashboard.reportsDescription")}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {t("adminPages.dashboard.adminOverview")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t("adminPages.dashboard.adminOverviewDescription")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) =>
            card.to ? (
              <Link
                key={card.title}
                to={card.to}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                <p className="mt-5 text-sm font-medium text-slate-900">
                  {t("adminPages.dashboard.openSection")}
                </p>
              </Link>
            ) : (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("adminPages.dashboard.moderationSummary")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("adminPages.dashboard.moderationSummaryDescription")}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                {t("adminPages.dashboard.totalPostsLabel")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {dashboard.totalPostsCount}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {moderationRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-xs text-slate-500">
                      {t("adminPages.dashboard.moderationRows.ofPostVolume", {
                        percentage: row.percentage,
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{row.value}</p>
                </div>

                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-slate-900"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {t("adminPages.dashboard.adminActions")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t("adminPages.dashboard.adminActionsDescription")}
          </p>

          <div className="mt-5 space-y-3">
            <Link
              to="/admin/reports"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>{t("adminPages.dashboard.actions.reviewReports")}</span>
              <span>{dashboard.pendingReportsCount}</span>
            </Link>

            <Link
              to="/admin/posts"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>{t("adminPages.dashboard.actions.managePosts")}</span>
              <span>{dashboard.totalPostsCount}</span>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>{t("adminPages.dashboard.actions.manageUsers")}</span>
              <span>{dashboard.totalUsersCount}</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
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
