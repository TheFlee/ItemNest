import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyDashboard } from "../../api/dashboardApi";
import PageState from "../../components/common/PageState";
import type { MyDashboard } from "../../types/dashboard";
import { getApiErrorMessage } from "../../utils/error";

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
        emptyMessage="Dashboard data was not found."
      />
    );
  }

  const cards: DashboardCard[] = [
    {
      title: "My Posts",
      value: dashboard.myPostsCount,
      description: "All posts you created on the platform.",
      to: "/my-posts",
    },
    {
      title: "Open Posts",
      value: dashboard.openPostsCount,
      description: "Posts that are still active and visible.",
      to: "/my-posts",
    },
    {
      title: "Returned Posts",
      value: dashboard.returnedPostsCount,
      description: "Posts marked as successfully returned.",
      to: "/my-posts",
    },
    {
      title: "Closed Posts",
      value: dashboard.closedPostsCount,
      description: "Posts that are no longer active.",
      to: "/my-posts",
    },
    {
      title: "Favorites",
      value: dashboard.favoritesCount,
      description: "Posts you saved for later review.",
      to: "/favorites",
    },
    {
      title: "Pending Received Requests",
      value: dashboard.pendingReceivedContactRequestsCount,
      description: "Contact requests waiting for your response.",
      to: "/contact-requests/received",
    },
    {
      title: "Pending Sent Requests",
      value: dashboard.pendingSentContactRequestsCount,
      description: "Requests you sent and still waiting on.",
      to: "/contact-requests/sent",
    },
    {
      title: "My Reports",
      value: dashboard.myReportsCount,
      description: "Reports you submitted for posts.",
      to: "/my-reports",
    },
  ];

  const summaryRows = [
    {
      label: "Open",
      value: dashboard.openPostsCount,
      percentage: getPercentage(dashboard.openPostsCount, dashboard.myPostsCount),
    },
    {
      label: "Returned",
      value: dashboard.returnedPostsCount,
      percentage: getPercentage(dashboard.returnedPostsCount, dashboard.myPostsCount),
    },
    {
      label: "Closed",
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
              Account overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Review your activity, monitor post status, and move quickly to the areas that need attention.
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
              to="/my-posts"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Manage My Posts
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Total posts</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.myPostsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              All item posts currently created under your account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Requests waiting</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.pendingReceivedContactRequestsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pending received requests that still need your decision.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Saved and tracked</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.favoritesCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Favorite posts saved for later review and follow-up.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Quick access
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Open the main areas of your account with a cleaner overview.
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
              <p className="mt-5 text-sm font-medium text-slate-900">Open section</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Post status summary
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Distribution of your current post statuses.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Base total
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {dashboard.myPostsCount} posts
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {summaryRows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.label}</p>
                    <p className="text-xs text-slate-500">{row.percentage}% of all posts</p>
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
            Actions
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Common account tasks with direct access.
          </p>

          <div className="mt-5 space-y-3">
            <Link
              to="/contact-requests/received"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Review received requests</span>
              <span>{dashboard.pendingReceivedContactRequestsCount}</span>
            </Link>

            <Link
              to="/contact-requests/sent"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Check sent requests</span>
              <span>{dashboard.pendingSentContactRequestsCount}</span>
            </Link>

            <Link
              to="/favorites"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Open favorites</span>
              <span>{dashboard.favoritesCount}</span>
            </Link>

            <Link
              to="/my-reports"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Open my reports</span>
              <span>{dashboard.myReportsCount}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}