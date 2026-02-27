let mongoose = require('mongoose');
let dotenv = require('dotenv');
const { buildProfileSummary } = require('../services/profile');

dotenv.config();

let userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    bmi: { type: Number, required: true },
    medicalConditions: { type: [String], default: [] },
    dietaryPreferences: { type: [String], default: [] },
    activityLevel: { type: String, required: true },
    cuisinePreferences: { type: [String], default: [] },
    primaryGoal: { type: String, required: true },
    sleepHours: { type: Number, required: true },
    allergies: { type: [String], default: [] },
    budget: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

let UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;