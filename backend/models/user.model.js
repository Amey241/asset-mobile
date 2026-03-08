import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "staff"],
            default: "staff",
        },
        monthly_income: {
            type: Number,
            default: 0,
        },
        risk_profile: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
