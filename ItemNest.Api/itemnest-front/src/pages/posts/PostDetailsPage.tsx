import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createContactRequest } from "../../api/contactRequestApi";
import { addFavorite, removeFavorite } from "../../api/favoriteApi";
import {
  deletePost,
  getPostById,
  getPostMatches,
  updatePost,
} from "../../api/itemPostApi";
import { createReport } from "../../api/reportApi";
import DetailRow from "../../components/common/DetailRow";
import PageState from "../../components/common/PageState";
import FormTextarea from "../../components/forms/FormTextarea";
import PostImageGallery from "../../components/posts/PostImageGallery";
import PostImageManager from "../../components/posts/PostImageManager";
import { useAuth } from "../../context/AuthContext";
import type { ItemPost, MatchedItemPost, UpdatePostRequest } from "../../types/post";
import { buildFileUrl } from "../../utils/api";
import { getApiErrorMessage } from "../../utils/error";
import { formatDate, formatDateTime } from "../../utils/format";
import { reportReasonOptions } from "../../utils/options";
import {
  getItemColorLabel,
  getPostStatusLabel,
  getPostTypeLabel,
} from "../../utils/post";

interface LocationState {
  warningMessage?: string;
  successMessage?: string;
}

function getMatchScoreWidth(score: number) {
  return `${Math.max(0, Math.min(100, Math.round(score)))}%`;
}

