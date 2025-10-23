import { useInfiniteQuery } from "@tanstack/react-query";
import Post from "../components/Post";
import PostSkeleton from "../components/skeletons/PostSkeleton";
import axios from "axios";
import toast from "react-hot-toast";
import { PostType } from "../types/types";
import { useEffect, useRef, useCallback } from "react";

const Posts = ({
  feedType,
  username,
  userId,
}: {
  feedType: string;
  username: string;
  userId: string;
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return `${import.meta.env.VITE_API_URL}/api/v1/posts/all`;
      case "following":
        return `${import.meta.env.VITE_API_URL}/api/v1/posts/following`;
      case "posts":
        return `${import.meta.env.VITE_API_URL}/api/v1/posts/user/${username}`;
      case "likes":
        return `${import.meta.env.VITE_API_URL}/api/v1/posts/likes/${userId}`;
      default:
        return `${import.meta.env.VITE_API_URL}/api/v1/posts/all`;
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await axios.get(`${POST_ENDPOINT}?page=${pageParam}&limit=10`, {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          console.error("Error fetching posts:", error);
          toast.error(errorMessage || "Something went wrong");
          return { data: [], pagination: { hasMore: false } };
        } else {
          console.error("Unexpected error:", error);
          return { data: [], pagination: { hasMore: false } };
        }
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.pagination?.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0 };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  useEffect(() => {
    refetch();
  }, [feedType, username, userId, refetch]);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts.length === 0 && (
        <p className="text-center my-4 text-yap-500 dark:text-yap-400">
          No posts in this tab. Switch 👻
        </p>
      )}
      {!isLoading && posts.length > 0 && (
        <div>
          {posts.map((post: PostType) => (
            <Post key={post._id} post={post} />
          ))}
          
          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="py-4">
            {isFetchingNextPage && (
              <div className="flex flex-col justify-center">
                <PostSkeleton />
                <PostSkeleton />
              </div>
            )}
            {!hasNextPage && posts.length > 0 && (
              <p className="text-center text-sm text-yap-400 dark:text-yap-500 py-4">
                You've reached the end! 🎉
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default Posts;
