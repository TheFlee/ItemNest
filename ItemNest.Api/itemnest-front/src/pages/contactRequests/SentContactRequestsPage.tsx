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
    setSuccessMessage("");
    setProcessingId(id);

    try {
      const updated = await cancelContactRequest(id);

      setRequests((prev) =>
        prev.map((request) => (request.id === id ? updated : request))
      );

      setSuccessMessage(t("contactRequestsPages.sent.messages.cancelled"));
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
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("contactRequestsPages.sent.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("contactRequestsPages.sent.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("contactRequestsPages.sent.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/favorites"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {t("contactRequestsPages.sent.actions.openFavorites")}
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("contactRequestsPages.sent.actions.backToDashboard")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("contactRequestsPages.sent.metrics.total")}
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
            <p className="text-sm font-medium text-slate-500">{t("contactRequest.cancelled")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.cancelled}
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
          {t("contactRequestsPages.sent.list.title")}
        </h2>
        <p className="text-sm text-slate-600">
          {t("contactRequestsPages.sent.list.description")}
        </p>
      </section>

      <section className="grid gap-4">
        {requests.map((request) => {
          const canCancel = request.status === 1;

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
                    {t("contactRequestsPages.sent.list.cardDescription")}
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
                    {t("contactRequestsPages.sent.fields.postOwner")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.postOwnerFullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("contactRequestsPages.sent.fields.createdAt")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {formatDateTime(request.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("contactRequestsPages.sent.fields.respondedAt")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.respondedAt ? formatDateTime(request.respondedAt) : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("contactRequestsPages.sent.fields.ownerEmail")}
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {request.status === 2 ? request.postOwnerEmail ?? "-" : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {t("contactRequestsPages.sent.fields.yourMessage")}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
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
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  {t("contactRequestsPages.common.viewPost")}
                </Link>

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => void handleCancel(request.id)}
                    disabled={processingId === request.id}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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