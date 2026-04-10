import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { getItemColorOptions, getPostStatusOptions } from "../../utils/options";
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

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export default function EditPostPage() {
  const { t } = useTranslation();
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
        setErrorMessage(t("postDetails.errors.postIdMissing"));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const [post, categoryData] = await Promise.all([getPostById(id), getCategories()]);

        if (!post.isOwner) {
          setErrorMessage(t("postDetails.errors.postIdMissing"));
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

  const postStatusOptions = useMemo(() => getPostStatusOptions(), [t]);
  const itemColorOptions = useMemo(() => getItemColorOptions(), [t]);

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
      setErrorMessage(t("postDetails.errors.postIdMissing"));
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage(t("editPostPage.form.titleRequired"));
      return;
    }

    if (!form.description.trim()) {
      setErrorMessage(t("editPostPage.form.descriptionRequired"));
      return;
    }

    if (form.color === "") {
      setErrorMessage(t("editPostPage.form.colorRequired"));
      return;
    }

    if (!form.location.trim()) {
      setErrorMessage(t("editPostPage.form.locationRequired"));
      return;
    }

    if (!form.eventDate) {
      setErrorMessage(t("editPostPage.form.eventDateRequired"));
      return;
    }

    if (form.categoryId === "") {
      setErrorMessage(t("editPostPage.form.categoryRequired"));
      return;
    }

    if (form.status === "") {
      setErrorMessage(t("editPostPage.form.statusRequired"));
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
          successMessage: t("editPostPage.successMessage"),
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
          {t("editPostPage.backToPost")}
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("editPostPage.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("editPostPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("editPostPage.description")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">
                {t("editPostPage.cards.editableFields")}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {t("editPostPage.cards.editableFieldsValue")}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">
                {t("editPostPage.cards.statusOptions")}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {t("editPostPage.cards.statusOptionsValue")}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">
                {t("editPostPage.cards.nextStep")}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {t("editPostPage.cards.nextStepValue")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {t("editPostPage.section.editInfo")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t("editPostPage.section.editInfoSubtitle")}
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormInput
                label={t("editPostPage.form.title")}
                value={form.title}
                onChange={(value) => updateField("title", value)}
                placeholder={t("editPostPage.form.titlePlaceholder")}
                required
              />
            </div>

            <div className="md:col-span-2">
              <FormTextarea
                label={t("editPostPage.form.description")}
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder={t("editPostPage.form.descriptionPlaceholder")}
                required
                rows={6}
              />
            </div>

            <FormSelect
              label={t("editPostPage.form.color")}
              value={form.color}
              onChange={(value) => updateField("color", value)}
              options={itemColorOptions}
              placeholder={t("common.allColors")}
              required
            />

            <FormSelect
              label={t("editPostPage.form.status")}
              value={form.status}
              onChange={(value) => updateField("status", value)}
              options={postStatusOptions}
              placeholder={t("common.allStatuses")}
              required
            />

            <div className="md:col-span-2">
              <FormInput
                label={t("editPostPage.form.location")}
                value={form.location}
                onChange={(value) => updateField("location", value)}
                placeholder={t("editPostPage.form.locationPlaceholder")}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("editPostPage.form.eventDate")}
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
              label={t("editPostPage.form.category")}
              value={form.categoryId}
              onChange={(value) => updateField("categoryId", value)}
              options={categoryOptions}
              placeholder={t("common.allCategories")}
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
              {isSubmitting ? t("editPostPage.submitting") : t("editPostPage.submit")}
            </button>

            <Link
              to={`/posts/${id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              {t("editPostPage.cancel")}
            </Link>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t("editPostPage.statusGuidance.title")}
            </h2>

            <div className="mt-4 space-y-3">
              {postStatusOptions.map((option) => {
                const isSelected = Number(form.status) === option.value;
                const descKey =
                  option.value === 0
                    ? "editPostPage.statusGuidance.openDesc"
                    : option.value === 1
                      ? "editPostPage.statusGuidance.returnedDesc"
                      : "editPostPage.statusGuidance.closedDesc";

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
                    <p className="mt-1 text-sm leading-6 text-slate-600">{t(descKey)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {t("editPostPage.section.notes")}
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>{t("editPostPage.section.note1")}</p>
              <p>{t("editPostPage.section.note2")}</p>
              <p>{t("editPostPage.section.note3")}</p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