export default function PostDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state ?? {}) as LocationState;
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState<ItemPost | null>(null);
  const [matches, setMatches] = useState<MatchedItemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [statusSubmittingTo, setStatusSubmittingTo] = useState<number | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [contactMessage, setContactMessage] = useState("");
  const [reportReason, setReportReason] = useState<number>(1);
  const [reportDescription, setReportDescription] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    async function loadPost() {
      if (!id) {
        setErrorMessage("Post id was not provided.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPost();
  }, [id]);

  useEffect(() => {
    async function loadMatches() {
      if (!id || !isAuthenticated) {
        setMatches([]);
        return;
      }

      setIsMatchesLoading(true);

      try {
        const data = await getPostMatches(id);
        setMatches(data);
      } catch {
        setMatches([]);
      } finally {
        setIsMatchesLoading(false);
      }
    }

    void loadMatches();
  }, [id, isAuthenticated]);

  function handleImagesChanged(updatedImages: ItemPost["images"]) {
    setPost((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        images: updatedImages,
        primaryImageUrl: updatedImages[0]?.imageUrl ?? "",
      };
    });
  }

  function buildUpdateRequest(nextStatus: number): UpdatePostRequest | null {
    if (!post) {
      return null;
    }

    return {
      title: post.title,
      description: post.description,
      color: post.color,
      location: post.location,
      eventDate: post.eventDate,
      categoryId: post.categoryId,
      status: nextStatus,
    };
  }

  async function handleFavoriteToggle() {
    if (!post || !isAuthenticated || post.isOwner) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsFavoriteSubmitting(true);

    try {
      if (post.isFavorited) {
        await removeFavorite(post.id);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                isFavorited: false,
              }
            : prev
        );
        setSuccessMessage("Post was removed from favorites.");
      } else {
        await addFavorite(post.id);
        setPost((prev) =>
          prev
            ? {
                ...prev,
                isFavorited: true,
              }
            : prev
        );
        setSuccessMessage("Post was added to favorites.");
      }
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsFavoriteSubmitting(false);
    }
  }

  async function handleSendContactRequest() {
    if (!post) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsContactSubmitting(true);

    try {
      await createContactRequest({
        itemPostId: post.id,
        message: contactMessage.trim(),
      });

      setContactMessage("");
      setShowContactForm(false);
      setSuccessMessage("Contact request was sent successfully.");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsContactSubmitting(false);
    }
  }

  async function handleSubmitReport() {
    if (!post) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsReportSubmitting(true);

    try {
      await createReport({
        itemPostId: post.id,
        reason: reportReason,
        description: reportDescription.trim(),
      });

      setReportDescription("");
      setReportReason(1);
      setShowReportForm(false);
      setSuccessMessage("Report was submitted successfully.");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsReportSubmitting(false);
    }
  }

  async function handleUpdateStatus(nextStatus: number) {
    if (!post || !post.isOwner) {
      return;
    }

    const request = buildUpdateRequest(nextStatus);
    if (!request) {
      return;
    }

    const confirmMessage =
      nextStatus === 1
        ? "Are you sure you want to mark this post as returned?"
        : "Are you sure you want to close this post?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setStatusSubmittingTo(nextStatus);

    try {
      const updatedPost = await updatePost(post.id, request);
      setPost(updatedPost);
      setSuccessMessage(
        nextStatus === 1
          ? "Post was marked as returned successfully."
          : "Post was closed successfully."
      );
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setStatusSubmittingTo(null);
    }
  }

  async function handleDeletePost() {
    if (!post || !post.isOwner) {
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!isConfirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsDeletingPost(true);

    try {
      await deletePost(post.id);

      navigate("/my-posts", {
        replace: true,
        state: {
          successMessage: "Post was deleted successfully.",
        },
      });
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
      setIsDeletingPost(false);
    }
  }

  const reportReasonLabel = useMemo(() => {
    return (
      reportReasonOptions.find((option) => option.value === reportReason)?.label ??
      "Unknown"
    );
  }, [reportReason]);

  if (isLoading || errorMessage || !post) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && !post}
        emptyMessage="Post not found."
      />
    );
  }

  const canMarkReturned = post.isOwner && post.status !== 1;
  const canClosePost = post.isOwner && post.status !== 2;
  const isOwnerActionBusy = statusSubmittingTo !== null || isDeletingPost;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to posts
        </Link>
      </div>

      {routeState.warningMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {routeState.warningMessage}
        </div>
      )}

      {routeState.successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {routeState.successMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Post details
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  post.type === 0
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {getPostTypeLabel(post.type)}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {getPostStatusLabel(post.status)}
              </span>

              {post.isOwner && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  My Post
                </span>
              )}

              {post.isFavorited && !post.isOwner && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                  Favorited
                </span>
              )}
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Review the full post information, related images, possible matches, and
              available actions.
            </p>
          </div>

          {isAuthenticated && !post.isOwner && (
            <button
              type="button"
              onClick={handleFavoriteToggle}
              disabled={isFavoriteSubmitting}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                post.isFavorited
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {isFavoriteSubmitting
                ? "Saving..."
                : post.isFavorited
                ? "Remove Favorite"
                : "Add to Favorites"}
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <PostImageGallery title={post.title} images={post.images} />

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Description
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Main information shared by the post owner.
              </p>
            </div>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-base">
              {post.description}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Post information
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Structured item details and timeline information.
              </p>
            </div>

            <div className="mt-4">
              <DetailRow label="Category" value={post.categoryName} />
              <DetailRow label="Location" value={post.location} />
              <DetailRow label="Color" value={getItemColorLabel(post.color)} />
              <DetailRow label="Event Date" value={formatDate(post.eventDate)} />
              <DetailRow label="Posted By" value={post.userFullName} />
              <DetailRow label="Created At" value={formatDateTime(post.createdAt)} />
              {post.updatedAt && (
                <DetailRow label="Updated At" value={formatDateTime(post.updatedAt)} />
              )}
            </div>
          </section>

          {post.isOwner && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-200 pb-5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Owner actions
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Manage this post, update its status, or remove it.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/posts/${post.id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Edit Post
                </Link>

                {canMarkReturned && (
                  <button
                    type="button"
                    onClick={() => void handleUpdateStatus(1)}
                    disabled={isOwnerActionBusy}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {statusSubmittingTo === 1 ? "Saving..." : "Mark as Returned"}
                  </button>
                )}

                {canClosePost && (
                  <button
                    type="button"
                    onClick={() => void handleUpdateStatus(2)}
                    disabled={isOwnerActionBusy}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {statusSubmittingTo === 2 ? "Saving..." : "Close Post"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => void handleDeletePost()}
                  disabled={isOwnerActionBusy}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingPost ? "Deleting..." : "Delete Post"}
                </button>
              </div>
            </section>
          )}

          {isAuthenticated && !post.isOwner && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-200 pb-5">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Actions
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Contact the owner or report this post if necessary.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm((prev) => !prev);
                    setShowReportForm(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  {showContactForm ? "Close Contact Form" : "Send Contact Request"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowReportForm((prev) => !prev);
                    setShowContactForm(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  {showReportForm ? "Close Report Form" : "Report Post"}
                </button>
              </div>

              {showContactForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    Contact Request
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Send a short message to the post owner. Contact details become
                    visible only after the request is accepted.
                  </p>

                  <div className="mt-5">
                    <FormTextarea
                      label="Message"
                      value={contactMessage}
                      onChange={setContactMessage}
                      placeholder="Write a short message for the post owner"
                      rows={4}
                    />
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => void handleSendContactRequest()}
                      disabled={isContactSubmitting}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isContactSubmitting ? "Sending..." : "Submit Contact Request"}
                    </button>
                  </div>
                </div>
              )}

              {showReportForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    Report Post
                  </h3>

                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Reason
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
                    >
                      {reportReasonOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-slate-500">
                      Selected reason: {reportReasonLabel}
                    </p>
                  </div>

                  <div className="mt-5">
                    <FormTextarea
                      label="Description"
                      value={reportDescription}
                      onChange={setReportDescription}
                      placeholder="Add more details if needed"
                      rows={4}
                    />
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => void handleSubmitReport()}
                      disabled={isReportSubmitting}
                      className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isReportSubmitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {post.isOwner && (
        <PostImageManager
          itemPostId={post.id}
          images={post.images}
          onImagesChanged={handleImagesChanged}
        />
      )}

      {isAuthenticated && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Possible Matches
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Similar posts based on category, timing, location, color, and title.
              </p>
            </div>
          </div>

          {isMatchesLoading ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Loading matches...
            </div>
          ) : matches.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No matches found for this post yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {matches.map((match) => (
                <article
                  key={match.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <div className="relative h-48 bg-slate-100">
                    {match.images.length > 0 ? (
                      <img
                        src={buildFileUrl(match.images[0].imageUrl)}
                        alt={match.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                          {match.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {match.description}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                          Score
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {Math.round(match.matchScore)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2.5 rounded-full bg-white">
                      <div
                        className="h-2.5 rounded-full bg-slate-900"
                        style={{ width: getMatchScoreWidth(match.matchScore) }}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Category
                        </p>
                        <p className="mt-1 font-medium text-slate-700">{match.categoryName}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Location
                        </p>
                        <p className="mt-1 font-medium text-slate-700">{match.location}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Event Date
                        </p>
                        <p className="mt-1 font-medium text-slate-700">
                          {formatDate(match.eventDate)}
                        </p>
                      </div>
                    </div>

                    {match.matchReasons.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-medium text-slate-800">Match reasons</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {match.matchReasons.map((reason, index) => (
                            <span
                              key={`${match.id}-${index}-${reason}`}
                              className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5">
                      <Link
                        to={`/posts/${match.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-slate-700"
                      >
                        View matched post →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}