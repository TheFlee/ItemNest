import { useEffect, useState } from "react";
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
  const [selectedImageUrl, setSelectedImageUrl] = useState(images[0]?.imageUrl ?? "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedImageUrl(images[0]?.imageUrl ?? "");
    setIsLightboxOpen(false);
  }, [images]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    }

    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  function handleSelectImage(imageUrl: string) {
    setSelectedImageUrl(imageUrl);
  }

  function openLightbox(imageUrl?: string) {
    if (imageUrl) {
      setSelectedImageUrl(imageUrl);
    }

    setIsLightboxOpen(true);
  }

  function closeLightbox() {
    setIsLightboxOpen(false);
  }

  if (!images.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-105 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
          No images available
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Images</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review the uploaded item images in a cleaner gallery layout.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={() => openLightbox()}
            className="block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left"
          >
            <img
              src={buildFileUrl(selectedImageUrl)}
              alt={title}
              className="h-105 w-full object-cover"
            />
          </button>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image) => {
                const isSelected = image.imageUrl === selectedImageUrl;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => handleSelectImage(image.imageUrl)}
                    className={`overflow-hidden rounded-xl border ${
                      isSelected
                        ? "border-slate-900 ring-2 ring-slate-200"
                        : "border-slate-200 hover:border-slate-400"
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

          <p className="text-sm text-slate-500">
            Click the main image to open a larger preview.
          </p>
        </div>
      </section>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-0 top-0 z-10 inline-flex h-11 w-11 -translate-y-14 items-center justify-center rounded-full bg-white text-lg font-semibold text-slate-900 shadow-sm hover:bg-slate-100"
            >
              ×
            </button>

            <div className="overflow-hidden rounded-2xl bg-black">
              <img
                src={buildFileUrl(selectedImageUrl)}
                alt={title}
                className="max-h-[85vh] w-full object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 rounded-2xl bg-white/95 p-3 shadow-sm sm:grid-cols-5 md:grid-cols-6">
                {images.map((image) => {
                  const isSelected = image.imageUrl === selectedImageUrl;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => handleSelectImage(image.imageUrl)}
                      className={`overflow-hidden rounded-xl border ${
                        isSelected
                          ? "border-slate-900 ring-2 ring-slate-200"
                          : "border-slate-200 hover:border-slate-400"
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
        </div>
      )}
    </>
  );
}