/**
 * controllers/mealplan.controller.js
 * Handles meal-plan generation requests (both streaming and non-streaming).
 */
const ollama = require("../services/ollama");
const mealPlan = require("../services/mealplan");
const profile = require("../services/profile");

const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "adrienbrault/biomistral-7b:Q5_K_M";

// ─── List available Ollama models ─────────────────────────────────────────────
const listModels = async (_req, res, next) => {
    try {
        const models = await ollama.listModels();
        res.json({ success: true, models, defaultModel: DEFAULT_MODEL });
    } catch (err) {
        next(err);
    }
};

// ─── Non-streaming generation ─────────────────────────────────────────────────
const generatePlan = async (req, res, next) => {
    try {
        const { model, profile: profileData } = req.body;
        const selectedModel = model || DEFAULT_MODEL;

        if (!profileData) {
            return res.status(400).json({
                success: false,
                error: "`profile` is required.",
            });
        }

        // Validate profile fields
        const errors = profile.validateProfile(profileData);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const profileStr = profile.buildProfileSummary(profileData);
        const plan = await mealPlan.generateAll(selectedModel, profileStr);
        res.json({ success: true, model: selectedModel, plan });
    } catch (err) {
        next(err);
    }
};

// ─── SSE Streaming generation ─────────────────────────────────────────────────
const streamPlan = async (req, res, next) => {
    try {
        const { model, profile: profileData } = req.body;
        const selectedModel = model || DEFAULT_MODEL;

        if (!profileData) {
            res.status(400).json({
                success: false,
                error: "`profile` is required.",
            });
            return;
        }

        // Validate profile fields
        const errors = profile.validateProfile(profileData);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const profileStr = profile.buildProfileSummary(profileData);

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering

        const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

        // Handle client disconnect
        req.on("close", () => {
            console.log("  [SSE] Client disconnected");
        });

        const plan = await mealPlan.generateAllStreaming(selectedModel, profileStr, send);
        send({ step: "complete", model: selectedModel, plan });
    } catch (err) {
        // If headers already sent (SSE in progress), send error via stream
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ step: "error", error: err.message })}\n\n`);
        } else {
            next(err);
        }
    } finally {
        if (res.headersSent) {
            res.end();
        }
    }
};

module.exports = { listModels, generatePlan, streamPlan };
