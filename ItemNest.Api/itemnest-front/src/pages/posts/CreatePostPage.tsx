import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../../api/categoryApi";
import { uploadImages } from "../../api/itemImageApi";
import { createPost } from "../../api/itemPostApi";
import ImagePicker from "../../components/forms/ImagePicker";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTextarea from "../../components/forms/FormTextarea";
import type { Category } from "../../types/category";
import { getApiErrorMessage } from "../../utils/error";
import { itemColorOptions, postTypeOptions } from "../../utils/options";

interface CreatePostFormState {
  title: string;
  description: string;
  type: string;
  color: string;
  location: string;
  eventDate: string;
  categoryId: string;
}

const MAX_IMAGE_COUNT = 5;
const MAX_FILE_SIZE_MB = 5;

export default function CreatePostPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<CreatePostFormState>({
    title: "",
    description: "",
    type: "",
    color: "",
    location: "",
    eventDate: "",
    categoryId: "",
  });

  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      setErrorMessage("");

      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoadingCategories(false);
      }
    }

    void loadCategories();
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories]
  );

  function updateField<K extends keyof CreatePostFormState>(
    key: K,
    value: CreatePostFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleAddFiles(files: File[]) {
    setErrorMessage("");

    const allowedRemainingCount = MAX_IMAGE_COUNT - selectedFiles.length;
    const filesToTake = files.slice(0, allowedRemainingCount);

    const oversizedFile = filesToTake.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );

    if (oversizedFile) {
      setErrorMessage(`Each image must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setSelectedFiles((prev) => [...prev, ...filesToTake]);
  }

  function handleRemoveFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!form.description.trim()) {
      setErrorMessage("Description is required.");
      return;
    }

    if (form.type === "") {
      setErrorMessage("Post type is required.");
      return;
    }

    if (form.color === "") {
      setErrorMessage("Color is required.");
      return;
    }

    if (!form.location.trim()) {
      setErrorMessage("Location is required.");
      return;
    }

    if (!form.eventDate) {
      setErrorMessage("Event date is required.");
      return;
    }

    if (form.categoryId === "") {
      setErrorMessage("Category is required.");
      return;
    }

    if (selectedFiles.length > MAX_IMAGE_COUNT) {
      setErrorMessage(`You can upload at most ${MAX_IMAGE_COUNT} images.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: Number(form.type),
        color: Number(form.color),
        location: form.location.trim(),
        eventDate: new Date(form.eventDate).toISOString(),
        categoryId: Number(form.categoryId),
      };

      const createdPost = await createPost(requestPayload);

      try {
        if (selectedFiles.length > 0) {
          await uploadImages(createdPost.id, selectedFiles);
        }

        navigate(`/posts/${createdPost.id}`);
      } catch {
        navigate(`/posts/${createdPost.id}`, {
          state: {
            warningMessage:
              "Post was created successfully, but one or more images could not be uploaded.",
          },
        });
      }
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingCategories) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-base font-medium text-slate-700">Loading form...</p>
        <p className="mt-2 text-sm text-slate-500">
          Categories and form options are being prepared.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to dashboard
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Post publishing
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Create Post
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Publish a lost or found item with clear details and optional images.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Post types</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Lost or Found</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Images</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Up to {MAX_IMAGE_COUNT}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Max size</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {MAX_FILE_SIZE_MB} MB each
              </p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Post information
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Add clear item information so the post is easier to review and match.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormInput
                label="Title"
                value={form.title}
                onChange={(value) => updateField("title", value)}
                placeholder="Example: Lost black wallet near 28 May metro"
                required
              />
            </div>

            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Describe the item clearly, including visible details, brand, size, marks, and where it was seen."
                required
                rows={6}
              />
            </div>

            <FormSelect
              label="Post Type"
              value={form.type}
              onChange={(value) => updateField("type", value)}
              options={postTypeOptions}
              placeholder="Select post type"
              required
            />

            <FormSelect
              label="Color"
              value={form.color}
              onChange={(value) => updateField("color", value)}
              options={itemColorOptions}
              placeholder="Select color"
              required
            />

            <FormInput
              label="Location"
              value={form.location}
              onChange={(value) => updateField("location", value)}
              placeholder="Example: 28 May metro station"
              required
            />

            <FormInput
              label="Event Date"
              type="datetime-local"
              value={form.eventDate}
              onChange={(value) => updateField("eventDate", value)}
              required
            />

            <div className="md:col-span-2">
              <FormSelect
                label="Category"
                value={form.categoryId}
                onChange={(value) => updateField("categoryId", value)}
                options={categoryOptions}
                placeholder="Select category"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating post..." : "Create Post"}
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Images
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Add supporting images to make the item easier to identify.
              </p>
            </div>

            <div className="mt-6">
              <ImagePicker
                files={selectedFiles}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
                maxFiles={MAX_IMAGE_COUNT}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Publishing notes
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Use a specific title and description so other users can identify the item more
                easily.
              </p>
              <p>
                Add the correct location, date, and category to improve match quality.
              </p>
              <p>
                You can manage the post later, upload more images, change status, or edit
                details from the post page.
              </p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}