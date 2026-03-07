import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app = express();

app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

import authRoutes from "./routes/auth.route.js";
import assetRoutes from "./routes/asset.route.js";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected with Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
        process.exit(1);
    }
}

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Error starting server", error);
        })
        app.listen(3000, "0.0.0.0", () => {
            console.log("Server is running on http://0.0.0.0:3000");
        });
    })
    .catch((error) => {
        console.log("Failed to connect to MongoDB in server", error);
    });
