import express from "express";
import { getPortfolio, getRecommendations, invest, getReport } from "../controllers/finance.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/portfolio", protect, getPortfolio);
router.get("/recommendations", protect, getRecommendations);
router.post("/invest", protect, invest);
router.get("/report", protect, getReport);

export default router;
