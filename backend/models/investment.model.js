import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["Gold", "Crypto", "Stocks", "Bonds", "Real Estate"],
        },
        amount: {
            type: Number,
            required: true,
        },
        risk_level: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High"],
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Investment", investmentSchema);
