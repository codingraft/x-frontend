import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useFollow } from "../hooks/useFollow";
import { SuggestedUser } from "../types/types";
// import LoadingSpinner from "./LoadingSpinner";
import RightPanelSkeleton from "./skeletons/RightPanelSkeleton";

const RightPanel = () => {
  const { data: suggestedUsers, isLoading } = useQuery<SuggestedUser[]>({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const suggestedUsers = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/users/suggested`,{
          withCredentials: true,
        });
        return suggestedUsers.data;
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

  const { follow, isPending } = useFollow();

  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

  return (
    <div className="hidden lg:block w-full lg:max-w-80 border-l border-yap-100 dark:border-yap-800">
      <div className="sticky top-0 p-4 md:p-6">
        <div className="bg-yap-50 dark:bg-yap-800 rounded-xl md:rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-yap-900 dark:text-yap-100 mb-4 md:mb-6">Who to follow</h2>
          <div className="space-y-3 md:space-y-4">
            {isLoading ? (
              <RightPanelSkeleton />
            ) : suggestedUsers?.length === 0 ? (
              <p className="text-xs md:text-sm text-yap-500 dark:text-yap-400">No suggestions available</p>
            ) : (
              suggestedUsers?.map((user) => (
                <Link
                  to={`/profile/${user.username}`}
                  key={user._id}
                  className="flex items-center gap-3 md:gap-4 group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-yap-200 dark:ring-yap-700 group-hover:ring-yap-900 dark:group-hover:ring-white transition-all duration-200 overflow-hidden flex-shrink-0">
                    <img
                      src={user.profilePicture || "/avatar-placeholder.png"}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base text-yap-900 dark:text-yap-100 truncate group-hover:text-yap-700 dark:group-hover:text-yap-300 transition-colors duration-200">
                      {user.fullName}
                    </p>
                    <p className="text-xs md:text-sm text-yap-500 dark:text-yap-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                    disabled={isPending}
                    className="px-3 md:px-4 py-1 md:py-1.5 bg-yap-900 dark:bg-white text-white dark:text-yap-900 text-xs md:text-sm font-medium rounded-full hover:bg-yap-700 dark:hover:bg-yap-100 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {isPending ? (
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white dark:border-yap-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Follow"
                    )}
                  </button>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
