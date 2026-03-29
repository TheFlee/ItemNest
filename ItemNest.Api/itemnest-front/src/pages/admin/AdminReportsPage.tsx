import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllReports, reviewReport } from "../../api/reportApi";
import PageState from "../../components/common/PageState";
import type { ReportItem } from "../../types/report";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import {
  getReportReasonLabel,
  getReportStatusClassName,
  getReportStatusLabel,
} from "../../utils/report";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

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
          ? "Report was marked as reviewed successfully."
          : "Report was rejected successfully."
      );
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading || errorMessage || reports.length === 0) {
    return (
      <div className="space-y-4">
        {successMessage && !isLoading && !errorMessage && (
          <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
            {successMessage}
          </div>
        )}

        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && reports.length === 0}
          emptyMessage="There are no reports in the system."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Reports</h1>
        <p className="mt-2 text-slate-600">
          Review and moderate reports submitted by users.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4">
        {reports.map((report) => {
          const isPending = report.status === 1;

          return (
            <div key={report.id} className="rounded-2xl bg-white p-5 shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {report.itemPostTitle}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Reporter:</span>{" "}
                    {report.reporterFullName}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Reason:</span>{" "}
                    {getReportReasonLabel(report.reason)}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Created At:</span>{" "}
                    {formatDateTime(report.createdAt)}
                  </p>

                  {report.reviewedAt && (
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Reviewed At:</span>{" "}
                      {formatDateTime(report.reviewedAt)}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getReportStatusClassName(
                    report.status
                  )}`}
                >
                  {getReportStatusLabel(report.status)}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Description</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {report.description || "No additional description was provided."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={`/posts/${report.itemPostId}`}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
                >
                  View Post
                </Link>

                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleReview(report.id, 2)}
                      disabled={processingId === report.id}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {processingId === report.id ? "Processing..." : "Mark Reviewed"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleReview(report.id, 3)}
                      disabled={processingId === report.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      {processingId === report.id ? "Processing..." : "Reject"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}