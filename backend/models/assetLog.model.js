import mongoose from "mongoose";

const assetLogSchema = new mongoose.Schema(
    {
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: ["create", "update", "delete", "scan", "assign"],
        },
        message: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        latitude: Number,
        longitude: Number,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    }
);

export default mongoose.model("AssetLog", assetLogSchema);
