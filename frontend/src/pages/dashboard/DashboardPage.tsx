import { LLink } from "../../components/common/LLink";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyDashboard } from "../../api/dashboardApi";
import { getUserChats } from "../../api/chatApi";
import PageState from "../../components/common/PageState";
import type { MyDashboard } from "../../types/dashboard";
import type { ChatItem } from "../../types/chat";
import { getApiErrorMessage } from "../../utils/error";
import { getPostStatusLabel } from "../../utils/post";

interface DashboardCard {
  title: string;
  value: number;
  description: string;
  to: string;
  icon: string;
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
  const [chats, setChats] = useState<ChatItem[]>([]);
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

  useEffect(() => {
    getUserChats().then(setChats).catch(console.error);
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
      icon: "document-text-outline",
    },
    {
      title: t("dashboardPage.quickAccess.openPosts"),
      value: dashboard.openPostsCount,
      description: t("dashboardPage.quickAccess.openPostsDescription"),
      to: "/my-posts",
      icon: "radio-button-on-outline",
    },
    {
      title: t("dashboardPage.quickAccess.returnedPosts"),
      value: dashboard.returnedPostsCount,
      description: t("dashboardPage.quickAccess.returnedPostsDescription"),
      to: "/my-posts",
      icon: "checkmark-circle-outline",
    },
    {
      title: t("dashboardPage.quickAccess.closedPosts"),
      value: dashboard.closedPostsCount,
      description: t("dashboardPage.quickAccess.closedPostsDescription"),
      to: "/my-posts",
      icon: "archive-outline",
    },
    {
      title: t("dashboardPage.quickAccess.favorites"),
      value: dashboard.favoritesCount,
      description: t("dashboardPage.quickAccess.favoritesDescription"),
      to: "/favorites",
      icon: "heart-outline",
    },
    {
      title: t("chat.inbox"),
      value: chats.length,
      description: t("dashboardPage.quickAccess.chatsDescription"),
      to: "/chats",
      icon: "chatbubbles-outline",
    },
    {
      title: t("dashboardPage.quickAccess.unreadChats"),
      value: chats.filter((c) => c.unreadCount > 0).length,
      description: t("dashboardPage.quickAccess.unreadChatsDescription"),
      to: "/chats",
      icon: "chatbubble-ellipses-outline",
    },
    {
      title: t("dashboardPage.quickAccess.myReports"),
      value: dashboard.myReportsCount,
      description: t("dashboardPage.quickAccess.myReportsDescription"),
      to: "/my-reports",
      icon: "flag-outline",
    },
  ];

  const totalChats = chats.length;
  const unreadChats = chats.filter((c) => c.unreadCount > 0).length;

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
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("dashboardPage.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              {t("dashboardPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("dashboardPage.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <LLink
              to="/create-post"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
            >
              {t("dashboardPage.actions.createPost")}
            </LLink>
            <LLink
              to="/my-posts"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              {t("dashboardPage.actions.manageMyPosts")}
            </LLink>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("dashboardPage.highlights.totalPosts")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {dashboard.myPostsCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("dashboardPage.highlights.totalPostsDescription")}
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 ${unreadChats > 0 ? "border-amber-300 bg-amber-50 animate-pulse" : "border-[var(--border)] bg-[var(--bg-surface)]"}`}
          >
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("dashboardPage.highlights.unreadChats")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {unreadChats}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("dashboardPage.highlights.unreadChatsDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("dashboardPage.highlights.savedAndTracked")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {dashboard.favoritesCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("dashboardPage.highlights.savedAndTrackedDescription")}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t("dashboardPage.quickAccess.title")}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("dashboardPage.quickAccess.description")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <LLink
              key={card.title}
              to={card.to}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                  <ion-icon name={card.icon} style={{ fontSize: "16px" }} />
                </div>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                {card.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{card.description}</p>
              <p className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                {t("dashboardPage.actions.openSection")}
                <ion-icon name="arrow-forward-outline" style={{ fontSize: "13px" }} />
              </p>
            </LLink>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {t("dashboardPage.summary.title")}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("dashboardPage.summary.description")}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                {t("dashboardPage.summary.baseTotal")}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
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
                    <p className="text-sm font-medium text-[var(--text-primary)]">{row.label}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {t("dashboardPage.summary.ofAllPosts", {
                        percentage: row.percentage,
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{row.value}</p>
                </div>

                <div className="h-2 rounded-full bg-[var(--bg-surface)]">
                  <div
                    className="h-2 rounded-full bg-[var(--accent)] transition-all duration-500"
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
