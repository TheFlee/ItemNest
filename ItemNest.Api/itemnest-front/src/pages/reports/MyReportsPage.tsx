import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  if (isLoading || errorMessage || reports.length === 0) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && reports.length === 0}
        emptyMessage="You have not submitted any reports yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Reports</h1>
        <p className="mt-2 text-slate-600">
          Review the reports you submitted for posts.
        </p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <div key={report.id} className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {report.itemPostTitle}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
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

            <div className="mt-4">
              <Link
                to={`/posts/${report.itemPostId}`}
                className="inline-flex rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
              >
                View Post
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}