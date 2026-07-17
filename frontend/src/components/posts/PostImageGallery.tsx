import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ItemImage } from "../../types/post";
import { buildFileUrl } from "../../utils/api";

interface PostImageGalleryProps {
  title: string;
  images: ItemImage[];
}

export default function PostImageGallery({ title, images }: PostImageGalleryProps) {
  const { t } = useTranslation();
  const [selectedImageUrl, setSelectedImageUrl] = useState(images[0]?.imageUrl ?? "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setSelectedImageUrl(images[0]?.imageUrl ?? "");
    setIsLightboxOpen(false);
  }, [images]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsLightboxOpen(false);
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

  if (!images.length) {
    return (
      <div className="flex h-full min-h-[340px] flex-col items-center justify-center gap-3 bg-[var(--bg-surface)]">
        <ion-icon name="image-outline" style={{ fontSize: "44px", color: "var(--border)" }} />
        <p className="text-sm text-[var(--text-secondary)]">{t("postImageGallery.noImages")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Main image */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="group relative block min-h-[340px] flex-1 overflow-hidden bg-[var(--bg-surface)] text-left"
        >
          <img
            src={buildFileUrl(selectedImageUrl)}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <ion-icon name="expand-outline" style={{ fontSize: "12px" }} />
              {t("postImageGallery.hint")}
            </span>
          </div>
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 border-t border-[var(--border)] p-3">
            {images.map((image) => {
              const active = image.imageUrl === selectedImageUrl;
              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageUrl(image.imageUrl)}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all duration-150 ${
                    active
                      ? "border-[var(--accent)] opacity-100"
                      : "border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <img src={buildFileUrl(image.imageUrl)} alt="" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label={t("common.dismiss")}
              className="absolute right-0 top-0 z-10 inline-flex h-9 w-9 -translate-y-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ion-icon name="close" style={{ fontSize: "18px" }} />
            </button>
            <div className="overflow-hidden rounded-xl bg-black">
              <img
                src={buildFileUrl(selectedImageUrl)}
                alt={title}
                className="max-h-[82vh] w-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {images.map((image) => {
                  const active = image.imageUrl === selectedImageUrl;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageUrl(image.imageUrl)}
                      className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        active ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                      }`}
                    >
                      <img src={buildFileUrl(image.imageUrl)} alt="" className="h-full w-full object-cover" />
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
