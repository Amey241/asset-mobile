import User from "../models/user.model.js";

export const simulatePayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id; // From auth.middleware

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Valid amount is required" });
        }

        // Simulate a tiny delay for realism if someone tests it directly via API
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = req.user; // Retrieved from protect middleware
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.wallet_balance = (user.wallet_balance || 0) + amount; 
        await user.save();

        return res.status(200).json({ 
            success: true, 
            message: "Mock payment processed successfully",
            wallet_balance: user.wallet_balance,
            transaction_id: `txn_sim_${Date.now()}`
        });
        
    } catch (error) {
        console.error("Simulated payment error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
