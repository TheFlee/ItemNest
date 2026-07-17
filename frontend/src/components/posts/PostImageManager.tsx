import { useState } from "react";
import { useTranslation } from "react-i18next";
import { deleteImage, uploadImage } from "../../api/itemImageApi";
import type { ItemImage } from "../../types/post";
import { getApiErrorMessage } from "../../utils/error";
import { buildFileUrl } from "../../utils/api";

interface PostImageManagerProps {
  itemPostId: string;
  images: ItemImage[];
  maxImages?: number;
  onImagesChanged: (images: ItemImage[]) => void;
}

export default function PostImageManager({
  itemPostId,
  images,
  maxImages = 5,
  onImagesChanged,
}: PostImageManagerProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    if (images.length >= maxImages) {
      setErrorMessage(t("postImageManager.maxImagesError", { max: maxImages }));
      return;
    }

    setErrorMessage("");
    setIsUploading(true);

    try {
      const uploadedImage = await uploadImage(itemPostId, file);
      onImagesChanged([...images, uploadedImage]);
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(imageId: string) {
    setErrorMessage("");
    setDeletingImageId(imageId);

    try {
      await deleteImage(imageId);
      onImagesChanged(images.filter((image) => image.id !== imageId));
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setDeletingImageId(null);
    }
  }

  const atLimit = images.length >= maxImages;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t("postImageManager.title")}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("postImageManager.description", { max: maxImages })}
          </p>
        </div>

        <label
          className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
            atLimit || isUploading
              ? "bg-[var(--text-secondary)] opacity-60 cursor-not-allowed"
              : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
          }`}
        >
          {isUploading ? t("postImageManager.uploading") : t("postImageManager.uploadButton")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={atLimit || isUploading}
          />
        </label>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {images.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]"
            >
              <img
                src={buildFileUrl(image.imageUrl)}
                alt={t("postImageManager.imageLabel", { index: index + 1 })}
                className="h-44 w-full object-cover"
              />

              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {t("postImageManager.imageLabel", { index: index + 1 })}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t("postImageManager.imageNote")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingImageId === image.id}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  {deletingImageId === image.id ? t("common.deleting") : t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          {t("postImageManager.noImages")}
        </div>
      )}
    </section>
  );
}
