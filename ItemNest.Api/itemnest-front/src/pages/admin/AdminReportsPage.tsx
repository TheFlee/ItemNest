import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getAllReports, reviewReport } from "../../api/reportApi";
import PageState from "../../components/common/PageState";
import FormSelect from "../../components/forms/FormSelect";
import type { ReportItem } from "../../types/report";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import {
  getReportReasonLabel,
  getReportStatusClassName,
  getReportStatusLabel,
} from "../../utils/report";

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const reportStatusFilterOptions = useMemo(
    () => [
      { label: t("adminPages.reports.pending"), value: 1 },
      { label: t("adminPages.reports.reviewed"), value: 2 },
      { label: t("adminPages.reports.rejected"), value: 3 },
    ],
    [t]
  );

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getAllReports();
        setReports(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadReports();
  }, []);

  async function handleReview(id: string, status: number) {
    setErrorMessage("");
    setSuccessMessage("");
    setProcessingId(id);

    try {
      const updated = await reviewReport(id, { status });

      setReports((prev) =>
        prev.map((report) => (report.id === id ? updated : report))
      );

      setSuccessMessage(
        status === 2
          ? t("adminPages.reports.successReviewed")
          : t("adminPages.reports.successRejected")
      );
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  const metrics = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((report) => report.status === 1).length,
      reviewed: reports.filter((report) => report.status === 2).length,
      rejected: reports.filter((report) => report.status === 3).length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (statusFilter === "") {
      return reports;
    }

    return reports.filter((report) => report.status === Number(statusFilter));
  }, [reports, statusFilter]);

  if (isLoading || errorMessage || reports.length === 0) {
    return (
      <div className="space-y-4">
        {successMessage && !isLoading && !errorMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && reports.length === 0}
          emptyMessage={t("adminPages.reports.emptyMessage")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("adminPages.reports.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("adminPages.reports.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("adminPages.reports.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {t("adminPages.reports.backToDashboard")}
            </Link>

            <Link
              to="/admin/posts"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("adminPages.reports.openPosts")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("adminPages.reports.totalReports")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("adminPages.reports.pending")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("adminPages.reports.reviewed")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.reviewed}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">{t("adminPages.reports.rejected")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.rejected}
            </p>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t("adminPages.reports.filterTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("adminPages.reports.filterDescription")}
              </p>
            </div>

            <div className="w-full max-w-xs">
              <FormSelect
                label={t("adminPages.reports.statusLabel")}
                value={statusFilter}
                onChange={setStatusFilter}
                options={reportStatusFilterOptions}
                placeholder={t("adminPages.reports.allReports")}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStatusFilter("")}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("adminPages.reports.clearFilter")}
            </button>

            <p className="text-sm text-slate-500">
              {t("adminPages.reports.showing", {
                filtered: filteredReports.length,
                total: reports.length,
              })}
            </p>
          </div>
        </section>
      </section>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("adminPages.reports.submittedReports")}
        </h2>
        <p className="text-sm text-slate-600">
          {t("adminPages.reports.submittedDescription")}
        </p>
      </section>

      <section className="grid gap-4">
        {filteredReports.length === 0 ? (
          <PageState
            isLoading={false}
            errorMessage=""
            isEmpty
            emptyMessage={t("adminPages.reports.noMatch")}
          />
        ) : (
          filteredReports.map((report) => {
            const isPending = report.status === 1;
            const isProcessing = processingId === report.id;

            return (
              <article
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {report.itemPostTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {t("adminPages.reports.cardDescription")}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getReportStatusClassName(
                      report.status
                    )}`}
                  >
                    {getReportStatusLabel(report.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("adminPages.reports.reporter")}
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {report.reporterFullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("adminPages.reports.reason")}
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {getReportReasonLabel(report.reason)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("adminPages.reports.createdAt")}
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {formatDateTime(report.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {t("adminPages.reports.reviewedAt")}
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {report.reviewedAt ? formatDateTime(report.reviewedAt) : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t("adminPages.reports.descriptionTitle")}
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {report.description || t("adminPages.reports.noDescription")}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/posts/${report.itemPostId}`}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    {t("adminPages.reports.viewPost")}
                  </Link>

                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleReview(report.id, 2)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? t("adminPages.reports.processing") : t("adminPages.reports.markReviewed")}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleReview(report.id, 3)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? t("adminPages.reports.processing") : t("adminPages.reports.reject")}
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
