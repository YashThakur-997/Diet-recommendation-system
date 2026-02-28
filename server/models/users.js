let mongoose = require('mongoose');
let dotenv = require('dotenv');
const { buildProfileSummary } = require('../services/profile');

dotenv.config();

let userSchema = new mongoose.Schema({
    // ─── Auth fields ─────────────────────────────────────────────────────────
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },  // omitted for Google sign-in
    googleId: { type: String, required: false, sparse: true, unique: true },

    // ─── Basic Body Metrics ──────────────────────────────────────────────────
    age: { type: Number },
    gender: { type: String },
    bloodGroup: { type: String },
    height: { type: Number },       // stored in cm
    weight: { type: Number },       // stored in kg
    bmi: { type: Number },

    // ─── Medical ─────────────────────────────────────────────────────────────
    medicalConditions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    medicalNotes: { type: String, default: '' },

    // ─── Lifestyle & Goals ───────────────────────────────────────────────────
    primaryGoal: { type: String },
    activityLevel: { type: String },
    sleepHours: { type: Number },

    // ─── Food Preferences ────────────────────────────────────────────────────
    dietaryType: { type: String },
    dietaryPreferences: { type: [String], default: [] },
    cuisinePreferences: { type: [String], default: [] },
    budget: { type: String },
    mealsPerDay: { type: Number, default: 3 },
    calories: { type: Number },

    // ─── Timestamps ──────────────────────────────────────────────────────────
    createdAt: { type: Date, default: Date.now }
});

let UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;