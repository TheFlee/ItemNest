import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../api/dashboardApi";
import PageState from "../../components/common/PageState";
import type { AdminDashboard } from "../../types/dashboard";
import { getApiErrorMessage } from "../../utils/error";

interface AdminDashboardCard {
  title: string;
  value: number;
  description: string;
  to?: string;
}

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

export default function AdminDashboardPage() {
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
        emptyMessage="Admin dashboard data was not found."
      />
    );
  }

  const cards: AdminDashboardCard[] = [
    {
      title: "Total Users",
      value: dashboard.totalUsersCount,
      description: "Registered users in the platform.",
      to: "/admin/users",
    },
    {
      title: "Total Posts",
      value: dashboard.totalPostsCount,
      description: "All lost and found posts in the system.",
      to: "/admin/posts",
    },
    {
      title: "Open Posts",
      value: dashboard.openPostsCount,
      description: "Posts that are currently active.",
      to: "/admin/posts",
    },
    {
      title: "Returned Posts",
      value: dashboard.returnedPostsCount,
      description: "Posts marked as returned.",
      to: "/admin/posts",
    },
    {
      title: "Closed Posts",
      value: dashboard.closedPostsCount,
      description: "Posts that are no longer active.",
      to: "/admin/posts",
    },
    {
      title: "Categories",
      value: dashboard.totalCategoriesCount,
      description: "Available item categories.",
    },
    {
      title: "Pending Reports",
      value: dashboard.pendingReportsCount,
      description: "Reports waiting for moderation.",
      to: "/admin/reports",
    },
    {
      title: "Pending Contact Requests",
      value: dashboard.pendingContactRequestsCount,
      description: "Pending contact requests in the system.",
    },
  ];

  const moderationRows = [
    {
      label: "Pending reports",
      value: dashboard.pendingReportsCount,
      percentage: getPercentage(dashboard.pendingReportsCount, dashboard.totalPostsCount),
    },
    {
      label: "Open posts",
      value: dashboard.openPostsCount,
      percentage: getPercentage(dashboard.openPostsCount, dashboard.totalPostsCount),
    },
    {
      label: "Returned posts",
      value: dashboard.returnedPostsCount,
      percentage: getPercentage(dashboard.returnedPostsCount, dashboard.totalPostsCount),
    },
    {
      label: "Closed posts",
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
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Monitor platform activity, review moderation workload, and move quickly between admin management areas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/reports"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Review Reports
            </Link>
            <Link
              to="/admin/posts"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Manage Posts
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Users</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.totalUsersCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Total registered accounts currently available in the system.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Posts</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.totalPostsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Platform-wide post volume across lost and found activity.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Reports waiting</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {dashboard.pendingReportsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pending reports that still need admin moderation.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Admin overview
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Cleaner summary cards for the main moderation and platform metrics.
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
                <p className="mt-5 text-sm font-medium text-slate-900">Open section</p>
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
                Moderation summary
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                High-level distribution across reports and post statuses.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Total posts
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
                    <p className="text-xs text-slate-500">{row.percentage}% of post volume</p>
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
            Admin actions
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Open the most common moderation areas directly.
          </p>

          <div className="mt-5 space-y-3">
            <Link
              to="/admin/reports"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Review reports</span>
              <span>{dashboard.pendingReportsCount}</span>
            </Link>

            <Link
              to="/admin/posts"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Manage posts</span>
              <span>{dashboard.totalPostsCount}</span>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Manage users</span>
              <span>{dashboard.totalUsersCount}</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-slate-300 hover:bg-slate-100"
            >
              <span>Open user dashboard</span>
              <span>Go</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}