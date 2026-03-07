import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        issueDate: {
            type: Date,
            default: Date.now,
        },
        returnDate: Date,
        status: {
            type: String,
            enum: ["issued", "returned"],
            default: "issued",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
