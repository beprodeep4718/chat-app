import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "/";

export const useAuthStore = create((set, get) => ({
  authuser: null,
  isSigningUp: false,
  isSigningIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/profile");
      set({ authuser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authuser: null });
      console.error("Error checking auth:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authuser: res.data });
      toast.success("Account created successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error("Error signing up. Please try again.");
      console.error("Error signing up:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isSigningIn: true });
    try {
      const res = await axiosInstance.post("/auth/signin", data);
      set({ authuser: res.data });
      toast.success("Logged in successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error("Error logging in. Please try again.");
      console.error("Error logging in:", error);
    } finally {
      set({ isSigningIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.get("/auth/signout");
      set({ authuser: null });
      toast.success("Logged out successfully!");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out. Please try again.");
      console.error("Error logging out:", error);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authuser } = get();
    if (!authuser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authuser._id,
      },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null });
  },
}));
