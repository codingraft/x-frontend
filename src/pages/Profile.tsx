import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { POSTS } from "../utils/db/dummy";
import Posts from "./Posts";
import ProfileHeaderSkeleton from "../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "../components/EditProfileModal";
import { useQuery } from "@tanstack/react-query";
import { FormDataEditProfile, User } from "../types/types";
import axios from "axios";
import { formatMemberSinceDate } from "../utils/date/function";
import { useFollow } from "../hooks/useFollow";
import useUpdateUserProfile from "../hooks/useUpdateUserProfile";

const ProfilePage = () => {
  const [coverPicture, setCoverPicture] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [formData] = useState<FormDataEditProfile>({
    fullName: "",
    username: "",
    email: "",
    bio: "",
    link: "",
    newPassword: "",
    currentPassword: "",
  });
  
  const [feedType, setFeedType] = useState("posts");

  const coverImgRef = useRef<HTMLInputElement | null>(null);
  const profileImgRef = useRef<HTMLInputElement | null>(null);
  const { username } = useParams();

  const { data: authUser } = useQuery<User>({
    queryKey: ["authUser"],
  });

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<User>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const user = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/users/profile/${username}`,{
          withCredentials: true,
        });
        return user.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          console.error("Error during logout:", error);
          throw new Error(errorMessage);
        }
        throw error;
      }
    },
  });

  const { updateProfile, isUpdating } = useUpdateUserProfile();
  const { follow, isPending } = useFollow();

  const isMyProfile = authUser?._id === user?._id;
  const memberSince = formatMemberSinceDate(user?.createdAt ?? "");
  const amIFollowing = authUser?.following.includes(user?._id ?? "") ?? false;

  const handleImgChange = (e: ChangeEvent<HTMLInputElement>, state: string) => {
    const file: File | undefined = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (state === "coverImg" && typeof reader.result === "string") {
          setCoverPicture(reader.result);
        }
        if (state === "profileImg" && typeof reader.result === "string") {
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const userFields: (keyof Pick<
    User,
    "fullName" | "username" | "email" | "bio" | "link" 
  >)[] = ["fullName", "username", "email", "bio", "link"];

  // Step 1: Build only changed user fields
  const updatedTextFields = userFields.reduce((acc, key) => {
    if (formData[key] !== authUser?.[key]) {
      acc[key] = formData[key];
    }
  return acc;
}, {} as Partial<Pick<User, "fullName" | "username" | "email" | "bio" | "link">>);

// Step 2: Add changed picture fields
const updatedPictureFields: Partial<Pick<User, "coverPicture" | "profilePicture">> = {};

if (coverPicture !== authUser?.coverPicture && coverPicture !== null) {
  updatedPictureFields.coverPicture = coverPicture;
}

if (profilePicture !== authUser?.profilePicture && profilePicture !== null) {
  updatedPictureFields.profilePicture = profilePicture;
}

// Step 3: Merge everything
const updateProfileFn = () => {
  if (!authUser) return;

  const finalUpdatePayload = {
    ...updatedTextFields,
    ...updatedPictureFields,
  };

  // Don't send empty object
  if (Object.keys(finalUpdatePayload).length === 0) {;
    return;
  }

  updateProfile(finalUpdatePayload);
};

  useEffect(() => {
    refetch();
  }, [username, refetch]);


  return (
    <div className="flex-[4_4_0] min-h-screen bg-yap-50 dark:bg-yap-950">
      {/* HEADER */}
      {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
      {!(isLoading && isRefetching) && !user && (
        <div className="p-8 text-center">
          <p className="text-lg text-yap-600 dark:text-yap-400">User not found</p>
        </div>
      )}
      
      {!isLoading && !isRefetching && user && (
        <div className="flex flex-col">
          {/* Top Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-yap-900/80 backdrop-blur-md border-b border-yap-200 dark:border-yap-800 px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center gap-3 md:gap-6">
              <Link to="/" className="p-1.5 md:p-2 rounded-full hover:bg-yap-100 dark:hover:bg-yap-800 transition-all duration-200">
                <FaArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-yap-600 dark:text-yap-400" />
              </Link>
              <div>
                <h1 className="font-bold text-base md:text-xl text-yap-900 dark:text-yap-100">
                  {user?.fullName}
                </h1>
                <p className="text-xs md:text-sm text-yap-500 dark:text-yap-400">
                  {POSTS?.length} posts
                </p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative bg-yap-200 dark:bg-yap-800">
            <div className="relative group/cover h-32 md:h-48 lg:h-56">
              <img
                src={coverPicture || user?.coverPicture || "/cover.png"}
                className="w-full h-full object-cover"
                alt="Cover"
              />
              {isMyProfile && (
                <button
                  className="absolute top-2 right-2 md:top-3 md:right-3 p-2 md:p-3 bg-yap-900/80 hover:bg-yap-900 text-white rounded-full opacity-0 group-hover/cover:opacity-100 transition-all duration-200"
                  onClick={() => coverImgRef.current?.click()}
                >
                  <MdEdit className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-10 md:-bottom-16 left-4 md:left-6">
              <div className="relative group/avatar">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full ring-2 md:ring-4 ring-white dark:ring-yap-950 overflow-hidden bg-white dark:bg-yap-900">
                  <img
                    src={profilePicture || user?.profilePicture || "/avatar-placeholder.png"}
                    alt={user?.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isMyProfile && (
                  <button
                    className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-1.5 md:p-2 bg-yap-900 dark:bg-white text-white dark:text-yap-900 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 hover:scale-110"
                    onClick={() => profileImgRef.current?.click()}
                  >
                    <MdEdit className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                )}
              </div>
            </div>

            <input
              type="file"
              hidden
              accept="image/*"
              ref={coverImgRef}
              onChange={(e) => handleImgChange(e, "coverImg")}
            />
            <input
              type="file"
              hidden
              accept="image/*"
              ref={profileImgRef}
              onChange={(e) => handleImgChange(e, "profileImg")}
            />
          </div>

          {/* Profile Actions */}
          <div className="flex justify-end px-4 md:px-6 pt-3 md:pt-4 pb-2 md:pb-3 bg-white dark:bg-yap-900">
            {isMyProfile && <EditProfileModal authUser={authUser || null} />}
            {!isMyProfile && (
              <button
                className={`px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                  amIFollowing
                    ? "bg-yap-200 dark:bg-yap-800 text-yap-900 dark:text-yap-100 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                    : "bg-yap-900 dark:bg-white text-white dark:text-yap-900 hover:bg-yap-800 dark:hover:bg-yap-100"
                }`}
                onClick={() => follow(user?._id)}
                disabled={isPending}
              >
                {isPending ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
            {(coverPicture || profilePicture) && (
              <button
                className="ml-2 px-4 md:px-6 py-1.5 md:py-2 bg-yap-900 dark:bg-white text-white dark:text-yap-900 text-sm md:text-base font-semibold rounded-full hover:bg-yap-800 dark:hover:bg-yap-100 transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={updateProfileFn}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-yap-900 border-b border-yap-200 dark:border-yap-800">
            <div className="space-y-2 md:space-y-3 mt-8 md:mt-12">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-yap-900 dark:text-yap-100">
                  {user?.fullName}
                </h2>
                <p className="text-sm md:text-base text-yap-500 dark:text-yap-400">@{user?.username}</p>
              </div>

              {user?.bio && (
                <p className="text-sm md:text-base text-yap-700 dark:text-yap-300 leading-relaxed">
                  {user?.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-yap-600 dark:text-yap-400">
                {user?.link && (
                  <a
                    href={user.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 md:gap-2 hover:text-yap-900 dark:hover:text-yap-100 transition-colors duration-200"
                  >
                    <FaLink className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hover:underline truncate max-w-[200px]">{user.link}</span>
                  </a>
                )}
                <div className="flex items-center gap-1.5 md:gap-2">
                  <IoCalendarOutline className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Joined {memberSince}</span>
                </div>
              </div>

              <div className="flex gap-4 md:gap-6">
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="font-bold text-sm md:text-base text-yap-900 dark:text-yap-100">
                    {user?.following.length}
                  </span>
                  <span className="text-xs md:text-sm text-yap-500 dark:text-yap-400">Following</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="font-bold text-sm md:text-base text-yap-900 dark:text-yap-100">
                    {user?.followers.length}
                  </span>
                  <span className="text-xs md:text-sm text-yap-500 dark:text-yap-400">Followers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-white dark:bg-yap-900 border-b border-yap-200 dark:border-yap-800">
            <button
              className={`flex-1 px-3 md:px-4 py-3 md:py-4 font-semibold text-sm md:text-base transition-all duration-200 relative ${
                feedType === "posts"
                  ? "text-yap-900 dark:text-yap-100"
                  : "text-yap-500 dark:text-yap-400 hover:bg-yap-100 dark:hover:bg-yap-800"
              }`}
              onClick={() => setFeedType("posts")}
            >
              Posts
              {feedType === "posts" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 md:w-16 h-1 bg-yap-900 dark:bg-white rounded-full"></div>
              )}
            </button>
            <button
              className={`flex-1 px-3 md:px-4 py-3 md:py-4 font-semibold text-sm md:text-base transition-all duration-200 relative ${
                feedType === "likes"
                  ? "text-yap-900 dark:text-yap-100"
                  : "text-yap-500 dark:text-yap-400 hover:bg-yap-100 dark:hover:bg-yap-800"
              }`}
              onClick={() => setFeedType("likes")}
            >
              Likes
              {feedType === "likes" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 md:w-16 h-1 bg-yap-900 dark:bg-white rounded-full"></div>
              )}
            </button>
          </div>

          {/* Posts */}
          <Posts
            username={username ?? ""}
            feedType={feedType}
            userId={user?._id ?? ""}
          />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
