import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../../api/categoryApi";
import { getPostById, updatePost } from "../../api/itemPostApi";
import PageState from "../../components/common/PageState";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTextarea from "../../components/forms/FormTextarea";
import type { Category } from "../../types/category";
import type { UpdatePostRequest } from "../../types/post";
import { getApiErrorMessage } from "../../utils/error";
import { itemColorOptions } from "../../utils/options";
import { getPostStatusLabel } from "../../utils/post";

interface EditPostFormState {
  title: string;
  description: string;
  color: string;
  location: string;
  eventDate: string;
  categoryId: string;
  status: string;
}

const postStatusOptions = [
  { label: "Open", value: 0 },
  { label: "Returned", value: 1 },
  { label: "Closed", value: 2 },
];

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<EditPostFormState>({
    title: "",
    description: "",
    color: "",
    location: "",
    eventDate: "",
    categoryId: "",
    status: "",
  });

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setErrorMessage("Post id was not provided.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const [post, categoryData] = await Promise.all([getPostById(id), getCategories()]);

        if (!post.isOwner) {
          setErrorMessage("You are not allowed to edit this post.");
          setIsLoading(false);
          return;
        }

        setCategories(categoryData);
        setForm({
          title: post.title,
          description: post.description,
          color: String(post.color),
          location: post.location,
          eventDate: toDateTimeLocalValue(post.eventDate),
          categoryId: String(post.categoryId),
          status: String(post.status),
        });
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [id]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories]
  );

  function updateField<K extends keyof EditPostFormState>(
    key: K,
    value: EditPostFormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!id) {
      setErrorMessage("Post id was not provided.");
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!form.description.trim()) {
      setErrorMessage("Description is required.");
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

    if (form.status === "") {
      setErrorMessage("Status is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: UpdatePostRequest = {
        title: form.title.trim(),
        description: form.description.trim(),
        color: Number(form.color),
        location: form.location.trim(),
        eventDate: new Date(form.eventDate).toISOString(),
        categoryId: Number(form.categoryId),
        status: Number(form.status),
      };

      await updatePost(id, request);

      navigate(`/posts/${id}`, {
        replace: true,
        state: {
          successMessage: "Post was updated successfully.",
        },
      });
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || errorMessage) {
    return <PageState isLoading={isLoading} errorMessage={errorMessage} isEmpty={false} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link
          to={`/posts/${id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to post details
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Post management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Edit Post
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Update the main details of your post while keeping the information clear,
              accurate, and easy to review.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Editable fields</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Core post data</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Status options</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Open / Returned / Closed</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Next step</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Save changes</p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Edit information
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep the post title, description, location, category, and status up to date.
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
                placeholder="Describe the item clearly, including any important details."
                required
                rows={6}
              />
            </div>

            <FormSelect
              label="Color"
              value={form.color}
              onChange={(value) => updateField("color", value)}
              options={itemColorOptions}
              placeholder="Select color"
              required
            />

            <FormSelect
              label="Status"
              value={form.status}
              onChange={(value) => updateField("status", value)}
              options={postStatusOptions}
              placeholder="Select status"
              required
            />

            <div className="md:col-span-2">
              <FormInput
                label="Location"
                value={form.location}
                onChange={(value) => updateField("location", value)}
                placeholder="Example: 28 May metro station"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Event Date
              </label>
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => updateField("eventDate", e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500"
              />
            </div>

            <FormSelect
              label="Category"
              value={form.categoryId}
              onChange={(value) => updateField("categoryId", value)}
              options={categoryOptions}
              placeholder="Select category"
              required
            />
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>

            <Link
              to={`/posts/${id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Status guidance
            </h2>

            <div className="mt-4 space-y-3">
              {postStatusOptions.map((option) => {
                const isSelected = Number(form.status) === option.value;

                return (
                  <div
                    key={option.value}
                    className={`rounded-2xl border px-4 py-4 ${
                      isSelected
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {getPostStatusLabel(option.value)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {option.value === 0 &&
                        "Keep the post active and visible for continued review and matching."}
                      {option.value === 1 &&
                        "Use this when the item has been successfully returned or claimed."}
                      {option.value === 2 &&
                        "Use this when the post should no longer remain active in normal workflow."}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Editing notes
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>Keep the title specific so the post is still easy to identify in lists.</p>
              <p>Update the description when new information becomes available.</p>
              <p>Use the correct status so the post reflects the real current situation.</p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}