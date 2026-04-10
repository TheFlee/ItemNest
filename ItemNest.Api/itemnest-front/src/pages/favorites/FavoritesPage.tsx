import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyFavorites, removeFavorite } from "../../api/favoriteApi";
import PageState from "../../components/common/PageState";
import type { FavoriteItem } from "../../types/favorite";
import { buildFileUrl } from "../../utils/api";
import { formatDateTime } from "../../utils/format";
import { getApiErrorMessage } from "../../utils/error";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [removingPostId, setRemovingPostId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyFavorites();
        setFavorites(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadFavorites();
  }, []);

  async function handleRemove(itemPostId: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setRemovingPostId(itemPostId);

    try {
      await removeFavorite(itemPostId);
      setFavorites((prev) => prev.filter((x) => x.itemPostId !== itemPostId));
      setSuccessMessage(t("favoritesPage.messages.removed"));
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setRemovingPostId(null);
    }
  }

  const latestSavedAt = useMemo(() => {
    if (!favorites.length) {
      return "-";
    }

    return formatDateTime(favorites[0].createdAt);
  }, [favorites]);

  if (isLoading || errorMessage || favorites.length === 0) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && favorites.length === 0}
        emptyMessage={t("favoritesPage.empty")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("favoritesPage.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("favoritesPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("favoritesPage.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {t("favoritesPage.actions.browsePosts")}
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("favoritesPage.actions.backToDashboard")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("favoritesPage.cards.savedPosts")}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {favorites.length}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("favoritesPage.cards.savedPostsDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("favoritesPage.cards.latestSave")}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{latestSavedAt}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("favoritesPage.cards.latestSaveDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("favoritesPage.cards.useCase")}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {t("favoritesPage.cards.useCaseValue")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("favoritesPage.cards.useCaseDescription")}
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
          {t("favoritesPage.list.title")}
        </h2>
        <p className="text-sm text-slate-600">
          {t("favoritesPage.list.description")}
        </p>
      </section>

      <section className="grid gap-4">
        {favorites.map((favorite) => (
          <article
            key={favorite.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="h-52 w-full shrink-0 overflow-hidden bg-slate-100 lg:h-auto lg:w-72">
                {favorite.firstImageUrl ? (
                  <img
                    src={buildFileUrl(favorite.firstImageUrl)}
                    alt={favorite.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-52 items-center justify-center text-sm text-slate-500">
                    {t("common.noImage")}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {favorite.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {t("favoritesPage.list.cardDescription")}
                      </p>
                    </div>

                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                      {t("favoritesPage.list.savedBadge")}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {t("favoritesPage.list.category")}
                      </p>
                      <p className="mt-1 font-medium text-slate-700">{favorite.categoryName}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {t("favoritesPage.list.savedAt")}
                      </p>
                      <p className="mt-1 font-medium text-slate-700">
                        {formatDateTime(favorite.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/posts/${favorite.itemPostId}`}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    {t("favoritesPage.actions.viewPost")}
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleRemove(favorite.itemPostId)}
                    disabled={removingPostId === favorite.itemPostId}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingPostId === favorite.itemPostId
                      ? t("favoritesPage.actions.removing")
                      : t("favoritesPage.actions.removeFavorite")}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}