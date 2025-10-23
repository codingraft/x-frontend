import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Posts, User } from "../types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { formatPostDate } from "../utils/date/function";

const Post = ({ post }: { post: Posts }) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [allComments, setAllComments] = useState(post.comments || []);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(post.hasMoreComments || false);

  const { data: authUser } = useQuery<User>({
    queryKey: ["authUser"],
  });

  const queryClient = useQueryClient();
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/v1/posts/${post._id}`,
          {
            withCredentials: true,
          }
        );
        toast.success("Post deleted successfully");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          console.error("Error during logout:", error);
          toast.error(errorMessage || "Something went wrong");
        } else {
          console.error("Unexpected error:", error);
        }
      }
    },
    onSuccess: () => {
      // Invalidate all posts queries to refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/posts/like/${post._id}`, {},
          {
            withCredentials: true,
          }
        );
        console.log("response", response);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error during logout:", error);
          toast.error("Something went wrong");
        } else {
          console.error("Unexpected error:", error);
        }
        throw error;
      }
    },
    onSuccess: (updatedLikes: string[]) => {
      // Update all possible query keys
      queryClient.setQueryData(["posts", "forYou", "", ""], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Posts) => 
              p._id === post._id ? { ...p, likes: updatedLikes } : p
            ),
          })),
        };
      });
      
      queryClient.setQueryData(["posts", "following", "", ""], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Posts) => 
              p._id === post._id ? { ...p, likes: updatedLikes } : p
            ),
          })),
        };
      });

      // Update user posts and likes queries
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Posts) => 
              p._id === post._id ? { ...p, likes: updatedLikes } : p
            ),
          })),
        };
      });
    },
  });

  const { mutate: commentPost, isPending: isCommentingPost } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/posts/comment/${post._id}`,
          {
            text: comment,
          },
          {
            withCredentials: true,
          }
        );
        console.log("response", response);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error during logout:", error);
          toast.error("Something went wrong");
        } else {
          console.error("Unexpected error:", error);
        }
        throw error;
      }
    },
    onSuccess: (response: any) => {
      setComment("");
      toast.success("Comment posted!");
      
      // Update local comments with the response
      setAllComments(response.comments);
      setHasMoreComments(response.hasMoreComments);
      
      // Update all possible query keys
      queryClient.setQueryData(["posts", "forYou", "", ""], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Posts) => 
              p._id === post._id 
                ? { 
                    ...p, 
                    comments: response.comments,
                    totalComments: response.totalComments,
                    hasMoreComments: response.hasMoreComments
                  } 
                : p
            ),
          })),
        };
      });
      
      queryClient.setQueryData(["posts", "following", "", ""], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Posts) => 
              p._id === post._id 
                ? { 
                    ...p, 
                    comments: response.comments,
                    totalComments: response.totalComments,
                    hasMoreComments: response.hasMoreComments
                  } 
                : p
            ),
          })),
        };
      });

      // Update user posts and likes queries
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((p: Posts) => 
              p._id === post._id 
                ? { 
                    ...p, 
                    comments: response.comments,
                    totalComments: response.totalComments,
                    hasMoreComments: response.hasMoreComments
                  } 
                : p
            ),
          })),
        };
      });
    },
  });

  const postOwner = post.user;
  const isLiked =
    Array.isArray(post.likes) && post.likes.includes(authUser?._id || "");

  const isMyPost = authUser?._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt || "");

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCommentingPost) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };

  const loadMoreComments = async () => {
    setLoadingMoreComments(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/posts/${post._id}/comments?skip=${allComments.length}&limit=10`,
        { withCredentials: true }
      );
      setAllComments([...allComments, ...response.data.data]);
      setHasMoreComments(response.data.pagination.hasMore);
    } catch (error) {
      console.error("Error loading more comments:", error);
      toast.error("Failed to load more comments");
    } finally {
      setLoadingMoreComments(false);
    }
  };

  return (
    <div className="bg-white dark:bg-yap-900 border-b border-yap-100 dark:border-yap-800 hover:bg-yap-50 dark:hover:bg-yap-800/50 transition-colors duration-200">
      <div className="p-4 md:p-6">
        <div className="flex gap-3 md:gap-4">
          {/* Avatar */}
          <Link to={`/profile/${postOwner.username}`} className="flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-yap-100 dark:ring-yap-800 overflow-hidden hover:ring-yap-900 dark:hover:ring-white transition-all duration-200">
              <img 
                src={postOwner.profilePicture || "/avatar-placeholder.png"} 
                alt={postOwner.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-wrap">
                <Link 
                  to={`/profile/${postOwner.username}`} 
                  className="font-semibold text-sm md:text-base text-yap-900 dark:text-yap-100 hover:text-yap-700 dark:hover:text-yap-300 transition-colors duration-200 truncate"
                >
                  {postOwner.fullName}
                </Link>
                <Link 
                  to={`/profile/${postOwner.username}`}
                  className="text-xs md:text-sm text-yap-500 dark:text-yap-400 hover:underline truncate"
                >
                  @{postOwner.username}
                </Link>
                <span className="text-xs md:text-sm text-yap-400 dark:text-yap-500">·</span>
                <span className="text-xs md:text-sm text-yap-500 dark:text-yap-400">{formattedDate}</span>
              </div>
              {isMyPost && (
                <button
                  onClick={handleDeletePost}
                  className="yap-icon-btn text-yap-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 md:p-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaTrash className="w-3 h-3 md:w-4 md:h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Text */}
            <p className="text-sm md:text-base text-yap-800 dark:text-yap-200 mb-2 md:mb-3 leading-relaxed whitespace-pre-wrap break-words">
              {post.text}
            </p>

            {/* Image */}
            {post.image && (
              <div className="mb-3 md:mb-4 rounded-xl md:rounded-2xl overflow-hidden border border-yap-200 dark:border-yap-700 bg-yap-100 dark:bg-yap-800">
                <img
                  src={post.image}
                  alt="Post content"
                  className="w-full max-h-96 md:max-h-[600px] object-contain"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-6 mt-3 md:mt-4">
              {/* Comments */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 md:gap-2 text-yap-500 dark:text-yap-400 hover:text-yap-900 dark:hover:text-white transition-colors duration-200 group"
              >
                <div className="p-1.5 md:p-2 rounded-full transition-all duration-200 hover:bg-yap-100 dark:hover:bg-yap-800">
                  <FaRegComment className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span className="text-xs md:text-sm font-medium">
                  {post.comments?.length ?? 0}
                </span>
              </button>

              {/* Repost */}
              <button className="flex items-center gap-1 md:gap-2 text-yap-500 dark:text-yap-400 hover:text-yap-900 dark:hover:text-white transition-colors duration-200 group">
                <div className="p-1.5 md:p-2 rounded-full transition-all duration-200 hover:bg-yap-100 dark:hover:bg-yap-800">
                  <BiRepost className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm font-medium">0</span>
              </button>

              {/* Like */}
              <button
                onClick={handleLikePost}
                disabled={isLiking}
                className={`flex items-center gap-1 md:gap-2 transition-colors duration-200 group ${
                  isLiked 
                    ? 'text-yap-900 dark:text-white' 
                    : 'text-yap-500 dark:text-yap-400 hover:text-yap-900 dark:hover:text-white'
                }`}
              >
                <div className="p-1.5 md:p-2 rounded-full transition-all duration-200 hover:bg-yap-100 dark:hover:bg-yap-800">
                  {isLiking ? (
                    <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-yap-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isLiked ? (
                    <FaHeart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  ) : (
                    <FaRegHeart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium">
                  {post.likes?.length ?? 0}
                </span>
              </button>

              {/* Bookmark */}
              <button className="ml-auto text-yap-500 dark:text-yap-400 hover:text-yap-900 dark:hover:text-white transition-colors duration-200 group">
                <div className="p-1.5 md:p-2 rounded-full transition-all duration-200 hover:bg-yap-100 dark:hover:bg-yap-800">
                  <FaRegBookmark className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-yap-200 dark:border-yap-700">
                {/* Comment Form */}
                <form onSubmit={handlePostComment} className="mb-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full ring-2 ring-yap-100 dark:ring-yap-800 overflow-hidden flex-shrink-0">
                      <img 
                        src={authUser?.profilePicture || "/avatar-placeholder.png"} 
                        alt="Your avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <textarea
                        className="w-full yap-input resize-none text-sm"
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!comment.trim() || isCommentingPost}
                          className="px-4 py-1.5 bg-yap-900 dark:bg-white text-white dark:text-yap-900 text-sm font-medium rounded-full hover:bg-yap-800 dark:hover:bg-yap-100 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCommentingPost ? "Posting..." : "Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List with max height and scroll */}
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-custom">
                  {allComments.length === 0 && (
                    <p className="text-sm text-yap-500 dark:text-yap-400 text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                  {allComments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full ring-2 ring-yap-100 dark:ring-yap-800 overflow-hidden flex-shrink-0">
                        <img
                          src={comment.user?.profilePicture || "/avatar-placeholder.png"}
                          alt={comment.user?.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 bg-yap-50 dark:bg-yap-800 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-yap-900 dark:text-yap-100">
                            {comment.user?.fullName}
                          </span>
                          <span className="text-xs text-yap-500 dark:text-yap-400">
                            @{comment.user?.username}
                          </span>
                        </div>
                        <p className="text-sm text-yap-700 dark:text-yap-300">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Load More Comments Button */}
                  {hasMoreComments && (
                    <div className="flex justify-center py-3">
                      <button
                        onClick={loadMoreComments}
                        disabled={loadingMoreComments}
                        className="px-4 py-2 text-sm font-medium text-yap-600 dark:text-yap-400 hover:text-yap-900 dark:hover:text-white hover:bg-yap-100 dark:hover:bg-yap-800 rounded-full transition-all duration-200"
                      >
                        {loadingMoreComments ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-yap-600 dark:border-yap-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                          </div>
                        ) : (
                          `Load more comments (${(post.totalComments || 0) - allComments.length} remaining)`
                        )}
                      </button>
                    </div>
                  )}

                  {allComments.length > 0 && !hasMoreComments && (
                    <div className="text-center py-2">
                      <p className="text-xs text-yap-400 dark:text-yap-500">
                        {allComments.length} {allComments.length === 1 ? 'comment' : 'comments'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
