import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Posts, User } from "../types/types";
import { useMutation, useQuery, useQueryClient } from "@tantml:invoke>
<invoke name="axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../utils/date/function";

const Post = ({ post }: { post: Posts }) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ["posts"], });
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
      queryClient.setQueryData(["posts"], (oldPosts: Posts[]) => {
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              likes: updatedLikes,
            };
          }
          return p;
        });
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
    onSuccess: (updatedComments: string[]) => {
      setComment("");
      setShowComments(false);
      queryClient.setQueryData(["posts"], (oldPosts: Posts[]) => {
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              comments: updatedComments,
            };
          }
          return p;
        });
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

  return (
    <div className="bg-white dark:bg-yap-900 border-b border-yap-100 dark:border-yap-800 hover:bg-yap-50 dark:hover:bg-yap-800/50 transition-colors duration-200">
      <div className="p-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Link to={`/profile/${postOwner.username}`} className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full ring-2 ring-yap-100 dark:ring-yap-800 overflow-hidden hover:ring-primary transition-all duration-200">
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
              <div className="flex items-center gap-2 min-w-0">
                <Link 
                  to={`/profile/${postOwner.username}`} 
                  className="font-semibold text-yap-900 dark:text-yap-100 hover:text-primary transition-colors duration-200 truncate"
                >
                  {postOwner.fullName}
                </Link>
                <Link 
                  to={`/profile/${postOwner.username}`}
                  className="text-sm text-yap-500 dark:text-yap-400 hover:underline truncate"
                >
                  @{postOwner.username}
                </Link>
                <span className="text-sm text-yap-400 dark:text-yap-500">·</span>
                <span className="text-sm text-yap-500 dark:text-yap-400">{formattedDate}</span>
              </div>
              {isMyPost && (
                <button
                  onClick={handleDeletePost}
                  className="yap-icon-btn text-yap-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaTrash className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Text */}
            <p className="text-yap-800 dark:text-yap-200 mb-3 leading-relaxed whitespace-pre-wrap break-words">
              {post.text}
            </p>

            {/* Image */}
            {post.image && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-yap-200 dark:border-yap-700">
                <img
                  src={post.image}
                  alt="Post content"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4">
              {/* Comments */}
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-yap-500 dark:text-yap-400 hover:text-primary transition-colors duration-200 group"
              >
                <div className="yap-icon-btn group-hover:bg-primary/10">
                  <FaRegComment className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">
                  {post.comments?.length ?? 0}
                </span>
              </button>

              {/* Repost */}
              <button className="flex items-center gap-2 text-yap-500 dark:text-yap-400 hover:text-accent-green transition-colors duration-200 group">
                <div className="yap-icon-btn group-hover:bg-accent-green/10">
                  <BiRepost className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">0</span>
              </button>

              {/* Like */}
              <button
                onClick={handleLikePost}
                disabled={isLiking}
                className={`flex items-center gap-2 transition-colors duration-200 group ${
                  isLiked 
                    ? 'text-accent-pink' 
                    : 'text-yap-500 dark:text-yap-400 hover:text-accent-pink'
                }`}
              >
                <div className="yap-icon-btn group-hover:bg-accent-pink/10">
                  {isLiking ? (
                    <div className="w-4 h-4 border-2 border-accent-pink border-t-transparent rounded-full animate-spin"></div>
                  ) : isLiked ? (
                    <FaHeart className="w-4 h-4" />
                  ) : (
                    <FaRegHeart className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {post.likes?.length ?? 0}
                </span>
              </button>

              {/* Bookmark */}
              <button className="ml-auto text-yap-500 dark:text-yap-400 hover:text-primary transition-colors duration-200 group">
                <div className="yap-icon-btn group-hover:bg-primary/10">
                  <FaRegBookmark className="w-4 h-4" />
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
                          className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCommentingPost ? "Posting..." : "Comment"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {(post.comments?.length ?? 0) === 0 && (
                    <p className="text-sm text-yap-500 dark:text-yap-400 text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                  {(post.comments ?? []).map((comment) => (
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

const Post = ({ post }: { post: Posts }) => {
  const [comment, setComment] = useState("");

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
      queryClient.invalidateQueries({ queryKey: ["posts"], });
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
          // const errorMessage = error.response?.data;
          console.error("Error during logout:", error);
          toast.error("Something went wrong");
        } else {
          console.error("Unexpected error:", error);
        }
        throw error;
      }
    },
    onSuccess: (updatedLikes: string[]) => {
      queryClient.setQueryData(["posts"], (oldPosts: Posts[]) => {
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            //  queryClient.invalidateQueries({ queryKey: ["posts"] });
            return {
              ...p,
              likes: updatedLikes,
            };
          }
          return p;
        });
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
          // const errorMessage = error.response?.data;
          console.error("Error during logout:", error);
          toast.error("Something went wrong");
        } else {
          console.error("Unexpected error:", error);
        }
        throw error;
      }
    },
    onSuccess: (updatedComments: string[]) => {
      setComment("");
      queryClient.setQueryData(["posts"], (oldPosts: Posts[]) => {
        return oldPosts.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              comments: updatedComments,
            };
          }
          return p;
        });
      });
    },
  });

  const postOwner = post.user;
  const isLiked =
    Array.isArray(post.likes) && post.likes.includes(authUser?._id || "");

  const isMyPost = authUser?._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt || "");

  const isCommenting = false;

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

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profilePicture || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
                {isDeleting && <LoadingSpinner />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.image && (
              <img
                src={post.image}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  (
                    document.getElementById(
                      "comments_modal" + post._id
                    ) as HTMLDialogElement
                  )?.showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments?.length ?? 0}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {(post.comments?.length ?? 0) === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {(post.comments ?? []).map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user?.profilePicture ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user?.fullName}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment.user?.username}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? (
                        <span className="loading loading-spinner loading-md"></span>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post.likes?.length ?? 0}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
