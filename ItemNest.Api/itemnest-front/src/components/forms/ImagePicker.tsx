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
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Images
      </label>

      <div className="rounded-2xl border border-dashed bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-slate-800">
              Upload up to {maxFiles} images
            </p>
            <p className="text-sm text-slate-500">
              JPG, JPEG, PNG or WEBP formats are supported.
            </p>
          </div>

          <label className="cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900">
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

        {files.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="overflow-hidden rounded-2xl bg-white shadow"
              >
                <img
                  src={previewUrls[index]}
                  alt={file.name}
                  className="h-40 w-full object-cover"
                />

                <div className="p-3">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">
            No images selected yet.
          </p>
        )}
      </div>
    </div>
  );
}