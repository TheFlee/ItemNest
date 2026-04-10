import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  acceptContactRequest,
  getReceivedContactRequests,
  rejectContactRequest,
} from "../../api/contactRequestApi";
import PageState from "../../components/common/PageState";
import type { ContactRequestItem } from "../../types/contactRequest";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import { getContactRequestStatusClassName } from "../../utils/contactRequest";

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

export default function ReceivedContactRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ContactRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getReceivedContactRequests();
        setRequests(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadRequests();
  }, []);

  async function handleAccept(id: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setProcessingId(id);

    try {
      const updated = await acceptContactRequest(id);

      setRequests((prev) =>
        prev.map((request) => (request.id === id ? updated : request))
      );

      setSuccessMessage(t("contactRequestsPages.received.messages.accepted"));
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setProcessingId(id);

    try {
      const updated = await rejectContactRequest(id);

      setRequests((prev) =>
        prev.map((request) => (request.id === id ? updated : request))
      );

      setSuccessMessage(t("contactRequestsPages.received.messages.rejected"));
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
      rejected: requests.filter((request) => request.status === 3).length,
    };
  }, [requests]);

  if (isLoading || errorMessage || requests.length === 0) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && requests.length === 0}
        emptyMessage={t("contactRequestsPages.received.empty")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("contactRequestsPages.received.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("contactRequestsPages.received.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("contactRequestsPages.received.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/my-posts"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {t("contactRequestsPages.received.actions.openMyPosts")}
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("contactRequestsPages.received.actions.backToDashboard")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("contactRequestsPages.received.metrics.total")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("contactRequest.pending")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("contactRequest.accepted")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.accepted}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("contactRequest.rejected")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.rejected}
            </p>
          </div>
        </div>
      </section>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("contactRequestsPages.received.list.title")}
        </h2>
        <p className="text-sm text-slate-600">
          {t("contactRequestsPages.received.list.description")}
        </p>
      </section>

      <section className="grid gap-4">
        {requests.map((request) => {
          const isPending = request.status === 1;

          return (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {request.itemPostTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t("contactRequestsPages.received.list.cardDescription")}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getContactRequestStatusClassName(
                    request.status
                  )}`}
                >
                  {t(getContactRequestStatusTranslationKey(request.status))}
                </span>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("contactRequestsPages.received.fields.requester")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.requesterFullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("contactRequestsPages.received.fields.requesterEmail")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.requesterEmail ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("contactRequestsPages.received.fields.createdAt")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {formatDateTime(request.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("contactRequestsPages.received.fields.respondedAt")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.respondedAt ? formatDateTime(request.respondedAt) : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {t("contactRequestsPages.received.fields.requestMessage")}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {request.message}
                </p>
              </div>

              {request.status === 2 && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {t("contactRequestsPages.received.sharedContact.title")}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    {t("contactRequestsPages.received.sharedContact.description")}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/posts/${request.itemPostId}`}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  {t("contactRequestsPages.common.viewPost")}
                </Link>

                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleAccept(request.id)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processingId === request.id
                        ? t("contactRequestsPages.common.processing")
                        : t("contactRequestsPages.received.actions.accept")}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processingId === request.id
                        ? t("contactRequestsPages.common.processing")
                        : t("contactRequestsPages.received.actions.reject")}
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}