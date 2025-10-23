import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LoginUserData } from "../types/types";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const queryClient = useQueryClient();

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ username, password }: LoginUserData) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
          {
            username,
            password,
          },
          {
            withCredentials: true,
          }
        );
        toast.success("Login successful");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          console.error("Error during login:", error);
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full bg-yap-50 dark:bg-yap-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yap-900 dark:bg-white rounded-2xl mb-4">
            <span className="text-white dark:text-yap-950 font-bold text-3xl">Y</span>
          </div>
          <h1 className="text-4xl font-bold text-yap-900 dark:text-white mb-2">
            Welcome to Yap
          </h1>
          <p className="text-yap-600 dark:text-yap-400">
            Sign in to continue your conversation
          </p>
        </div>

        {/* Login Card */}
        <div className="yap-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-yap-700 dark:text-yap-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yap-400">
                  <MdOutlineMail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  className="w-full yap-input pl-12"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-yap-700 dark:text-yap-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yap-400">
                  <MdPassword className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  className="w-full yap-input pl-12"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {isError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error?.message || "Something went wrong"}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-6 py-3 bg-yap-900 dark:bg-white text-white dark:text-yap-900 font-semibold rounded-xl hover:bg-yap-800 dark:hover:bg-yap-100 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white dark:border-yap-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-yap-600 dark:text-yap-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-yap-900 dark:text-white hover:underline transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-yap-500 dark:text-yap-400">
          <p>© 2025 Yap, Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
