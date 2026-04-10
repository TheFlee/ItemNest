import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyDashboard } from "../../api/dashboardApi";
import PageState from "../../components/common/PageState";
import type { MyDashboard } from "../../types/dashboard";
import { getApiErrorMessage } from "../../utils/error";
import { getPostStatusLabel } from "../../utils/post";

interface DashboardCard {
  title: string;
  value: number;
  description: string;
  to: string;
}

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<MyDashboard | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyDashboard();
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
        emptyMessage={t("dashboardPage.empty")}
      />
    );
  }

  const cards: DashboardCard[] = [
    {
      title: t("dashboardPage.quickAccess.myPosts"),
      value: dashboard.myPostsCount,
      description: t("dashboardPage.quickAccess.myPostsDescription"),
      to: "/my-posts",
    },
    {
      title: t("dashboardPage.quickAccess.openPosts"),
      value: dashboard.openPostsCount,
      description: t("dashboardPage.quickAccess.openPostsDescription"),
      to: "/my-posts",
    },
    {
      title: t("dashboardPage.quickAccess.returnedPosts"),
      value: dashboard.returnedPostsCount,
      description: t("dashboardPage.quickAccess.returnedPostsDescription"),
      to: "/my-posts",
    },
    {
      title: t("dashboardPage.quickAccess.closedPosts"),
      value: dashboard.closedPostsCount,
      description: t("dashboardPage.quickAccess.closedPostsDescription"),
      to: "/my-posts",
    },
    {
      title: t("dashboardPage.quickAccess.favorites"),
      value: dashboard.favoritesCount,
      description: t("dashboardPage.quickAccess.favoritesDescription"),
      to: "/favorites",
    },
    {
      title: t("dashboardPage.quickAccess.pendingReceivedRequests"),
      value: dashboard.pendingReceivedContactRequestsCount,
      description: t("dashboardPage.quickAccess.pendingReceivedRequestsDescription"),
      to: "/contact-requests/received",
    },
    {
      title: t("dashboardPage.quickAccess.pendingSentRequests"),
      value: dashboard.pendingSentContactRequestsCount,
      description: t("dashboardPage.quickAccess.pendingSentRequestsDescription"),
      to: "/contact-requests/sent",
    },
    {
      title: t("dashboardPage.quickAccess.myReports"),
      value: dashboard.myReportsCount,
      description: t("dashboardPage.quickAccess.myReportsDescription"),
      to: "/my-reports",
    },
  ];

  const summaryRows = [
    {
      label: getPostStatusLabel(0),
      value: dashboard.openPostsCount,
      percentage: getPercentage(dashboard.openPostsCount, dashboard.myPostsCount),
    },
    {
      label: getPostStatusLabel(1),
      value: dashboard.returnedPostsCount,
      percentage: getPercentage(dashboard.returnedPostsCount, dashboard.myPostsCount),
    },
    {
      label: getPostStatusLabel(2),
      value: dashboard.closedPostsCount,
      percentage: getPercentage(dashboard.closedPostsCount, dashboard.myPostsCount),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("dashboardPage.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("dashboardPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("dashboardPage.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/create-post"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {t("dashboardPage.actions.createPost")}
            </Link>
            <Link
              to="/my-posts"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("dashboardPage.actions.manageMyPosts")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("dashboardPage.highlights.totalPosts")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.myPostsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("dashboardPage.highlights.totalPostsDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("dashboardPage.highlights.requestsWaiting")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.pendingReceivedContactRequestsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("dashboardPage.highlights.requestsWaitingDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("dashboardPage.highlights.savedAndTracked")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.favoritesCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("dashboardPage.highlights.savedAndTrackedDescription")}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {t("dashboardPage.quickAccess.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t("dashboardPage.quickAccess.description")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
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
                {t("dashboardPage.actions.openSection")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("dashboardPage.summary.title")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("dashboardPage.summary.description")}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                {t("dashboardPage.summary.baseTotal")}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {t("dashboardPage.summary.baseTotalValue", {
                  count: dashboard.myPostsCount,
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {summaryRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-xs text-slate-500">
                      {t("dashboardPage.summary.ofAllPosts", {
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
      </section>
    </div>
  );
}