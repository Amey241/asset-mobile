import express from "express";
import { loginUser, registerUser, getUsers } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
