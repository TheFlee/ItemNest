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
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Manage Images</h2>
          <p className="mt-1 text-sm text-slate-500">
            You can upload up to {maxImages} images for this post.
          </p>
        </div>

        <label
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-white ${
            images.length >= maxImages || isUploading
              ? "bg-slate-400"
              : "bg-slate-800 hover:bg-slate-900"
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
        <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-2xl border bg-white">
            <img
              src={buildFileUrl(image.imageUrl)}
              alt="Post"
              className="h-40 w-full object-cover"
            />

            <div className="p-3">
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                disabled={deletingImageId === image.id}
                className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-60"
              >
                {deletingImageId === image.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          No uploaded images yet.
        </p>
      )}
    </div>
  );
}