import express from "express";
import { depositFunds, executeMarketOrder } from "../controllers/trading.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/wallet/deposit", protect, depositFunds);
router.post("/order", protect, executeMarketOrder);

export default router;
