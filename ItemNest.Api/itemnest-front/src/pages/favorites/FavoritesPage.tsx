import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyFavorites, removeFavorite } from "../../api/favoriteApi";
import PageState from "../../components/common/PageState";
import type { FavoriteItem } from "../../types/favorite";
import { buildFileUrl } from "../../utils/api";
import { formatDateTime } from "../../utils/format";
import { getApiErrorMessage } from "../../utils/error";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [removingPostId, setRemovingPostId] = useState<string | null>(null);

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
    setRemovingPostId(itemPostId);

    try {
      await removeFavorite(itemPostId);
      setFavorites((prev) => prev.filter((x) => x.itemPostId !== itemPostId));
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setRemovingPostId(null);
    }
  }

  if (isLoading || errorMessage || favorites.length === 0) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={!isLoading && !errorMessage && favorites.length === 0}
        emptyMessage="You do not have any favorite posts yet."
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Favorites</h1>
        <p className="mt-2 text-slate-600">
          Posts you saved for later review.
        </p>
      </div>

      <div className="grid gap-4">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow sm:flex-row"
          >
            <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:w-56">
              {favorite.firstImageUrl ? (
                <img
                  src={buildFileUrl(favorite.firstImageUrl)}
                  alt={favorite.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No image
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {favorite.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Category:</span>{" "}
                  {favorite.categoryName}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Saved At:</span>{" "}
                  {formatDateTime(favorite.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/posts/${favorite.itemPostId}`}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
                >
                  View Post
                </Link>

                <button
                  type="button"
                  onClick={() => void handleRemove(favorite.itemPostId)}
                  disabled={removingPostId === favorite.itemPostId}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  {removingPostId === favorite.itemPostId
                    ? "Removing..."
                    : "Remove Favorite"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}