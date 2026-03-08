import express from "express";
import { getAssets, getStats, getAssetByCode, createAsset, deleteAsset, getRecentActivity, updateAsset, getAssetById, getAssetHistory } from "../controllers/asset.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Specific routes first
router.get("/", protect, getAssets);
router.post("/", protect, createAsset);
router.get("/stats", protect, getStats);
router.get("/activity", protect, getRecentActivity);
router.get("/code/:code", protect, getAssetByCode);

// Parameterized routes last so they don't block static routes like /stats
router.get("/:id", protect, getAssetById);
router.get("/:id/history", protect, getAssetHistory);
router.patch("/:id", protect, updateAsset);
router.delete("/:id", protect, deleteAsset);

export default router;
