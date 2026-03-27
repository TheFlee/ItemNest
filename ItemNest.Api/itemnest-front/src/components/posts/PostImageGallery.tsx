import { useState } from "react";
import type { ItemImage } from "../../types/post";
import { buildFileUrl } from "../../utils/api";

interface PostImageGalleryProps {
  title: string;
  images: ItemImage[];
}

export default function PostImageGallery({
  title,
  images,
}: PostImageGalleryProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState(
    images[0]?.imageUrl ?? ""
  );

  if (!images.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-slate-200">
        <img
          src={buildFileUrl(selectedImageUrl)}
          alt={title}
          className="h-96 w-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {images.map((image) => {
            const isSelected = image.imageUrl === selectedImageUrl;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageUrl(image.imageUrl)}
                className={`overflow-hidden rounded-xl border-2 ${
                  isSelected ? "border-slate-800" : "border-transparent"
                }`}
              >
                <img
                  src={buildFileUrl(image.imageUrl)}
                  alt={title}
                  className="h-20 w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}