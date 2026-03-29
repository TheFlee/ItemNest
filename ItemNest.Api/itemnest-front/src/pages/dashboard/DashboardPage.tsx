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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Overview of your account activity and quick access to important areas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
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
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-800">Post Summary</h2>
          <p className="mt-2 text-slate-600">
            Quick breakdown of your post statuses.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Open</span>
                <span className="font-medium text-slate-800">
                  {dashboard.openPostsCount}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-800"
                  style={{
                    width:
                      dashboard.myPostsCount > 0
                        ? `${(dashboard.openPostsCount / dashboard.myPostsCount) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Returned</span>
                <span className="font-medium text-slate-800">
                  {dashboard.returnedPostsCount}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-800"
                  style={{
                    width:
                      dashboard.myPostsCount > 0
                        ? `${(dashboard.returnedPostsCount / dashboard.myPostsCount) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Closed</span>
                <span className="font-medium text-slate-800">
                  {dashboard.closedPostsCount}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-800"
                  style={{
                    width:
                      dashboard.myPostsCount > 0
                        ? `${(dashboard.closedPostsCount / dashboard.myPostsCount) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-800">Quick Actions</h2>
          <p className="mt-2 text-slate-600">
            Use these shortcuts to manage your activity faster.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/create-post"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
            >
              Create New Post
            </Link>

            <Link
              to="/my-posts"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage My Posts
            </Link>

            <Link
              to="/contact-requests/received"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Review Requests
            </Link>

            <Link
              to="/my-reports"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View My Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}