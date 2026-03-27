import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { addFavorite, removeFavorite } from "../../api/favoriteApi";
import { getPostById } from "../../api/itemPostApi";
import DetailRow from "../../components/common/DetailRow";
import PageState from "../../components/common/PageState";
import PostImageGallery from "../../components/posts/PostImageGallery";
import { useAuth } from "../../context/AuthContext";
import type { ItemPost } from "../../types/post";
import { formatDate, formatDateTime } from "../../utils/format";
import { getApiErrorMessage } from "../../utils/error";
import PostImageManager from "../../components/posts/PostImageManager";
import {
    getItemColorLabel,
    getPostStatusLabel,
    getPostTypeLabel,
} from "../../utils/post";

export default function PostDetailsPage() {
    const { id } = useParams();
    const location = useLocation();
    const warningMessage = location.state?.warningMessage as string | undefined;
    const { isAuthenticated } = useAuth();

    const [post, setPost] = useState<ItemPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadPost() {
            if (!id) {
                setErrorMessage("Post id was not provided.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setErrorMessage("");

            try {
                const data = await getPostById(id);
                setPost(data);
            } catch (error: any) {
                setErrorMessage(getApiErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }

        void loadPost();
    }, [id]);

    function handleImagesChanged(updatedImages: ItemPost["images"]) {
        setPost((prev) => {
            if (!prev) {
                return prev;
            }

            return {
                ...prev,
                images: updatedImages,
                primaryImageUrl: updatedImages[0]?.imageUrl ?? "",
            };
        });
    }

    async function handleFavoriteToggle() {
        if (!post || !isAuthenticated || post.isOwner) {
            return;
        }

        setIsFavoriteSubmitting(true);

        try {
            if (post.isFavorited) {
                await removeFavorite(post.id);
                setPost((prev) =>
                    prev
                        ? {
                            ...prev,
                            isFavorited: false,
                        }
                        : prev
                );
            } else {
                await addFavorite(post.id);
                setPost((prev) =>
                    prev
                        ? {
                            ...prev,
                            isFavorited: true,
                        }
                        : prev
                );
            }
        } catch (error: any) {
            setErrorMessage(getApiErrorMessage(error));
        } finally {
            setIsFavoriteSubmitting(false);
        }
    }

    const stateBlock = (
        <PageState
            isLoading={isLoading}
            errorMessage={errorMessage}
            isEmpty={!isLoading && !errorMessage && !post}
            emptyMessage="Post not found."
        />
    );

    if (isLoading || errorMessage || !post) {
        return stateBlock;
    }

    return (

        <div className="space-y-6">
            <div>
                <Link
                    to="/"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    ← Back to posts
                </Link>
            </div>

            {warningMessage && (
                <div className="rounded-lg bg-amber-100 px-4 py-3 text-amber-800">
                    {warningMessage}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <PostImageGallery title={post.title} images={post.images} />

                <div className="rounded-2xl bg-white p-6 shadow">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">{post.title}</h1>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${post.type === 0
                                        ? "bg-red-100 text-red-700"
                                        : "bg-emerald-100 text-emerald-700"
                                        }`}
                                >
                                    {getPostTypeLabel(post.type)}
                                </span>

                                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                                    {getPostStatusLabel(post.status)}
                                </span>

                                {post.isOwner && (
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                        My Post
                                    </span>
                                )}

                                {post.isFavorited && !post.isOwner && (
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                                        Favorited
                                    </span>
                                )}
                            </div>
                        </div>

                        {isAuthenticated && !post.isOwner && (
                            <button
                                type="button"
                                onClick={handleFavoriteToggle}
                                disabled={isFavoriteSubmitting}
                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${post.isFavorited
                                    ? "bg-amber-600 hover:bg-amber-700"
                                    : "bg-slate-800 hover:bg-slate-900"
                                    } disabled:opacity-60`}
                            >
                                {isFavoriteSubmitting
                                    ? "Saving..."
                                    : post.isFavorited
                                        ? "Remove Favorite"
                                        : "Add to Favorites"}
                            </button>
                        )}
                    </div>

                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                        <h2 className="text-lg font-semibold text-slate-800">Description</h2>
                        <p className="mt-2 whitespace-pre-wrap text-slate-700">
                            {post.description}
                        </p>
                    </div>

                    <div className="mt-6">
                        <DetailRow label="Category" value={post.categoryName} />
                        <DetailRow label="Location" value={post.location} />
                        <DetailRow label="Color" value={getItemColorLabel(post.color)} />
                        <DetailRow label="Event Date" value={formatDate(post.eventDate)} />
                        <DetailRow label="Posted By" value={post.userFullName} />
                        <DetailRow label="Created At" value={formatDateTime(post.createdAt)} />
                        {post.updatedAt && (
                            <DetailRow
                                label="Updated At"
                                value={formatDateTime(post.updatedAt)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {post.isOwner && (
                <PostImageManager
                    itemPostId={post.id}
                    images={post.images}
                    onImagesChanged={handleImagesChanged}
                    />
                )}
        </div>
    );
}