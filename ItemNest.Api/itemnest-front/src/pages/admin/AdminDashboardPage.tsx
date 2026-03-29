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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Overview of platform activity and moderation workload.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) =>
          card.to ? (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{card.value}</p>
              <p className="mt-3 text-sm text-slate-600">{card.description}</p>
              <p className="mt-4 text-sm font-medium text-slate-800">Open →</p>
            </Link>
          ) : (
            <div key={card.title} className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{card.value}</p>
              <p className="mt-3 text-sm text-slate-600">{card.description}</p>
            </div>
          )
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-slate-800">Quick Admin Actions</h2>
        <p className="mt-2 text-slate-600">
          Access moderation tools and review important items.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/reports"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Review Reports
          </Link>

          <Link
            to="/admin/posts"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage Posts
          </Link>

          <Link
            to="/admin/users"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Manage Users
          </Link>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open User Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}