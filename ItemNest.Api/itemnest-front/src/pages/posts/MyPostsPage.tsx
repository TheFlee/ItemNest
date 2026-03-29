import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMyPosts } from "../../api/itemPostApi";
import PageState from "../../components/common/PageState";
import PostCard from "../../components/posts/PostCard";
import type { ItemPost } from "../../types/post";
import { getApiErrorMessage } from "../../utils/error";

export default function MyPostsPage() {
  const location = useLocation();
  const routeSuccessMessage = location.state?.successMessage as string | undefined;

  const [posts, setPosts] = useState<ItemPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getMyPosts();
        setPosts(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadPosts();
  }, []);

  if (isLoading || errorMessage || posts.length === 0) {
    return (
      <div className="space-y-4">
        {routeSuccessMessage && !isLoading && !errorMessage && (
          <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
            {routeSuccessMessage}
          </div>
        )}

        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && posts.length === 0}
          emptyMessage="You have not created any posts yet."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">My Posts</h1>
        <p className="mt-2 text-slate-600">
          Manage the lost and found posts you created.
        </p>
      </div>

      {routeSuccessMessage && (
        <div className="mb-6 rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
          {routeSuccessMessage}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showOwnerActions />
        ))}
      </div>
    </div>
  );
}