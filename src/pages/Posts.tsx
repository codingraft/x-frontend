import { useQuery } from "@tanstack/react-query";
import Post from "../components/Post";
import PostSkeleton from "../components/skeletons/PostSkeleton";
import axios from "axios";
import toast from "react-hot-toast";
import { PostType } from "../types/types";
import { useEffect } from "react";
// import { useParams } from "react-router-dom";

const Posts = ({
  feedType,
  username,
  userId,
}: {
  feedType: string;
  username: string;
  userId: string;
}) => {
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

  // console.log("POST_ENDPOINT", POST_ENDPOINT);

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<PostType[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const posts = await axios.get(POST_ENDPOINT, {
          withCredentials: true,
        });
        // console.log(posts.data.data);
        return posts.data.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          console.error("Error during logout:", error);
          toast.error(errorMessage || "Something went wrong");
          return [];
        } else {
          console.error("Unexpected error:", error);
        }
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, username, refetch]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!(isLoading || isRefetching) && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!(isLoading || isRefetching) && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
