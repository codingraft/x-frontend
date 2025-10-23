import { useState } from "react";
import Posts from "./Posts";
import CreatePost from "../components/CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");

  return (
    <div className="flex-[4_4_0] min-h-screen bg-yap-50 dark:bg-yap-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-yap-900/80 backdrop-blur-md border-b border-yap-200 dark:border-yap-800">
        <div className="flex">
          <button
            className={`flex-1 px-3 md:px-4 py-3 md:py-4 font-semibold text-sm md:text-base transition-all duration-200 relative ${
              feedType === "forYou"
                ? "text-yap-900 dark:text-yap-100"
                : "text-yap-500 dark:text-yap-400 hover:bg-yap-100 dark:hover:bg-yap-800"
            }`}
            onClick={() => setFeedType("forYou")}
          >
            For You
            {feedType === "forYou" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 md:w-16 h-1 bg-yap-900 dark:bg-white rounded-full"></div>
            )}
          </button>
          <button
            className={`flex-1 px-3 md:px-4 py-3 md:py-4 font-semibold text-sm md:text-base transition-all duration-200 relative ${
              feedType === "following"
                ? "text-yap-900 dark:text-yap-100"
                : "text-yap-500 dark:text-yap-400 hover:bg-yap-100 dark:hover:bg-yap-800"
            }`}
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 md:w-16 h-1 bg-yap-900 dark:bg-white rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* CREATE POST */}
      <CreatePost />

      {/* POSTS */}
      <Posts feedType={feedType} username="" userId="" />
    </div>
  );
};

export default HomePage;
