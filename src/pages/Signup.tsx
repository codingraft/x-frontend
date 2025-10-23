import { Link } from "react-router-dom";
import { ChangeEvent, FormEvent, useState } from "react";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SignupUserData } from "../types/types";
import axios from "axios";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: login,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({
      email,
      username,
      fullName,
      password,
    }: SignupUserData) => {
      try {
       await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/signup`,
          {
            email,
            username,
            fullName,
            password,
          },
          {
            withCredentials: true,
          }
        );
        toast.success("Signup successful");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data.message;
          console.error("Error during signup:", error);
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
    login(formData);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full bg-yap-50 dark:bg-yap-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yap-900 dark:bg-white rounded-2xl mb-4">
            <span className="text-white dark:text-yap-950 font-bold text-3xl">Y</span>
          </div>
          <h1 className="text-4xl font-bold text-yap-900 dark:text-white mb-2">
            Join Yap Today
          </h1>
          <p className="text-yap-600 dark:text-yap-400">
            Create your account and start sharing
          </p>
        </div>

        {/* Signup Card */}
        <div className="yap-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-yap-700 dark:text-yap-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yap-400">
                  <MdOutlineMail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="w-full yap-input pl-12"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Username and Full Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yap-700 dark:text-yap-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yap-400">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    className="w-full yap-input pl-12"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yap-700 dark:text-yap-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yap-400">
                    <MdDriveFileRenameOutline className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    className="w-full yap-input pl-12"
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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
                  placeholder="Create a password"
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
                  <span>Creating account...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-yap-600 dark:text-yap-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-yap-900 dark:text-white hover:underline transition-colors duration-200"
              >
                Sign in
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

export default SignUpPage;
