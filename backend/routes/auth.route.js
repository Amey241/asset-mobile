import express from "express";
import { loginUser, registerUser, getUsers, getProfile, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.post("/login", loginUser);
router.post("/register", registerUser);

router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

export default router;
