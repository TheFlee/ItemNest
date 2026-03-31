import { useState } from "react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    event.target.value = "";

    if (images.length >= maxImages) {
      setErrorMessage(`You can upload at most ${maxImages} images.`);
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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Manage Images
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Upload or remove images for this post. Maximum: {maxImages}.
          </p>
        </div>

        <label
          className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
            images.length >= maxImages || isUploading
              ? "bg-slate-400"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={images.length >= maxImages || isUploading}
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
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <img
                src={buildFileUrl(image.imageUrl)}
                alt={`Post image ${index + 1}`}
                className="h-44 w-full object-cover"
              />

              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Image {index + 1}
                  </p>
                  <p className="text-xs text-slate-500">Uploaded for this post</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingImageId === image.id}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingImageId === image.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No uploaded images yet.
        </div>
      )}
    </section>
  );
}