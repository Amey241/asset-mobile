import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const sanitizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: sanitizedEmail });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password: it can be legacy plaintext or bcrypt hashed
        let isMatch = false;
        if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (user.password === password); // Legacy plain-text support
        }

        if (isMatch) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret", {
                expiresIn: "30d",
            });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Get all users for assignment
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const sanitizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: sanitizedEmail });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: sanitizedEmail,
            password: hashedPassword,
            role: role || "staff",
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                monthly_income: user.monthly_income,
                risk_profile: user.risk_profile,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.body.monthly_income !== undefined) {
                user.monthly_income = req.body.monthly_income;
            }
            if (req.body.risk_profile) {
                user.risk_profile = req.body.risk_profile;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                monthly_income: updatedUser.monthly_income,
                risk_profile: updatedUser.risk_profile,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
