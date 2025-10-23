import { Link } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Notification } from "../types/types";
import { useState } from "react";

const NotificationPage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  
  const {data: notifications, isLoading} = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const notifications = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/notifications`, {
          withCredentials: true,
        });
        return notifications.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error during logout:", error);
        }
      }
    },
  });

  const {mutate: deleteNotification} = useMutation({
    mutationFn: async () => {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/notifications`,{
          withCredentials: true,
        });
        toast.success("Notifications deleted successfully");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error during logout:", error);
          toast.error("Something went wrong");
        }
        else {
          console.error("Unexpected error:", error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setShowMenu(false);
    },
  });

  const deleteNotifications = () => {
    deleteNotification();
  };

  return (
    <div className="flex-[4_4_0] min-h-screen bg-yap-50 dark:bg-yap-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-yap-900/80 backdrop-blur-md border-b border-yap-200 dark:border-yap-800">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-bold text-yap-900 dark:text-yap-100">
            Notifications
          </h1>
          <div className="relative">
            <button
              className="yap-icon-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <HiDotsVertical className="w-5 h-5 text-yap-600 dark:text-yap-400" />
            </button>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 yap-card p-2 z-20">
                  <button
                    onClick={deleteNotifications}
                    className="w-full text-left px-4 py-2 text-sm text-yap-700 dark:text-yap-300 hover:bg-yap-100 dark:hover:bg-yap-800 rounded-lg transition-colors duration-200"
                  >
                    Delete all notifications
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-16 h-16 bg-yap-100 dark:bg-yap-800 rounded-full flex items-center justify-center mb-4">
            <IoSettingsOutline className="w-8 h-8 text-yap-400" />
          </div>
          <p className="text-lg font-semibold text-yap-900 dark:text-yap-100 mb-2">
            No notifications yet
          </p>
          <p className="text-sm text-yap-500 dark:text-yap-400">
            When you get notifications, they'll show up here
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications?.map((notification: Notification) => (
        <Link
          key={notification._id}
          to={`/profile/${notification.from.username}`}
          className="block bg-white dark:bg-yap-900 border-b border-yap-100 dark:border-yap-800 hover:bg-yap-50 dark:hover:bg-yap-800/50 transition-colors duration-200"
        >
          <div className="flex gap-4 p-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              {notification.type === "follow" && (
                <div className="w-10 h-10 bg-yap-100 dark:bg-yap-800 rounded-full flex items-center justify-center">
                  <FaUser className="w-5 h-5 text-yap-900 dark:text-white" />
                </div>
              )}
              {notification.type === "like" && (
                <div className="w-10 h-10 bg-yap-100 dark:bg-yap-800 rounded-full flex items-center justify-center">
                  <FaHeart className="w-5 h-5 text-yap-900 dark:text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full ring-2 ring-yap-100 dark:ring-yap-800 overflow-hidden flex-shrink-0">
                  <img
                    src={notification.from.profileImg || "/avatar-placeholder.png"}
                    alt={notification.from.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-yap-800 dark:text-yap-200">
                    <span className="font-semibold text-yap-900 dark:text-yap-100">
                      @{notification.from.username}
                    </span>{" "}
                    <span className="text-yap-600 dark:text-yap-400">
                      {notification.type === "follow"
                        ? "started following you"
                        : "liked your post"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default NotificationPage;
