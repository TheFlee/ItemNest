import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { LLink } from "../../components/common/LLink";
import { useLangNavigate } from "../../hooks/useLangPath";
import { getOrCreateChat } from "../../api/chatApi";
import { addFavorite, removeFavorite } from "../../api/favoriteApi";
import { deletePost, getPostBySlug, getPostMatches, updatePost } from "../../api/itemPostApi";
import { createReport } from "../../api/reportApi";
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
import { getItemColorLabel, getPostStatusLabel, getPostTypeLabel } from "../../utils/post";

const itemColorMap: Record<number, string> = {
  0: "#94a3b8", 1: "#1a1814", 2: "#f0ede8", 3: "#94a3b8",
  4: "#3b82f6", 5: "#ef4444", 6: "#22c55e", 7: "#eab308",
  8: "#92400e", 9: "#ec4899", 10: "#a855f7", 11: "#f97316",
  12: "#c8c8c8", 13: "#ca8a04",
};

interface LocationState {
  warningMessage?: string;
  successMessage?: string;
}

export default function PostDetailsPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const location = useLocation();
  const langNavigate = useLangNavigate();
  const routeState = (location.state ?? {}) as LocationState;
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState<ItemPost | null>(null);
  const [matches, setMatches] = useState<MatchedItemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const [isChatStarting, setIsChatStarting] = useState(false);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [statusSubmittingTo, setStatusSubmittingTo] = useState<number | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reportReason, setReportReason] = useState<number>(1);
  const [reportDescription, setReportDescription] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);

  const reportReasonOptions = useMemo(() => getReportReasonOptions(), [t]);

  useEffect(() => {
    async function loadPost() {
      if (!slug) { setErrorMessage(t("postDetails.errors.postIdMissing")); setIsLoading(false); return; }
      setIsLoading(true); setErrorMessage(""); setSuccessMessage("");
      try { setPost(await getPostBySlug(slug)); }
      catch (error: any) { setErrorMessage(getApiErrorMessage(error)); }
      finally { setIsLoading(false); }
    }
    void loadPost();
  }, [slug, t]);

  useEffect(() => {
    async function loadMatches() {
      if (!post?.id || !isAuthenticated) { setMatches([]); return; }
      setIsMatchesLoading(true);
      try { setMatches(await getPostMatches(post.id)); }
      catch { setMatches([]); }
      finally { setIsMatchesLoading(false); }
    }
    void loadMatches();
  }, [post?.id, isAuthenticated]);

  function handleImagesChanged(updatedImages: ItemPost["images"]) {
    setPost((prev) => prev ? { ...prev, images: updatedImages, primaryImageUrl: updatedImages[0]?.imageUrl ?? "" } : prev);
  }

  function buildUpdateRequest(nextStatus: number): UpdatePostRequest | null {
    if (!post) return null;
    return { title: post.title, description: post.description, color: post.color, location: post.location, eventDate: post.eventDate, categoryId: post.categoryId, status: nextStatus };
  }

  async function handleFavoriteToggle() {
    if (!post || !isAuthenticated || post.isOwner) return;
    setErrorMessage(""); setSuccessMessage(""); setIsFavoriteSubmitting(true);
    try {
      if (post.isFavorited) {
        await removeFavorite(post.id);
        setPost((prev) => prev ? { ...prev, isFavorited: false } : prev);
        setSuccessMessage(t("postDetails.messages.removedFromFavorites"));
      } else {
        await addFavorite(post.id);
        setPost((prev) => prev ? { ...prev, isFavorited: true } : prev);
        setSuccessMessage(t("postDetails.messages.addedToFavorites"));
      }
    } catch (error: any) { setErrorMessage(getApiErrorMessage(error)); }
    finally { setIsFavoriteSubmitting(false); }
  }

  async function handleChat() {
    if (!post) return;
    setErrorMessage(""); setIsChatStarting(true);
    try {
      const chat = await getOrCreateChat(post.id);
      langNavigate(`/chats/${chat.id}`);
    } catch (error: any) { setErrorMessage(getApiErrorMessage(error)); }
    finally { setIsChatStarting(false); }
  }

  async function handleSubmitReport() {
    if (!post) return;
    setErrorMessage(""); setSuccessMessage(""); setIsReportSubmitting(true);
    try {
      await createReport({ itemPostId: post.id, reason: reportReason, description: reportDescription.trim() });
      setReportDescription(""); setReportReason(1); setShowReportForm(false);
      setSuccessMessage(t("postDetails.messages.reportSubmitted"));
    } catch (error: any) { setErrorMessage(getApiErrorMessage(error)); }
    finally { setIsReportSubmitting(false); }
  }

  async function handleUpdateStatus(nextStatus: number) {
    if (!post || !post.isOwner) return;
    const request = buildUpdateRequest(nextStatus);
    if (!request) return;
    const confirmMsg = nextStatus === 1 ? t("postDetails.confirmations.markReturned") : t("postDetails.confirmations.closePost");
    if (!window.confirm(confirmMsg)) return;
    setErrorMessage(""); setSuccessMessage(""); setStatusSubmittingTo(nextStatus);
    try {
      setPost(await updatePost(post.id, request));
      setSuccessMessage(nextStatus === 1 ? t("postDetails.messages.markedReturned") : t("postDetails.messages.closed"));
    } catch (error: any) { setErrorMessage(getApiErrorMessage(error)); }
    finally { setStatusSubmittingTo(null); }
  }

  async function handleDeletePost() {
    if (!post || !post.isOwner) return;
    if (!window.confirm(t("postDetails.confirmations.deletePost"))) return;
    setErrorMessage(""); setSuccessMessage(""); setIsDeletingPost(true);
    try {
      await deletePost(post.id);
      langNavigate("/my-posts", { replace: true, state: { successMessage: t("postDetails.messages.deleted") } });
    } catch (error: any) { setErrorMessage(getApiErrorMessage(error)); setIsDeletingPost(false); }
  }

  const reportReasonLabel = useMemo(
    () => reportReasonOptions.find((o) => o.value === reportReason)?.label ?? t("common.unknown"),
    [reportReason, reportReasonOptions, t]
  );

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

  const isLost = post.type === 0;
  const typeColor = isLost ? "var(--accent)" : "var(--success)";
  const statusDot = post.status === 0 ? "#4ade80" : post.status === 1 ? "#60a5fa" : "#94a3b8";
  const canMarkReturned = post.isOwner && post.status !== 1;
  const canClosePost = post.isOwner && post.status !== 2;
  const isOwnerBusy = statusSubmittingTo !== null || isDeletingPost;

  const btnBase = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60";

  const ogImage = post.primaryImageUrl ? buildFileUrl(post.primaryImageUrl) : undefined;
  const metaDescription = post.description.slice(0, 160);

  return (
    <div className="space-y-6">
      <title>{post.title} | ItemNest</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={`${post.title} | ItemNest`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="article" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <link rel="canonical" href={window.location.href} />

      {/* Back link */}
      <LLink
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ion-icon name="arrow-back-outline" style={{ fontSize: "14px" }} />
        {t("postDetails.backToPosts")}
      </LLink>

      {/* Banners */}
      {routeState.warningMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {routeState.warningMessage}
        </div>
      )}
      {(routeState.successMessage || successMessage) && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {routeState.successMessage || successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* ── Hero card ──────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">

          {/* Left — gallery, fills column edge-to-edge */}
          <div className="border-b border-[var(--border)] lg:border-b-0 lg:border-r lg:border-[var(--border)]">
            <PostImageGallery title={post.title} images={post.images} />
          </div>

          {/* Right — details panel */}
          <div className="flex flex-col gap-5 p-6 sm:p-8">

            {/* Type stamp + status */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
                style={{ background: typeColor }}
              >
                {getPostTypeLabel(post.type)}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusDot }} />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  {getPostStatusLabel(post.status)}
                </span>
              </div>

              {post.isOwner && (
                <span
                  className="ml-auto text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: typeColor }}
                >
                  {t("postDetails.badges.myPost")}
                </span>
              )}
              {post.isFavorited && !post.isOwner && (
                <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-amber-600">
                  ♥ {t("postDetails.badges.favorited")}
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-2xl font-bold leading-snug tracking-tight text-[var(--text-primary)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.title}
            </h1>

            {/* Description */}
            <p className="text-sm leading-7 text-[var(--text-secondary)] sm:text-[15px]">
              {post.description}
            </p>

            <div className="border-t border-[var(--border)]" />

            {/* Fact stamp grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("postDetails.fields.location")}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)] leading-snug">{post.location}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("postDetails.fields.eventDate")}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{formatDate(post.eventDate)}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("postDetails.fields.category")}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{post.categoryName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("postDetails.fields.color")}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full border border-[var(--border)] shadow-sm"
                    style={{ backgroundColor: itemColorMap[post.color] ?? "#94a3b8" }}
                  />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {getItemColorLabel(post.color)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("postDetails.fields.postedBy")}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{post.userFullName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("postDetails.fields.createdAt")}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{formatDateTime(post.createdAt)}</p>
              </div>

              {post.updatedAt && (
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {t("postDetails.fields.updatedAt")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{formatDateTime(post.updatedAt)}</p>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border)]" />

            {/* Actions */}
            <div className="mt-auto">

              {/* Owner actions */}
              {post.isOwner && (
                <div className="flex flex-wrap gap-2">
                  <LLink
                    to={`/posts/${post.slug}/edit`}
                    className={`${btnBase} border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]`}
                  >
                    <ion-icon name="create-outline" style={{ fontSize: "14px" }} />
                    {t("postDetails.actions.editPost")}
                  </LLink>

                  {canMarkReturned && (
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus(1)}
                      disabled={isOwnerBusy}
                      className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`}
                    >
                      <ion-icon name="checkmark-circle-outline" style={{ fontSize: "14px" }} />
                      {statusSubmittingTo === 1 ? t("common.saving") : t("postDetails.actions.markAsReturned")}
                    </button>
                  )}

                  {canClosePost && (
                    <button
                      type="button"
                      onClick={() => void handleUpdateStatus(2)}
                      disabled={isOwnerBusy}
                      className={`${btnBase} border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]`}
                    >
                      {statusSubmittingTo === 2 ? t("common.saving") : t("postDetails.actions.closePost")}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleDeletePost()}
                    disabled={isOwnerBusy}
                    className={`${btnBase} border border-red-200 text-red-700 hover:bg-red-50`}
                  >
                    <ion-icon name="trash-outline" style={{ fontSize: "14px" }} />
                    {isDeletingPost ? t("common.deleting") : t("postDetails.actions.deletePost")}
                  </button>
                </div>
              )}

              {/* Visitor actions */}
              {isAuthenticated && !post.isOwner && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleFavoriteToggle()}
                    disabled={isFavoriteSubmitting}
                    className={`${btnBase} border ${
                      post.isFavorited
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    }`}
                  >
                    <ion-icon name={post.isFavorited ? "heart" : "heart-outline"} style={{ fontSize: "14px" }} />
                    {isFavoriteSubmitting
                      ? t("common.saving")
                      : post.isFavorited
                      ? t("postDetails.actions.removeFavorite")
                      : t("postDetails.actions.addToFavorites")}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowReportForm(false); setErrorMessage(""); setSuccessMessage(""); void handleChat(); }}
                    disabled={isChatStarting}
                    className={`${btnBase} text-white`}
                    style={{ background: typeColor }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <ion-icon name="chatbubble-outline" style={{ fontSize: "14px" }} />
                    {isChatStarting ? t("common.loading") : t("chat.startChat")}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowReportForm((p) => !p); setErrorMessage(""); setSuccessMessage(""); }}
                    className={`${btnBase} border border-red-200 text-red-700 hover:bg-red-50`}
                  >
                    <ion-icon name="flag-outline" style={{ fontSize: "14px" }} />
                    {showReportForm ? t("postDetails.actions.closeReportForm") : t("postDetails.actions.reportPost")}
                  </button>
                </div>
              )}

              {/* Not authenticated */}
              {!isAuthenticated && (
                <LLink
                  to="/login"
                  className={`${btnBase} text-white`}
                  style={{ background: typeColor }}
                >
                  <ion-icon name="log-in-outline" style={{ fontSize: "14px" }} />
                  {t("postDetails.actions.loginToContact")}
                </LLink>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ── Report form ─────────────────────────────────────── */}
      {showReportForm && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {t("postDetails.reportForm.title")}
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                {t("postDetails.reportForm.reasonLabel")}
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                {reportReasonOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                {t("postDetails.reportForm.selectedReason", { reason: reportReasonLabel })}
              </p>
            </div>
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
              className={`${btnBase} bg-red-600 text-white hover:bg-red-700 disabled:opacity-60`}
            >
              {isReportSubmitting ? t("common.submitting") : t("postDetails.reportForm.submit")}
            </button>
          </div>
        </section>
      )}

      {/* ── Image manager (owner only) ───────────────────────── */}
      {post.isOwner && (
        <PostImageManager
          itemPostId={post.id}
          images={post.images}
          onImagesChanged={handleImagesChanged}
        />
      )}

      {/* ── Potential matches ────────────────────────────────── */}
      {isAuthenticated && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <div className="border-b border-[var(--border)] pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}>
              {t("postDetails.matches.title")}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("postDetails.matches.subtitle")}
            </p>
          </div>

          {isMatchesLoading ? (
            <div className="mt-5 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <ion-icon name="sync-outline" style={{ fontSize: "14px" }} />
              {t("postDetails.matches.loading")}
            </div>
          ) : matches.length === 0 ? (
            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {t("postDetails.matches.empty")}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <LLink
                  key={match.id}
                  to={`/posts/${match.slug}`}
                  className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)]"
                >
                  {/* Match image */}
                  <div className="relative h-36 overflow-hidden bg-[var(--bg-card)]">
                    {match.images.length > 0 ? (
                      <img
                        src={buildFileUrl(match.images[0].imageUrl)}
                        alt={match.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ion-icon name="image-outline" style={{ fontSize: "28px", color: "var(--border)" }} />
                      </div>
                    )}
                    {/* Score badge */}
                    <div
                      className="absolute right-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                      style={{ background: typeColor }}
                    >
                      {Math.round(match.matchScore)}%
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 className="line-clamp-1 text-sm font-semibold text-[var(--text-primary)]">
                      {match.title}
                    </h3>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <ion-icon name="location-outline" style={{ fontSize: "11px" }} />
                        <span className="line-clamp-1">{match.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <ion-icon name="calendar-outline" style={{ fontSize: "11px" }} />
                        <span>{formatDate(match.eventDate)}</span>
                      </div>
                    </div>

                    {match.matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {match.matchReasons.slice(0, 3).map((reason, i) => (
                          <span
                            key={`${match.id}-${i}`}
                            className="rounded-full bg-[var(--bg-card)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </LLink>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
