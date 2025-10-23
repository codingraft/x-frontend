import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const defaultQueryFn = async () => {
  try {
    
    const user = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`,{
      withCredentials: true,
    });
    // console.log(user);
    return user.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // const errorMessage = error.response?.data.message;
      console.error("Error during fetching user:", error);
      toast.error("Login required");
      return null;
    } else {
      console.error("Unexpected error:", error);
    }
  }
};
const queryClient = new QueryClient({
  // Default query function
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      queryFn: defaultQueryFn,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
