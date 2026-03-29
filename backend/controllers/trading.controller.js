import User from "../models/user.model.js";
import Trade from "../models/trade.model.js";
import Investment from "../models/investment.model.js";
import axios from "axios";

// @desc    Deposit funds into wallet
// @route   POST /api/trading/wallet/deposit
// @access  Private
export const depositFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Deposit amount must be positive" });
        }

        const user = await User.findById(req.user._id);
        user.wallet_balance += Number(amount);
        await user.save();

        // Log to Trade history
        await Trade.create({
            user: req.user._id,
            type: "deposit",
            asset_class: "fiat",
            symbol: "USD",
            amount: amount,
            price_at_execution: 1.0,
            timestamp: new Date()
        });

        res.json({ message: "Deposit successful", newBalance: user.wallet_balance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Execute a market order
// @route   POST /api/trading/order
// @access  Private
export const executeMarketOrder = async (req, res) => {
    try {
        const { symbol, asset_class, amount_usd, side } = req.body;

        if (side !== "buy") {
            return res.status(501).json({ message: "Sell orders are not yet implemented" });
        }

        const user = await User.findById(req.user._id);
        if (user.wallet_balance < amount_usd) {
            return res.status(400).json({ message: "Insufficient wallet balance" });
        }

        let livePrice = 0;
        try {
            if (asset_class === 'crypto') {
                const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
                livePrice = response.data[symbol.toLowerCase()]?.usd || 0;
            } else {
                // Simulated stock price
                livePrice = 150.0;
            }

            if (livePrice <= 0) throw new Error("Invalid price received");
        } catch (error) {
            return res.status(503).json({ message: `Failed to fetch market price for ${symbol}` });
        }

        const fractionalAmount = amount_usd / livePrice;

        // Atomic-like update: Deduct balance
        user.wallet_balance -= amount_usd;
        await user.save();

        // Log Trade
        await Trade.create({
            user: req.user._id,
            type: "buy",
            asset_class,
            symbol,
            amount: fractionalAmount,
            price_at_execution: livePrice,
            timestamp: new Date()
        });

        // Add to Investment Portfolio
        await Investment.create({
            user: req.user._id,
            type: asset_class.charAt(0).toUpperCase() + asset_class.slice(1),
            amount: amount_usd, // The original code in Python stored original investment value
            risk_level: asset_class === 'crypto' ? 'High' : 'Medium',
            date: new Date()
        });

        res.json({
            message: `Successfully purchased ${fractionalAmount.toFixed(6)} ${symbol.toUpperCase()}`,
            execution_price: livePrice,
            remaining_balance: user.wallet_balance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
