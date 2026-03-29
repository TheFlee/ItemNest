import { useEffect, useState } from "react";
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
import {
  getContactRequestStatusClassName,
  getContactRequestStatusLabel,
} from "../../utils/contactRequest";

export default function ReceivedContactRequestsPage() {
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

      setSuccessMessage("Contact request was accepted successfully.");
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

      setSuccessMessage("Contact request was rejected successfully.");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading || errorMessage || requests.length === 0) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && requests.length === 0}
        emptyMessage="You have not received any contact requests yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Received Contact Requests
        </h1>
        <p className="mt-2 text-slate-600">
          Review and respond to requests from other users.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4">
        {requests.map((request) => {
          const isPending = request.status === 1;

          return (
            <div key={request.id} className="rounded-2xl bg-white p-5 shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {request.itemPostTitle}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Requester:</span>{" "}
                    {request.requesterFullName}
                  </p>
                  {request.requesterEmail && (
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Requester Email:</span>{" "}
                      {request.requesterEmail}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Created At:</span>{" "}
                    {formatDateTime(request.createdAt)}
                  </p>
                  {request.respondedAt && (
                    <p className="mt-1 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Responded At:</span>{" "}
                      {formatDateTime(request.respondedAt)}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${getContactRequestStatusClassName(
                    request.status
                  )}`}
                >
                  {getContactRequestStatusLabel(request.status)}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">
                  Request Message
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {request.message}
                </p>
              </div>

              {request.status === 2 && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                  <h3 className="text-sm font-semibold text-emerald-800">
                    Shared Contact Details
                  </h3>
                  <p className="mt-2 text-sm text-emerald-900">
                    Your contact details are now visible to the requester.
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={`/posts/${request.itemPostId}`}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
                >
                  View Post
                </Link>

                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleAccept(request.id)}
                      disabled={processingId === request.id}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {processingId === request.id ? "Processing..." : "Accept"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      {processingId === request.id ? "Processing..." : "Reject"}
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