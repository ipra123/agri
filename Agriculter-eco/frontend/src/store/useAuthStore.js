import { create } from "zustand";
import api from "../lib/api";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  isLoggingIn: false,
  isRegistering: false,

  checkAuth: async () => {
    try {
      const { data } = await api.get("/auth/profile");
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      set({ user: null, loading: false });
      return null;
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const { data } = await api.post("/auth/login", credentials);
      const { token, ...user } = data;
      set({ user: user, isLoggingIn: false });
      localStorage.setItem("authToken", token);
      toast.success("Login successful!");
      return data;
    } catch (error) {
      set({ isLoggingIn: false });
      toast.error(error?.response?.data?.message || "Login failed");
      throw error;
    }
  },

  register: async (userData) => {
    set({ isRegistering: true });
    try {
      const { data } = await api.post("/auth/register", userData);
      const { token, ...user } = data;
      set({ user: user, isRegistering: false });
      localStorage.setItem("authToken", token);
      toast.success("Registration successful!");
      return data;
    } catch (error) {
      set({ isRegistering: false });
      toast.error(error?.response?.data?.message || "Registration failed");
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      set({ user: null });
      localStorage.removeItem("authToken");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
      throw error;
    }
  },
}));

export default useAuthStore;
