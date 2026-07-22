import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCategories } from "../../api/categoryApi";
import { uploadImages } from "../../api/itemImageApi";
import { createPost } from "../../api/itemPostApi";
import ImagePicker from "../../components/forms/ImagePicker";
import FormInput from "../../components/forms/FormInput";
import FormSelect from "../../components/forms/FormSelect";
import FormTextarea from "../../components/forms/FormTextarea";
import type { Category } from "../../types/category";
import { getApiErrorMessage } from "../../utils/error";
import { getItemColorOptions, getPostTypeOptions } from "../../utils/options";
import { useToast } from "../../context/ToastContext";
import { useLangNavigate } from "../../hooks/useLangPath";
import { LLink } from "../../components/common/LLink";

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
  const { t } = useTranslation();
  const navigate = useLangNavigate();
  const { show } = useToast();

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

  const postTypeOptions = useMemo(() => getPostTypeOptions(), [t]);
  const itemColorOptions = useMemo(() => getItemColorOptions(), [t]);

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
      setErrorMessage(t("createPostPage.form.imageTooLarge", { size: MAX_FILE_SIZE_MB }));
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
      setErrorMessage(t("createPostPage.form.titleRequired"));
      return;
    }

    if (!form.description.trim()) {
      setErrorMessage(t("createPostPage.form.descriptionRequired"));
      return;
    }

    if (form.type === "") {
      setErrorMessage(t("createPostPage.form.postTypeRequired"));
      return;
    }

    if (form.color === "") {
      setErrorMessage(t("createPostPage.form.colorRequired"));
      return;
    }

    if (!form.location.trim()) {
      setErrorMessage(t("createPostPage.form.locationRequired"));
      return;
    }

    if (!form.eventDate) {
      setErrorMessage(t("createPostPage.form.eventDateRequired"));
      return;
    }

    if (form.categoryId === "") {
      setErrorMessage(t("createPostPage.form.categoryRequired"));
      return;
    }

    if (selectedFiles.length > MAX_IMAGE_COUNT) {
      setErrorMessage(t("createPostPage.form.tooManyImages", { count: MAX_IMAGE_COUNT }));
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

        show(t("createPostPage.successMessage") ?? "Post created successfully", "success");
        navigate(`/posts/${createdPost.slug}`);
      } catch {
        navigate(`/posts/${createdPost.slug}`, {
          state: {
            warningMessage: t("createPostPage.form.imageUploadWarning"),
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
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-10 text-center shadow-sm">
        <p className="text-base font-medium text-[var(--text-primary)]">{t("createPostPage.loadingTitle")}</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("createPostPage.loadingSubtitle")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <LLink
          to="/dashboard"
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {t("createPostPage.backToDashboard")}
        </LLink>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("createPostPage.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              {t("createPostPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("createPostPage.description")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
              <p className="text-sm font-medium text-[var(--text-secondary)]">{t("createPostPage.cards.postTypes")}</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {t("createPostPage.cards.postTypesValue")}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
              <p className="text-sm font-medium text-[var(--text-secondary)]">{t("createPostPage.cards.images")}</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {t("createPostPage.cards.imagesValue", { count: MAX_IMAGE_COUNT })}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
              <p className="text-sm font-medium text-[var(--text-secondary)]">{t("createPostPage.cards.maxSize")}</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {t("createPostPage.cards.maxSizeValue", { size: MAX_FILE_SIZE_MB })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm sm:p-7">
          <div className="border-b border-[var(--border)] pb-5">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t("createPostPage.section.postInfo")}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("createPostPage.section.postInfoSubtitle")}
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormInput
                label={t("createPostPage.form.title")}
                value={form.title}
                onChange={(value) => updateField("title", value)}
                placeholder={t("createPostPage.form.titlePlaceholder")}
                required
                icon="create-outline"
              />
            </div>

            <div className="md:col-span-2">
              <FormTextarea
                label={t("createPostPage.form.description")}
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder={t("createPostPage.form.descriptionPlaceholder")}
                required
                rows={6}
              />
            </div>

            <FormSelect
              label={t("createPostPage.form.postType")}
              value={form.type}
              onChange={(value) => updateField("type", value)}
              options={postTypeOptions}
              placeholder={t("common.allTypes")}
              required
            />

            <FormSelect
              label={t("createPostPage.form.color")}
              value={form.color}
              onChange={(value) => updateField("color", value)}
              options={itemColorOptions}
              placeholder={t("common.allColors")}
              required
            />

            <FormInput
              label={t("createPostPage.form.location")}
              value={form.location}
              onChange={(value) => updateField("location", value)}
              placeholder={t("createPostPage.form.locationPlaceholder")}
              required
              icon="location-outline"
            />

            <FormInput
              label={t("createPostPage.form.eventDate")}
              type="datetime-local"
              value={form.eventDate}
              onChange={(value) => updateField("eventDate", value)}
              required
            />

            <div className="md:col-span-2">
              <FormSelect
                label={t("createPostPage.form.category")}
                value={form.categoryId}
                onChange={(value) => updateField("categoryId", value)}
                options={categoryOptions}
                placeholder={t("common.allCategories")}
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t("createPostPage.submitting") : t("createPostPage.submit")}
            </button>

            <LLink
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
            >
              {t("createPostPage.cancel")}
            </LLink>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm sm:p-7">
            <div className="border-b border-[var(--border)] pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {t("createPostPage.section.images")}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {t("createPostPage.section.imagesSubtitle")}
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

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {t("createPostPage.section.notes")}
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
              <p>{t("createPostPage.section.note1")}</p>
              <p>{t("createPostPage.section.note2")}</p>
              <p>{t("createPostPage.section.note3")}</p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
