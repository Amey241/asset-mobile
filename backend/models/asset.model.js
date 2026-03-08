import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true, // This will be used in QR
    },
    name: {
      type: String,
      required: true,
    },
    category: String,
    description: String,
    purchaseDate: Date,
    purchasePrice: {
      type: Number,
      default: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    conditionStatus: {
      type: String,
      enum: ["new", "good", "fair", "poor", "damaged"],
      default: "good",
    },
    status: {
      type: String,
      enum: ["available", "assigned", "maintenance"],
      default: "available",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Asset", assetSchema);
