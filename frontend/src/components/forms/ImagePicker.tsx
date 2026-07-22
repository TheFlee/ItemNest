import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface ImagePickerProps {
  files: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
}

export default function ImagePicker({
  files,
  onAddFiles,
  onRemoveFile,
  maxFiles = 5,
}: ImagePickerProps) {
  const { t } = useTranslation();

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;
    onAddFiles(selectedFiles);
    event.target.value = "";
  }

  const atLimit = files.length >= maxFiles;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-[var(--text-primary)]">
        {t("imagePicker.label")}
      </label>

      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {t("imagePicker.uploadLabel", { max: maxFiles })}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("imagePicker.formatsNote")}
            </p>
          </div>

          <label
            className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
              atLimit
                ? "bg-[var(--text-secondary)] opacity-60 cursor-not-allowed"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            }`}
          >
            {t("imagePicker.selectButton")}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={atLimit}
            />
          </label>
        </div>

        {files.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]"
              >
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="h-44 w-full object-cover"
                />
                <div className="p-4">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="mt-4 inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition"
                  >
                    {t("imagePicker.remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--text-secondary)]">
            {t("imagePicker.noImages")}
          </p>
        )}
      </div>
    </div>
  );
}
