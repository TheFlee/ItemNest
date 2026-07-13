import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMyReports } from "../../api/reportApi";
import PageState from "../../components/common/PageState";
import type { ReportItem } from "../../types/report";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import {
  getReportReasonLabel,
  getReportStatusClassName,
  getReportStatusLabel,
} from "../../utils/report";

export default function MyReportsPage() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyReports();
        setReports(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadReports();
  }, []);

  const metrics = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((report) => report.status === 0).length,
      reviewed: reports.filter((report) => report.status !== 0).length,
    };
  }, [reports]);

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
      </div>
    );
  }

  if (errorMessage || reports.length === 0) {
    return (
      <PageState
        isLoading={false}
        errorMessage={errorMessage}
        isEmpty={!errorMessage && reports.length === 0}
        emptyMessage={t("myReportsPage.empty")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("myReportsPage.badge")}
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              <ion-icon name="flag-outline" style={{ fontSize: "32px" }} />
              {t("myReportsPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("myReportsPage.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
            >
              {t("myReportsPage.actions.backToDashboard")}
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
            >
              {t("myReportsPage.actions.browsePosts")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("myReportsPage.metrics.totalReports")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.total}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("myReportsPage.metrics.totalReportsDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("myReportsPage.metrics.pendingReview")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.pending}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("myReportsPage.metrics.pendingReviewDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {t("myReportsPage.metrics.reviewed")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.reviewed}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("myReportsPage.metrics.reviewedDescription")}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
          {t("myReportsPage.list.title")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t("myReportsPage.list.description")}
        </p>
      </section>

      <section className="grid gap-4">
        {reports.map((report) => (
          <article
            key={report.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {report.itemPostTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {t("myReportsPage.list.cardDescription")}
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

            <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("myReportsPage.list.reason")}
                </p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {getReportReasonLabel(report.reason)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("myReportsPage.list.createdAt")}
                </p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {formatDateTime(report.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("myReportsPage.list.reviewedAt")}
                </p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {report.reviewedAt ? formatDateTime(report.reviewedAt) : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("myReportsPage.list.status")}
                </p>
                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {getReportStatusLabel(report.status)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {t("myReportsPage.list.descriptionTitle")}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-primary)]">
                {report.description || t("myReportsPage.list.noDescription")}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/posts/${report.itemPostId}`}
                className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
              >
                {t("myReportsPage.actions.viewPost")}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
