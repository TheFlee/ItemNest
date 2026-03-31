import { useEffect, useMemo } from "react";

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
    if (!selectedFiles.length) {
      return;
    }

    onAddFiles(selectedFiles);
    event.target.value = "";
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">Images</label>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Upload up to {maxFiles} images
            </p>
            <p className="mt-1 text-sm text-slate-500">
              JPG, JPEG, PNG, or WEBP formats are supported.
            </p>
          </div>

          <label
            className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
              files.length >= maxFiles
                ? "bg-slate-400"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            Select Images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={files.length >= maxFiles}
            />
          </label>
        </div>

        {files.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="h-44 w-full object-cover"
                />

                <div className="p-4">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="mt-4 inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">No images selected yet.</p>
        )}
      </div>
    </div>
  );
}