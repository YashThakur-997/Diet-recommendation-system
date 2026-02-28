const UserModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const SALT_ROUNDS = 10;

// ─── Login ────────────────────────────────────────────────────────────────────
const login_handler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.password) {
            return res.status(401).json({ success: false, message: "This account uses Google sign-in. Please sign in with Google." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                age: user.age,
                gender: user.gender,
                bloodGroup: user.bloodGroup,
                height: user.height,
                weight: user.weight,
                bmi: user.bmi,
                medicalConditions: user.medicalConditions,
                allergies: user.allergies,
                medicalNotes: user.medicalNotes,
                primaryGoal: user.primaryGoal,
                activityLevel: user.activityLevel,
                sleepHours: user.sleepHours,
                dietaryType: user.dietaryType,
                dietaryPreferences: user.dietaryPreferences,
                cuisinePreferences: user.cuisinePreferences,
                budget: user.budget,
                mealsPerDay: user.mealsPerDay,
                calories: user.calories,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Signup ───────────────────────────────────────────────────────────────────
const signup_handler = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = new UserModel({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
        });
    } catch (err) {
        next(err);
    }
};

// ─── Get Profile (authenticated) ─────────────────────────────────────────────
const get_profile_handler = async (req, res, next) => {
    try {
        // req.user is set by the auth middleware (contains id, email from JWT)
        const user = await UserModel.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                age: user.age,
                gender: user.gender,
                bloodGroup: user.bloodGroup,
                height: user.height,
                weight: user.weight,
                bmi: user.bmi,
                medicalConditions: user.medicalConditions,
                allergies: user.allergies,
                medicalNotes: user.medicalNotes,
                primaryGoal: user.primaryGoal,
                activityLevel: user.activityLevel,
                sleepHours: user.sleepHours,
                dietaryType: user.dietaryType,
                dietaryPreferences: user.dietaryPreferences,
                cuisinePreferences: user.cuisinePreferences,
                budget: user.budget,
                mealsPerDay: user.mealsPerDay,
                calories: user.calories,
                createdAt: user.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Update Profile (authenticated) ──────────────────────────────────────────
const update_profile_handler = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Whitelist: only allow these fields to be updated (never password/email/username)
        const allowedFields = [
            'age', 'gender', 'bloodGroup',
            'height', 'weight', 'bmi',
            'medicalConditions', 'allergies', 'medicalNotes',
            'primaryGoal', 'activityLevel', 'sleepHours',
            'dietaryType', 'dietaryPreferences', 'cuisinePreferences',
            'budget', 'mealsPerDay', 'calories',
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Auto-calculate BMI if weight and height are provided
        const weight = updates.weight ?? (await UserModel.findById(userId))?.weight;
        const height = updates.height ?? (await UserModel.findById(userId))?.height;
        if (weight && height) {
            const heightM = height / 100;
            updates.bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                age: updatedUser.age,
                gender: updatedUser.gender,
                bloodGroup: updatedUser.bloodGroup,
                height: updatedUser.height,
                weight: updatedUser.weight,
                bmi: updatedUser.bmi,
                medicalConditions: updatedUser.medicalConditions,
                allergies: updatedUser.allergies,
                medicalNotes: updatedUser.medicalNotes,
                primaryGoal: updatedUser.primaryGoal,
                activityLevel: updatedUser.activityLevel,
                sleepHours: updatedUser.sleepHours,
                dietaryType: updatedUser.dietaryType,
                dietaryPreferences: updatedUser.dietaryPreferences,
                cuisinePreferences: updatedUser.cuisinePreferences,
                budget: updatedUser.budget,
                mealsPerDay: updatedUser.mealsPerDay,
                calories: updatedUser.calories,
                createdAt: updatedUser.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ─── Google Sign-In ───────────────────────────────────────────────────────────
const toUserResponse = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    age: user.age,
    gender: user.gender,
    bloodGroup: user.bloodGroup,
    height: user.height,
    weight: user.weight,
    bmi: user.bmi,
    medicalConditions: user.medicalConditions,
    allergies: user.allergies,
    medicalNotes: user.medicalNotes,
    primaryGoal: user.primaryGoal,
    activityLevel: user.activityLevel,
    sleepHours: user.sleepHours,
    dietaryType: user.dietaryType,
    dietaryPreferences: user.dietaryPreferences,
    cuisinePreferences: user.cuisinePreferences,
    budget: user.budget,
    mealsPerDay: user.mealsPerDay,
    calories: user.calories,
    createdAt: user.createdAt,
});

const google_auth_handler = async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: "Missing Google credential" });
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(503).json({
                success: false,
                message: "Google sign-in is not configured. Set GOOGLE_CLIENT_ID in server/.env and restart the server.",
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;
        if (!email) {
            return res.status(400).json({ success: false, message: "Google account email not available" });
        }

        let user = await UserModel.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            const baseUsername = (name || email.split("@")[0]).replace(/\s+/g, "").toLowerCase().slice(0, 20) || "user";
            let username = baseUsername;
            let suffix = 0;
            while (await UserModel.findOne({ username })) {
                suffix += 1;
                username = `${baseUsername}${suffix}`;
            }
            user = new UserModel({
                username,
                email,
                googleId,
            });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: toUserResponse(user),
        });
    } catch (err) {
        next(err);
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout_handler = (_req, res) => {
    res.clearCookie("token");
    res.clearCookie("Authorization");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = { login_handler, signup_handler, logout_handler, get_profile_handler, update_profile_handler, google_auth_handler };
