import express from "express";
import {app, server, io} from "./lib/socket.js";

import cookesParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import dotenv from "dotenv";
import connectDb from "./lib/db.js";
import cors from "cors";

import path from "path";

const __dirname = path.resolve();

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookesParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../client/build")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDb();
});
