import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["deposit", "buy", "sell"],
        },
        asset_class: {
            type: String,
            required: true, // "fiat", "crypto", "stocks"
        },
        symbol: {
            type: String,
            required: true, // "USD", "BTC", "AAPL"
        },
        amount: {
            type: Number,
            required: true,
        },
        price_at_execution: {
            type: Number,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Trade", tradeSchema);
