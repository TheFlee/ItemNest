import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { getReportReasonOptions } from "../../utils/options";
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
  const { t } = useTranslation();
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

  const reportReasonOptions = useMemo(() => getReportReasonOptions(), [t]);

  useEffect(() => {
    async function loadPost() {
      if (!id) {
        setErrorMessage(t("postDetails.errors.postIdMissing"));
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
  }, [id, t]);

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
        setSuccessMessage(t("postDetails.messages.removedFromFavorites"));
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
        setSuccessMessage(t("postDetails.messages.addedToFavorites"));
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
      setSuccessMessage(t("postDetails.messages.contactRequestSent"));
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
      setSuccessMessage(t("postDetails.messages.reportSubmitted"));
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
        ? t("postDetails.confirmations.markReturned")
        : t("postDetails.confirmations.closePost");

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
          ? t("postDetails.messages.markedReturned")
          : t("postDetails.messages.closed")
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

    const isConfirmed = window.confirm(t("postDetails.confirmations.deletePost"));

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
          successMessage: t("postDetails.messages.deleted"),
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
      t("common.unknown")
    );
  }, [reportReason, reportReasonOptions, t]);

  if (isLoading || errorMessage || !post) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && !post}
        emptyMessage={t("postDetails.empty.postNotFound")}
      />
    );
  }

  const canMarkReturned = post.isOwner && post.status !== 1;
  const canClosePost = post.isOwner && post.status !== 2;
  const isOwnerActionBusy = statusSubmittingTo !== null || isDeletingPost;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          {t("postDetails.backToPosts")}
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

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("postDetails.header.eyebrow")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
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

              <span className="rounded-full bg-[var(--bg-surface)] px-3 py-1 text-sm font-medium text-[var(--text-primary)]">
                {getPostStatusLabel(post.status)}
              </span>

              {post.isOwner && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  {t("postDetails.badges.myPost")}
                </span>
              )}

              {post.isFavorited && !post.isOwner && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                  {t("postDetails.badges.favorited")}
                </span>
              )}
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("postDetails.header.description")}
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
                  : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
              }`}
            >
              {isFavoriteSubmitting
                ? t("common.saving")
                : post.isFavorited
                ? t("postDetails.actions.removeFavorite")
                : t("postDetails.actions.addToFavorites")}
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <PostImageGallery title={post.title} images={post.images} />

        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="border-b border-[var(--border)] pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {t("postDetails.sections.description.title")}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("postDetails.sections.description.subtitle")}
              </p>
            </div>

            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)] sm:text-base">
              {post.description}
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
            <div className="border-b border-[var(--border)] pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {t("postDetails.sections.information.title")}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("postDetails.sections.information.subtitle")}
              </p>
            </div>

            <div className="mt-4">
              <DetailRow label={t("postDetails.fields.category")} value={post.categoryName} />
              <DetailRow label={t("postDetails.fields.location")} value={post.location} />
              <DetailRow
                label={t("postDetails.fields.color")}
                value={getItemColorLabel(post.color)}
              />
              <DetailRow
                label={t("postDetails.fields.eventDate")}
                value={formatDate(post.eventDate)}
              />
              <DetailRow
                label={t("postDetails.fields.postedBy")}
                value={post.userFullName}
              />
              <DetailRow
                label={t("postDetails.fields.createdAt")}
                value={formatDateTime(post.createdAt)}
              />
              {post.updatedAt && (
                <DetailRow
                  label={t("postDetails.fields.updatedAt")}
                  value={formatDateTime(post.updatedAt)}
                />
              )}
            </div>
          </section>

          {post.isOwner && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
              <div className="border-b border-[var(--border)] pb-5">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {t("postDetails.sections.ownerActions.title")}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {t("postDetails.sections.ownerActions.subtitle")}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/posts/${post.id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  {t("postDetails.actions.editPost")}
                </Link>

                {canMarkReturned && (
                  <button
                    type="button"
                    onClick={() => void handleUpdateStatus(1)}
                    disabled={isOwnerActionBusy}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {statusSubmittingTo === 1
                      ? t("common.saving")
                      : t("postDetails.actions.markAsReturned")}
                  </button>
                )}

                {canClosePost && (
                  <button
                    type="button"
                    onClick={() => void handleUpdateStatus(2)}
                    disabled={isOwnerActionBusy}
                    className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {statusSubmittingTo === 2
                      ? t("common.saving")
                      : t("postDetails.actions.closePost")}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => void handleDeletePost()}
                  disabled={isOwnerActionBusy}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeletingPost
                    ? t("common.deleting")
                    : t("postDetails.actions.deletePost")}
                </button>
              </div>
            </section>
          )}

          {isAuthenticated && !post.isOwner && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
              <div className="border-b border-[var(--border)] pb-5">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {t("postDetails.sections.actions.title")}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {t("postDetails.sections.actions.subtitle")}
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
                  {showContactForm
                    ? t("postDetails.actions.closeContactForm")
                    : t("postDetails.actions.sendContactRequest")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowReportForm((prev) => !prev);
                    setShowContactForm(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  {showReportForm
                    ? t("postDetails.actions.closeReportForm")
                    : t("postDetails.actions.reportPost")}
                </button>
              </div>

              {showContactForm && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    {t("postDetails.contactForm.title")}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    {t("postDetails.contactForm.subtitle")}
                  </p>

                  <div className="mt-5">
                    <FormTextarea
                      label={t("postDetails.contactForm.messageLabel")}
                      value={contactMessage}
                      onChange={setContactMessage}
                      placeholder={t("postDetails.contactForm.messagePlaceholder")}
                      rows={4}
                    />
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => void handleSendContactRequest()}
                      disabled={isContactSubmitting}
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isContactSubmitting
                        ? t("common.sending")
                        : t("postDetails.contactForm.submit")}
                    </button>
                  </div>
                </div>
              )}

              {showReportForm && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    {t("postDetails.reportForm.title")}
                  </h3>

                  <div className="mt-5">
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                      {t("postDetails.reportForm.reasonLabel")}
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(Number(e.target.value))}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {reportReasonOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-[var(--text-secondary)]">
                      {t("postDetails.reportForm.selectedReason", {
                        reason: reportReasonLabel,
                      })}
                    </p>
                  </div>

                  <div className="mt-5">
                    <FormTextarea
                      label={t("postDetails.reportForm.descriptionLabel")}
                      value={reportDescription}
                      onChange={setReportDescription}
                      placeholder={t("postDetails.reportForm.descriptionPlaceholder")}
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
                      {isReportSubmitting
                        ? t("common.submitting")
                        : t("postDetails.reportForm.submit")}
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
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {t("postDetails.matches.title")}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("postDetails.matches.subtitle")}
              </p>
            </div>
          </div>

          {isMatchesLoading ? (
            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {t("postDetails.matches.loading")}
            </div>
          ) : matches.length === 0 ? (
            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {t("postDetails.matches.empty")}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {matches.map((match) => (
                <article
                  key={match.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]"
                >
                  <div className="relative h-48 bg-[var(--bg-surface)]">
                    {match.images.length > 0 ? (
                      <img
                        src={buildFileUrl(match.images[0].imageUrl)}
                        alt={match.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
                        {t("common.noImage")}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                          {match.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                          {match.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                        {t("postDetails.matches.score")}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-[var(--bg-surface)]">
                          <div
                            className="h-2 rounded-full bg-[var(--accent)] transition-all"
                            style={{ width: getMatchScoreWidth(match.matchScore) }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{Math.round(match.matchScore)}</span>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                          {t("postDetails.fields.category")}
                        </p>
                        <p className="mt-1 font-medium text-[var(--text-primary)]">{match.categoryName}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                          {t("postDetails.fields.location")}
                        </p>
                        <p className="mt-1 font-medium text-[var(--text-primary)]">{match.location}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                          {t("postDetails.fields.eventDate")}
                        </p>
                        <p className="mt-1 font-medium text-[var(--text-primary)]">
                          {formatDate(match.eventDate)}
                        </p>
                      </div>
                    </div>

                    {match.matchReasons.length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {t("postDetails.matches.matchReasons")}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {match.matchReasons.map((reason, index) => (
                            <span
                              key={`${match.id}-${index}-${reason}`}
                              className="rounded-full bg-[var(--bg-surface)] px-3 py-1 text-xs font-medium text-[var(--text-primary)]"
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
                        className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--text-secondary)]"
                      >
                        {t("postDetails.matches.viewMatchedPost")}
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
