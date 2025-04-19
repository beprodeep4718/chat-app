import express from "express";
const router = express.Router();
import {
  signup,
  signin,
  signout,
  updateProfile,
  getProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/signout", signout);

router.put("/update-profile", protect, updateProfile);

router.get("/profile", protect, getProfile);

export default router;
