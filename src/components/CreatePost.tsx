import { CiImageOn } from "react-icons/ci";
// import { BsEmojiSmileFill } from "react-icons/bs";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../types/types";
import axios from "axios";
import toast from "react-hot-toast";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [image, setImg] = useState<string | null>(null);

  const imgRef = useRef<HTMLInputElement | null>(null);

  const { data: authUser } = useQuery<User>({
    queryKey: ["authUser"],
  });
  const queryClient = useQueryClient();

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({
      text,
      image,
    }: {
      text: string | null;
      image: string | null;
    }) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/posts/create`,
          {
            text,
            image,
          },
          {
            withCredentials: true,
          }
        );
        toast.success("Post created successfully");
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
      setText("");
      setImg(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPost({ text, image });
  };

  const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];
    const reader: FileReader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImg(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-yap-900 border-b border-yap-100 dark:border-yap-800 p-4 md:p-6">
      <div className="flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-yap-100 dark:ring-yap-800 overflow-hidden">
            <img
              src={authUser?.profilePicture || "/avatar-placeholder.png"}
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form */}
        <form
          className="flex flex-col flex-1 gap-3 md:gap-4 min-w-0"
          onSubmit={handleSubmit}
        >
          <textarea
            className="w-full bg-transparent text-yap-900 dark:text-yap-100 text-base md:text-lg resize-none border-none focus:outline-none placeholder-yap-400 dark:placeholder-yap-500"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          />

          {image && (
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-yap-200 dark:border-yap-700 bg-yap-100 dark:bg-yap-800">
              <button
                type="button"
                className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-yap-900/80 hover:bg-yap-900 text-white rounded-full transition-all duration-200"
                onClick={() => {
                  setImg(null);
                  if (imgRef.current) {
                    imgRef.current.value = "";
                  }
                }}
              >
                <IoCloseSharp className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <img
                src={image}
                className="w-full max-h-96 md:max-h-[600px] object-contain"
                alt="Upload preview"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-yap-100 dark:border-yap-800">
            <div className="flex gap-1 md:gap-2">
              <button
                type="button"
                className="p-1.5 md:p-2 rounded-full hover:bg-yap-100 dark:hover:bg-yap-800 text-yap-900 dark:text-white transition-all duration-200"
                onClick={() => imgRef.current && imgRef.current.click()}
              >
                <CiImageOn className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              {/* <button
                type="button"
                className="p-1.5 md:p-2 rounded-full hover:bg-yap-100 dark:hover:bg-yap-800 text-yap-900 dark:text-white transition-all duration-200"
              >
                <BsEmojiSmileFill className="w-4 h-4 md:w-5 md:h-5" />
              </button> */}
            </div>

            <input
              type="file"
              accept="image/*"
              hidden
              ref={imgRef}
              onChange={handleImgChange}
            />

            <button
              type="submit"
              disabled={isPending || (!text.trim() && !image)}
              className="px-4 md:px-6 py-1.5 md:py-2 bg-yap-900 dark:bg-white text-white dark:text-yap-900 font-medium text-sm md:text-base rounded-full hover:bg-yap-800 dark:hover:bg-yap-100 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white dark:border-yap-900 border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden md:inline">Posting...</span>
                </div>
              ) : (
                "Post"
              )}
            </button>
          </div>
          {isError && (
            <div className="text-red-500 text-xs md:text-sm">
              {error?.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
