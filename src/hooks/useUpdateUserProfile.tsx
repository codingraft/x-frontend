import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import {  FormDataEditProfile } from "../types/types";

const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (formData: FormDataEditProfile) => {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/users/update`, formData, {
          withCredentials: true,
        });
        toast.success("Profile updated successfully");
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
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
  });

  return {
    updateProfile,
    isUpdating,
  };
};

export default useUpdateUserProfile;