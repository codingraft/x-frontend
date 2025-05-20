import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
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
    error
  } = useMutation({
    mutationFn: async ({
      text,
      image,
    }: {
      text: string | null;
      image: string | null;
    }) => {
      try {
        await axios.post(`/api/v1/posts/create`, {
          text,
          image,
        });
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
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={authUser?.profilePicture || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {image && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                if (imgRef.current) {
                  imgRef.current.value = "";
                }
              }}
            />
            <img
              src={image}
              className="w-full mx-auto h-72 object-contain rounded"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current && imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className="text-red-500">{error?.message}</div>}
      </form>
    </div>
  );
};
export default CreatePost;
