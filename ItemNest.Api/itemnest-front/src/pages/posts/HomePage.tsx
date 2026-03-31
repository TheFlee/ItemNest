import { useEffect, useState } from "react";
import { getPosts } from "../../api/itemPostApi";
import PageState from "../../components/common/PageState";
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
    <div className="space-y-8">
      

      {isLoading || errorMessage || posts.length === 0 ? (
        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && posts.length === 0}
          emptyMessage="No posts found."
        />
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Browse posts
            </h2>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>

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