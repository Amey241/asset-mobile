import Investment from "../models/investment.model.js";
import Expense from "../models/expense.model.js";
import Asset from "../models/asset.model.js";
import { generateFinancialReport } from "../utils/pdf_generator.js";

// @desc    Log a new expense
// @route   POST /api/finance/expenses
export const logExpense = async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;
        const expense = new Expense({
            user: req.user._id,
            amount,
            category,
            description,
            date: date || new Date()
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate PDF report
// @route   GET /api/finance/report
export const getReport = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get Portfolio Data
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const expenses = await Expense.find({ user: userId, date: { $gte: startOfMonth } });
        const total_expenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const investments = await Investment.find({ user: userId, date: { $gte: startOfMonth } });
        const total_invested = investments.reduce((sum, i) => sum + i.amount, 0);

        const total_income = req.user.monthly_income || 5000;
        const portfolioData = {
            total_income,
            total_expenses,
            remaining_money: total_income - total_expenses - total_invested
        };

        // 2. Get AI Recommendations
        const recommendations = await getAIRecommendationsInternal(req.user.risk_profile);

        // 3. Get Asset Stats
        const assets = await Asset.find({ owner: userId });
        const assetsSummary = {
            total: assets.length,
            available: assets.filter(a => a.status.toLowerCase() === 'available').length,
            assigned: assets.filter(a => a.status.toLowerCase() === 'assigned').length,
            overdue: assets.filter(a => a.status.toLowerCase() === 'overdue').length,
            totalValue: assets.reduce((sum, a) => {
                let val = a.purchasePrice || 0;
                if (a.purchasePrice && a.purchaseDate) {
                    const yearsOld = (new Date() - new Date(a.purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25);
                    const rate = a.category?.toUpperCase() === 'IT' ? 0.20 : 0.10;
                    val = a.purchasePrice * (1 - (rate * Math.max(0, yearsOld)));
                }
                return sum + Math.max(0, val);
            }, 0)
        };

        // 4. Generate PDF
        const pdfBuffer = await generateFinancialReport(req.user, portfolioData, recommendations, assetsSummary);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Report_${now.getFullYear()}_${now.getMonth()+1}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user portfolio
// @route   GET /api/finance/portfolio
export const getPortfolio = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const expenses = await Expense.find({ user: userId, date: { $gte: startOfMonth } });
        const total_expenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const investments = await Investment.find({ user: userId, date: { $gte: startOfMonth } });
        
        const total_income = req.user.monthly_income || 0;
        const remaining_money = total_income - total_expenses;

        res.json({
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            total_income,
            total_expenses,
            remaining_money,
            investments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Internal helper for AI Recommendations
const getAIRecommendationsInternal = async (riskProfile) => {
    const risk = (riskProfile || "medium").toLowerCase();
    const recommendations = [];
    
    if (risk === "high") {
        recommendations.push({
            title: "Crypto Surge Alpha",
            description: "Bitcoin and Ethereum are showing strong momentum. Allocate 30% of remaining funds.",
            suggested_investments: ["Bitcoin", "Ethereum", "Solana"],
            confidence_score: 0.85
        });
        recommendations.push({
            title: "Tech Growth Play",
            description: "High-risk AI startups and tech stocks are undervalued.",
            suggested_investments: ["NVIDIA", "Tesla", "OpenAI Index"],
            confidence_score: 0.78
        });
    } else if (risk === "medium") {
        recommendations.push({
            title: "Balanced Diversifier",
            description: "Mix of index funds and precious metals.",
            suggested_investments: ["S&P 500 ETF", "Gold", "Corporate Bonds"],
            confidence_score: 0.92
        });
        recommendations.push({
            title: "Dividend Strategy",
            description: "Stable returns from high-yield dividend stocks.",
            suggested_investments: ["Real Estate Trusts", "Utilities"],
            confidence_score: 0.88
        });
    } else {
        recommendations.push({
            title: "Safety First",
            description: "Preserve capital with government-backed securities.",
            suggested_investments: ["Treasury Bills", "Fixed Deposits", "Physical Gold"],
            confidence_score: 0.98
        });
    }
    return recommendations;
};

// @desc    Get AI recommendations
// @route   GET /api/finance/recommendations
export const getRecommendations = async (req, res) => {
    try {
        const recommendations = await getAIRecommendationsInternal(req.user.risk_profile);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Invest in an asset
// @route   POST /api/finance/invest
export const invest = async (req, res) => {
    try {
        const { type, amount, risk_level, date } = req.body;
        const userId = req.user._id;

        const investment = new Investment({
            user: userId,
            type,
            amount,
            risk_level: risk_level || "Medium",
            date: date || new Date()
        });

        await investment.save();

        const io = req.app.get("io");
        if (io) {
            io.emit("portfolioUpdated", { message: "New investment made", investment });
        }

        res.status(201).json(investment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
