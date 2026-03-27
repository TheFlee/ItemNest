import { useEffect, useState } from "react";
import { getPosts } from "../../api/itemPostApi";
import Pagination from "../../components/common/Pagination";
import PostCard from "../../components/posts/PostCard";
import type { ItemPost } from "../../types/post";
import { getApiErrorMessage } from "../../utils/error";

export default function HomePage() {
    const [posts, setPosts] = useState<ItemPost[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(6);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadPosts() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await getPosts({
                    pageNumber,
                    pageSize,
                    sortBy: "createdAt",
                    sortDirection: "desc",
                });

                setPosts(response.items);
                setTotalPages(response.totalPages);
            } catch (error: any) {
                setErrorMessage(getApiErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }

        void loadPosts();
    }, [pageNumber, pageSize]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [pageNumber]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Recent Posts</h1>
                <p className="mt-2 text-slate-600">
                    Browse lost and found items published by users.
                </p>
            </div>

            {isLoading ? (
                <div className="text-lg text-slate-700">Loading posts...</div>
            ) : errorMessage ? (
                <div className="rounded-lg bg-red-100 px-4 py-3 text-red-700">
                    {errorMessage}
                </div>
            ) : posts.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-slate-600 shadow">
                    No posts found.
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>

                    <Pagination
                        pageNumber={pageNumber}
                        totalPages={totalPages}
                        onPageChange={setPageNumber}
                    />
                </>
            )}
        </div>
    );
}