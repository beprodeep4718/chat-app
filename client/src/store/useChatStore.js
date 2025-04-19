import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isMessageLoading: false,
  isUsersLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("message/users");
      set({ users: response.data });
    } catch (error) {
      toast.error("Failed to fetch users");
      console.log(error);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const response = await axiosInstance.get(`message/${userId}`);
      set({ messages: response.data });
      const { messages } = get();
      console.log(messages);
    } catch (error) {
      toast.error("Failed to fetch messages");
      console.log(error);
    } finally {
      set({ isMessageLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const response = await axiosInstance.post(
        `message/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, response.data] });
    } catch (error) {
      toast.error("Failed to send message");
      console.log(error);
    }
  },
  subscribeToMessgages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentToSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentToSelectedUser) return;
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },
}));
