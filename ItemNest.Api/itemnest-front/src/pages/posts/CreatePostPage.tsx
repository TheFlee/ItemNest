import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
            setErrorMessage(
                `Each image must be smaller than ${MAX_FILE_SIZE_MB} MB.`
            );
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
            } catch (uploadError: any) {
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
        return <div className="text-lg text-slate-700">Loading form...</div>;
    }

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Create Post</h1>
                <p className="mt-2 text-slate-600">
                    Publish a lost or found item post and optionally attach images.
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

                    <div className="md:col-span-2">
                        <ImagePicker
                            files={selectedFiles}
                            onAddFiles={handleAddFiles}
                            onRemoveFile={handleRemoveFile}
                            maxFiles={MAX_IMAGE_COUNT}
                        />
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-slate-800 px-5 py-2.5 text-white hover:bg-slate-900 disabled:opacity-60"
                    >
                        {isSubmitting ? "Creating..." : "Create Post"}
                    </button>
                </div>
            </form>
        </div>
    );
}