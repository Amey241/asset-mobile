import express from "express";
import { getAssets, getAssetByCode, createAsset, deleteAsset, getRecentActivity, updateAsset } from "../controllers/asset.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAssets);
router.get("/activity", protect, getRecentActivity);
router.get("/code/:code", protect, getAssetByCode);
router.patch("/:id", protect, updateAsset);
router.delete("/:id", protect, deleteAsset);
router.post("/", protect, createAsset);

export default router;
