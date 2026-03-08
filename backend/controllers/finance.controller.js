import Investment from "../models/investment.model.js";
import PDFDocument from "pdfkit";

// @desc    Generate PDF report
// @route   GET /api/finance/report
// @access  Public (so browser can open it directly)
export const getReport = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;

        let investments = [];
        if (userId) {
            investments = await Investment.find({ user: userId }).sort({ date: -1 });
        } else {
            investments = await Investment.find().sort({ date: -1 });
        }

        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const total_income = 5000;
        const total_expenses = 2000;
        const remaining_money = total_income - total_expenses - totalInvested;

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=AssetPro_Report.pdf');

        doc.pipe(res);

        doc.fontSize(24).fillColor('#1a237e').text('AssetPro Financial Report', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(16).fillColor('#000').text('Financial Overview', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Monthly Income: Rs. ${total_income}`);
        doc.text(`Monthly Expenses: Rs. ${total_expenses}`);
        doc.text(`Total Investments: Rs. ${totalInvested}`);
        doc.fillColor(remaining_money >= 0 ? '#4caf50' : '#f44336').text(`Remaining Budget: Rs. ${remaining_money}`);
        doc.moveDown(2);

        doc.fontSize(16).fillColor('#000').text('Recent Investments', { underline: true });
        doc.moveDown(0.5);

        if (investments.length > 0) {
            investments.forEach((inv, i) => {
                doc.fontSize(12).text(`${i + 1}. ${inv.type} - Rs. ${inv.amount}`, { continued: true });
                doc.fillColor('#757575').text(` (${inv.risk_level} Risk) on ${new Date(inv.date).toLocaleDateString()}`);
                doc.fillColor('#000');
            });
        } else {
            doc.text('No investments found on record.');
        }

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user portfolio
// @route   GET /api/finance/portfolio
// @access  Private
export const getPortfolio = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;

        let investments = [];
        if (userId) {
            investments = await Investment.find({ user: userId }).sort({ date: -1 });
        }

        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

        const total_income = req.user ? (req.user.monthly_income || 0) : 0;
        const total_expenses = 0;
        const remaining_money = total_income - total_expenses - totalInvested;

        res.json({
            total_income,
            total_expenses,
            remaining_money: remaining_money > 0 ? remaining_money : 0,
            investments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI recommendations
// @route   GET /api/finance/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
    try {
        // Mock dynamic recommendations based on user's remaining money
        res.json([
            {
                title: "Diversify with Stocks",
                description: "The market is showing upward trends. Allocating a portion to index funds is recommended.",
                confidence_score: 0.85,
                suggested_investments: ["Stocks", "Gold"]
            },
            {
                title: "High-Yield Bonds",
                description: "Secure your savings with government bonds for guaranteed minimal risk returns.",
                confidence_score: 0.92,
                suggested_investments: ["Bonds"]
            }
        ]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Invest in an asset
// @route   POST /api/finance/invest
// @access  Private
export const invest = async (req, res) => {
    try {
        const { type, amount, risk_level, date } = req.body;

        const userId = req.user ? req.user._id : null;
        if (!userId) {
            return res.status(400).json({ message: "User context not found. Please log in." });
        }

        // Fetch user investments to calculate remaining budget
        const investments = await Investment.find({ user: userId });
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

        // Income is pulled from the user model instead of hardcoded 5000
        const total_income = req.user.monthly_income || 0;
        const total_expenses = 0; // Keeping 0 until expense tracking is fully integrated
        const remaining_money = total_income - total_expenses - totalInvested;

        if (amount > remaining_money) {
            return res.status(400).json({ message: `Insufficient budget. You only have ₹${remaining_money} remaining this month.` });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: "Investment amount must be greater than 0." });
        }

        const investment = new Investment({
            user: userId,
            type,
            amount,
            risk_level: risk_level || "Medium",
            date: date || new Date()
        });

        await investment.save();

        // Emit real-time event
        const io = req.app.get("io");
        if (io) {
            io.emit("portfolioUpdated", { message: "New investment made", investment });
        }

        res.status(201).json(investment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
