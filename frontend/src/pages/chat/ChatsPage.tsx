import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getUserChats } from "../../api/chatApi";
import { LLink } from "../../components/common/LLink";
import PageState from "../../components/common/PageState";
import { useAuth } from "../../context/AuthContext";
import { useLangNavigate } from "../../hooks/useLangPath";
import type { ChatItem } from "../../types/chat";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ChatsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useLangNavigate();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadChats() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await getUserChats();
        setChats(data);
      } catch (error: unknown) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadChats();
  }, [user]);

  if (isLoading) {
    return <PageState isLoading />;
  }

  if (errorMessage) {
    return <PageState errorMessage={errorMessage} />;
  }

  if (chats.length === 0) {
    return <PageState isEmpty emptyMessage={t("chatsPage.empty")} />;
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("chatsPage.badge")}
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              <ion-icon name="chatbubbles-outline" style={{ fontSize: "32px" }} />
              {t("chatsPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("chatsPage.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <LLink
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
            >
              {t("chatsPage.actions.backToDashboard")}
            </LLink>
          </div>
        </div>

        {/* Stat card */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("chatsPage.cards.conversations")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {chats.length}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("chatsPage.cards.conversationsDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* List header */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {t("chatsPage.list.title")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t("chatsPage.list.description")}
        </p>
      </section>

      {/* Conversation cards */}
      <section className="grid gap-3">
        {chats.map((chat) => (
          <article
            key={chat.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/chats/${chat.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(`/chats/${chat.id}`);
            }}
            className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-surface)]"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: user + post + message */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-base font-semibold text-[var(--text-primary)]">
                    {chat.otherUserFullName}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>

                {/* Post title link — stops propagation so clicking it doesn't open the chat */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="mt-1"
                >
                  <LLink
                    to={`/posts/${chat.itemPostSlug}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    {chat.itemPostTitle}
                  </LLink>
                </div>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {chat.lastMessage
                    ? truncate(chat.lastMessage, 60)
                    : t("chatsPage.list.noMessages")}
                </p>
              </div>

              {/* Right: timestamp */}
              <div className="shrink-0 text-right">
                <p className="text-xs text-[var(--text-secondary)]">
                  {formatDateTime(chat.lastMessageAt ?? chat.createdAt)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
