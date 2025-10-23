import { useQuery } from "@tanstack/react-query";
import { lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";
import { User } from "./types/types";

const Sidebar = lazy(() => import("./components/Sidebar"));
const RightPanel = lazy(() => import("./components/RightPanel"));
const NotificationPage = lazy(() => import("./pages/Notification"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Home = lazy(() => import("./pages/Home"));

function App() {
  const { data: authUser, isLoading } = useQuery<User>({
    queryKey: ["authUser"], 
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center bg-yap-50 dark:bg-yap-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-yap-900 dark:bg-white rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-white dark:text-yap-950 font-bold text-3xl">Y</span>
          </div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-white dark:bg-yap-950">
      {authUser && <Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f9fafb',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f9fafb',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
