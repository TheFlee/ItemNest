import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  cancelContactRequest,
  getSentContactRequests,
} from "../../api/contactRequestApi";
import PageState from "../../components/common/PageState";
import type { ContactRequestItem } from "../../types/contactRequest";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import { getContactRequestStatusClassName } from "../../utils/contactRequest";
import { useToast } from "../../context/ToastContext";

const statusIconMap: Record<number, string> = {
  1: "time-outline",
  2: "checkmark-circle-outline",
  3: "close-circle-outline",
  4: "ban-outline",
};

function getContactRequestStatusTranslationKey(status: number) {
  switch (status) {
    case 1:
      return "contactRequest.pending";
    case 2:
      return "contactRequest.accepted";
    case 3:
      return "contactRequest.rejected";
    case 4:
      return "contactRequest.cancelled";
    default:
      return "common.unknown";
  }
}

export default function SentContactRequestsPage() {
  const { t } = useTranslation();
  const { show } = useToast();
  const [requests, setRequests] = useState<ContactRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getSentContactRequests();
        setRequests(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadRequests();
  }, []);

  async function handleCancel(id: string) {
    setErrorMessage("");
    setProcessingId(id);

    try {
      const updated = await cancelContactRequest(id);

      setRequests((prev) =>
        prev.map((request) => (request.id === id ? updated : request))
      );

      show(t("contactRequestsPages.sent.messages.cancelled"), "success");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  const metrics = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === 1).length,
      accepted: requests.filter((request) => request.status === 2).length,
      cancelled: requests.filter((request) => request.status === 4).length,
    };
  }, [requests]);

  if (isLoading || errorMessage || requests.length === 0) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && requests.length === 0}
        emptyMessage={t("contactRequestsPages.sent.empty")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("contactRequestsPages.sent.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              {t("contactRequestsPages.sent.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("contactRequestsPages.sent.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/favorites"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
            >
              {t("contactRequestsPages.sent.actions.openFavorites")}
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
            >
              {t("contactRequestsPages.sent.actions.backToDashboard")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("contactRequestsPages.sent.metrics.total")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("contactRequest.pending")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("contactRequest.accepted")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.accepted}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("contactRequest.cancelled")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.cancelled}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {t("contactRequestsPages.sent.list.title")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t("contactRequestsPages.sent.list.description")}
        </p>
      </section>

      <section className="grid gap-4">
        {requests.map((request) => {
          const canCancel = request.status === 1;

          return (
            <article
              key={request.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                    {request.itemPostTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {t("contactRequestsPages.sent.list.cardDescription")}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getContactRequestStatusClassName(
                    request.status
                  )}`}
                >
                  <ion-icon name={statusIconMap[request.status] ?? "help-outline"} style={{ fontSize: "12px" }} />
                  {t(getContactRequestStatusTranslationKey(request.status))}
                </span>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {t("contactRequestsPages.sent.fields.postOwner")}
                  </p>
                  <p className="mt-1 font-medium text-[var(--text-primary)]">
                    {request.postOwnerFullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {t("contactRequestsPages.sent.fields.createdAt")}
                  </p>
                  <p className="mt-1 font-medium text-[var(--text-primary)]">
                    {formatDateTime(request.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {t("contactRequestsPages.sent.fields.respondedAt")}
                  </p>
                  <p className="mt-1 font-medium text-[var(--text-primary)]">
                    {request.respondedAt ? formatDateTime(request.respondedAt) : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {t("contactRequestsPages.sent.fields.ownerEmail")}
                  </p>
                  <p className="mt-1 font-medium text-[var(--text-primary)]">
                    {request.status === 2 ? request.postOwnerEmail ?? "-" : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  {t("contactRequestsPages.sent.fields.yourMessage")}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-primary)]">
                  {request.message}
                </p>
              </div>

              {request.status === 2 &&
                (request.postOwnerEmail || request.postOwnerFullName) && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {t("contactRequestsPages.sent.ownerContact.title")}
                    </h3>
                    <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                      <div>
                        <p className="font-medium text-emerald-900">
                          {t("contactRequestsPages.sent.ownerContact.name")}
                        </p>
                        <p className="mt-1 text-emerald-900">{request.postOwnerFullName}</p>
                      </div>

                      <div>
                        <p className="font-medium text-emerald-900">
                          {t("contactRequestsPages.sent.ownerContact.email")}
                        </p>
                        <p className="mt-1 text-emerald-900">
                          {request.postOwnerEmail ?? "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/posts/${request.itemPostId}`}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
                >
                  {t("contactRequestsPages.common.viewPost")}
                </Link>

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => void handleCancel(request.id)}
                    disabled={processingId === request.id}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processingId === request.id
                      ? t("contactRequestsPages.sent.actions.cancelling")
                      : t("contactRequestsPages.sent.actions.cancel")}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
