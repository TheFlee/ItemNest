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

export default function PostDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const warningMessage = location.state?.warningMessage as string | undefined;
  const routeSuccessMessage = location.state?.successMessage as string | undefined;
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

  const stateBlock = (
    <PageState
      isLoading={isLoading}
      errorMessage={errorMessage}
      isEmpty={!isLoading && !errorMessage && !post}
      emptyMessage="Post not found."
    />
  );

  if (isLoading || errorMessage || !post) {
    return stateBlock;
  }

  const canMarkReturned = post.isOwner && post.status !== 1;
  const canClosePost = post.isOwner && post.status !== 2;
  const isOwnerActionBusy = statusSubmittingTo !== null || isDeletingPost;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to posts
        </Link>
      </div>

      {warningMessage && (
        <div className="rounded-lg bg-amber-100 px-4 py-3 text-amber-800">
          {warningMessage}
        </div>
      )}

      {routeSuccessMessage && (
        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
          {routeSuccessMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <PostImageGallery title={post.title} images={post.images} />

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{post.title}</h1>

              <div className="mt-3 flex flex-wrap gap-2">
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
            </div>

            {isAuthenticated && !post.isOwner && (
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={isFavoriteSubmitting}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  post.isFavorited
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-slate-800 hover:bg-slate-900"
                } disabled:opacity-60`}
              >
                {isFavoriteSubmitting
                  ? "Saving..."
                  : post.isFavorited
                  ? "Remove Favorite"
                  : "Add to Favorites"}
              </button>
            )}
          </div>

          {post.isOwner && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to={`/posts/${post.id}/edit`}
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit Post
              </Link>

              {canMarkReturned && (
                <button
                  type="button"
                  onClick={() => void handleUpdateStatus(1)}
                  disabled={isOwnerActionBusy}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {statusSubmittingTo === 1 ? "Saving..." : "Mark as Returned"}
                </button>
              )}

              {canClosePost && (
                <button
                  type="button"
                  onClick={() => void handleUpdateStatus(2)}
                  disabled={isOwnerActionBusy}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {statusSubmittingTo === 2 ? "Saving..." : "Close Post"}
                </button>
              )}

              <button
                type="button"
                onClick={() => void handleDeletePost()}
                disabled={isOwnerActionBusy}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {isDeletingPost ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-800">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">
              {post.description}
            </p>
          </div>

          <div className="mt-6">
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

          {isAuthenticated && !post.isOwner && (
            <div className="mt-6 space-y-4 border-t pt-6">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm((prev) => !prev);
                    setShowReportForm(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  {showReportForm ? "Close Report Form" : "Report Post"}
                </button>
              </div>

              {showContactForm && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Contact Request
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Send a message to the post owner. Contact details become visible
                    only after the request is accepted.
                  </p>

                  <div className="mt-4">
                    <FormTextarea
                      label="Message"
                      value={contactMessage}
                      onChange={setContactMessage}
                      placeholder="Write a short message for the post owner"
                      rows={4}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => void handleSendContactRequest()}
                      disabled={isContactSubmitting}
                      className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
                    >
                      {isContactSubmitting ? "Sending..." : "Submit Contact Request"}
                    </button>
                  </div>
                </div>
              )}

              {showReportForm && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <h2 className="text-lg font-semibold text-slate-800">Report Post</h2>

                  <div className="mt-4">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Reason
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(Number(e.target.value))}
                      className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
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

                  <div className="mt-4">
                    <FormTextarea
                      label="Description"
                      value={reportDescription}
                      onChange={setReportDescription}
                      placeholder="Add more details if needed"
                      rows={4}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => void handleSubmitReport()}
                      disabled={isReportSubmitting}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {isReportSubmitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Possible Matches</h2>
              <p className="mt-2 text-slate-600">
                Similar posts based on category, timing, location, color, and title.
              </p>
            </div>
          </div>

          {isMatchesLoading ? (
            <div className="mt-4 text-sm text-slate-500">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No possible matches were found for this post yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {match.images.length > 0 ? (
                        <img
                          src={buildFileUrl(match.images[0].imageUrl)}
                          alt={match.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-slate-800">
                        {match.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        Match Score: <span className="font-semibold">{match.matchScore}</span>
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {match.categoryName} • {formatDate(match.eventDate)}
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {match.description}
                      </p>
                    </div>
                  </div>

                  {match.matchReasons.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {match.matchReasons.map((reason, index) => (
                        <span
                          key={`${match.id}-${index}`}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      to={`/posts/${match.id}`}
                      className="text-sm font-medium text-slate-800 hover:text-slate-950"
                    >
                      View matched post →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}