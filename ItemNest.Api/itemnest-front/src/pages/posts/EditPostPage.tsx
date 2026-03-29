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
        const [post, categoryData] = await Promise.all([
          getPostById(id),
          getCategories(),
        ]);

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
    return (
      <PageState
        isLoading={isLoading}
        errorMessage={errorMessage}
        isEmpty={false}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          to={`/posts/${id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to post details
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Edit Post</h1>
        <p className="mt-2 text-slate-600">
          Update your lost or found post information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow">
        <div className="grid gap-4 md:grid-cols-2">
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
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Event Date
            </label>
            <input
              type="datetime-local"
              value={form.eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
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

          <div className="md:col-span-2">
            {errorMessage && (
              <div className="rounded-lg bg-red-100 px-4 py-3 text-red-700">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>

            <Link
              to={`/posts/${id}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}