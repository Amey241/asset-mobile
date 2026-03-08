import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({ path: "./.env" });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Expose io to the routes
app.set("io", io);

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
import financeRoutes from "./routes/finance.route.js";

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/finance", financeRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

// Socket setup
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// State variables for simulated markets
let mockPrices = {
    Stocks: 25400,
    Bonds: 1050,
    RealEstate: 5500,
    MutualFunds: 1250
};

// Real-Time Market Risk Simulator => Real-Time Crypto & Gold Tracker + Simulated Markets
setInterval(async () => {
    try {
        // Fetch real prices from CoinGecko (free public API)
        // Using IDs: bitcoin, ethereum, tether-gold for demo
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether-gold&vs_currencies=inr&include_24hr_change=true');
        const data = await response.json();

        // Calculate a "risk" metric based on 24h change for the UI's visual cues
        const getRiskFromChange = (change) => {
            if (change < -5) return "Extreme";
            if (change < 0) return "High";
            if (change < 5) return "Medium";
            return "Low";
        };

        // Simulate random walk for other markets
        const simulateChange = (currentPrice, volatility) => {
            const changePercent = (Math.random() - 0.5) * volatility;
            const newPrice = currentPrice * (1 + changePercent / 100);
            return { price: newPrice, change: changePercent };
        };

        const stocksUpdate = simulateChange(mockPrices.Stocks, 1.5);
        mockPrices.Stocks = stocksUpdate.price;

        const bondsUpdate = simulateChange(mockPrices.Bonds, 0.2);
        mockPrices.Bonds = bondsUpdate.price;

        const realEstateUpdate = simulateChange(mockPrices.RealEstate, 0.5);
        mockPrices.RealEstate = realEstateUpdate.price;

        const mutualFundsUpdate = simulateChange(mockPrices.MutualFunds, 1.0);
        mockPrices.MutualFunds = mutualFundsUpdate.price;

        const updates = {
            Crypto: {
                price: data.bitcoin?.inr || 0,
                change: data.bitcoin?.inr_24h_change || 0,
                risk: getRiskFromChange(data.bitcoin?.inr_24h_change || 0)
            },
            Gold: {
                price: data['tether-gold']?.inr || 0,
                change: data['tether-gold']?.inr_24h_change || 0,
                risk: getRiskFromChange(data['tether-gold']?.inr_24h_change || 0)
            },
            Stocks: {
                price: stocksUpdate.price,
                change: stocksUpdate.change,
                risk: getRiskFromChange(stocksUpdate.change)
            },
            Bonds: {
                price: bondsUpdate.price,
                change: bondsUpdate.change,
                risk: "Low" // Bonds typically low risk
            },
            RealEstate: {
                price: realEstateUpdate.price,
                change: realEstateUpdate.change,
                risk: "Medium"
            },
            MutualFunds: {
                price: mutualFundsUpdate.price,
                change: mutualFundsUpdate.change,
                risk: getRiskFromChange(mutualFundsUpdate.change)
            }
        };

        io.emit("marketUpdate", updates);
    } catch (error) {
        console.error("Failed to fetch live market data", error.message);
    }
}, 15000); // Poll every 15 seconds to respect rate limits

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
        httpServer.listen(process.env.PORT || 3000, "0.0.0.0", () => {
            console.log(`Server is running on http://0.0.0.0:${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        console.log("Failed to connect to MongoDB in server", error);
    });
