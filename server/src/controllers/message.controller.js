import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInId = req.user._id;
    const users = await User.find({ _id: { $ne: loggedInId } }).select(
      "-password"
    );
    res.status(200).json(users);
  } catch (error) {
    console.log("Get users for sidebar error:", error);
    res
      .status(500)
      .json({ error: "Server error during get users for sidebar" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatId },
        { senderId: chatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Get messages error:", error);
    res.status(500).json({ error: "Server error during get messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;
    let imageUrl;
    if (image) {
      const { secure_url } = await cloudinary.uploader.upload(image, {
        folder: "chat-app/images",
      });
      imageUrl = secure_url;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image : imageUrl,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
  } catch (error) {
    console.log("Send message error:", error);
    res.status(500).json({ error: "Server error during send message" });
  }
};
