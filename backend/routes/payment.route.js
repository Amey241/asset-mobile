import express from "express";
import { simulatePayment } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/simulate", protect, simulatePayment);

export default router;
