import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { FormEvent } from "react";
import { AuthUser } from "../types/types";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { mutate: logout, isPending } = useMutation({
    mutationFn: async () => {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/logout`,{}, {
          withCredentials: true,
        });
        toast.success("Logout successful");
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
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const { data: authUser } = useQuery<AuthUser>({ queryKey: ["authUser"] });
  const handleLogout = (e: FormEvent<SVGElement>) => {
    e.preventDefault();
    logout();
  };

  return (
    <div className="md:flex-[2_2_0] w-20 md:w-full md:max-w-64 border-r border-yap-200 dark:border-yap-800">
      <div className="sticky top-0 left-0 h-screen flex flex-col px-2 md:px-4 py-4 md:py-6 w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center md:justify-start mb-6 md:mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-yap-900 dark:bg-white rounded-2xl flex items-center justify-center">
            <span className="text-white dark:text-yap-950 font-bold text-xl md:text-2xl">Y</span>
          </div>
          <span className="hidden md:block ml-3 text-xl md:text-2xl font-bold text-yap-900 dark:text-white">
            Yap
          </span>
        </Link>

        {/* Navigation */}
        <ul className="flex flex-col gap-1 md:gap-2 flex-1">
          <li>
            <Link
              to="/"
              className="flex gap-4 items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-xl transition-all duration-200 hover:bg-yap-100 dark:hover:bg-yap-800 group"
            >
              <MdHomeFilled className="w-6 h-6 md:w-7 md:h-7 text-yap-600 dark:text-yap-400 group-hover:text-yap-900 dark:group-hover:text-white" />
              <span className="text-base font-medium hidden md:block text-yap-700 dark:text-yap-200 group-hover:text-yap-900 dark:group-hover:text-white">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className="flex gap-4 items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-xl transition-all duration-200 hover:bg-yap-100 dark:hover:bg-yap-800 group"
            >
              <IoNotifications className="w-6 h-6 md:w-7 md:h-7 text-yap-600 dark:text-yap-400 group-hover:text-yap-900 dark:group-hover:text-white" />
              <span className="text-base font-medium hidden md:block text-yap-700 dark:text-yap-200 group-hover:text-yap-900 dark:group-hover:text-white">Notifications</span>
            </Link>
          </li>
          <li>
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-4 items-center justify-center md:justify-start px-2 md:px-4 py-3 rounded-xl transition-all duration-200 hover:bg-yap-100 dark:hover:bg-yap-800 group"
            >
              <FaUser className="w-5 h-5 md:w-6 md:h-6 text-yap-600 dark:text-yap-400 group-hover:text-yap-900 dark:group-hover:text-white" />
              <span className="text-base font-medium hidden md:block text-yap-700 dark:text-yap-200 group-hover:text-yap-900 dark:group-hover:text-white">Profile</span>
            </Link>
          </li>
        </ul>

        {/* User Profile */}
        {authUser && (
          <div className="mt-auto pt-4 border-t border-yap-200 dark:border-yap-800">
            <div className="flex gap-2 md:gap-3 items-center px-1 md:px-2 py-2 md:py-3 rounded-xl hover:bg-yap-100 dark:hover:bg-yap-800 transition-all duration-200">
              <Link to={`/profile/${authUser?.username}`} className="flex gap-3 items-center flex-1 min-w-0">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full ring-2 ring-yap-200 dark:ring-yap-700">
                    <img src={authUser?.profileImg || "/avatar-placeholder.png"} alt="Profile" />
                  </div>
                </div>
                <div className="hidden md:flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-semibold text-yap-900 dark:text-yap-100 truncate">
                    {authUser?.fullName}
                  </p>
                  <p className="text-xs text-yap-500 dark:text-yap-400 truncate">@{authUser?.username}</p>
                </div>
              </Link>
              {isPending ? (
                <div className="hidden md:block">
                  <div className="w-5 h-5 border-2 border-yap-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <BiLogOut
                  className="w-5 h-5 cursor-pointer text-yap-500 hover:text-red-500 transition-colors duration-200 hidden md:block"
                  onClick={handleLogout}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
