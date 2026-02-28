/**
 * routes/mealplan.router.js
 * Meal-plan API routes — separated from auth routes for clarity.
 */
const router = require("express").Router();
const {
    listModels,
    generatePlan,
    streamPlan,
    chatFeedback,
} = require("../controllers/mealplan.controller");

// GET  /api/meal-plan/models      → list available Ollama models
router.get("/models", listModels);

// POST /api/meal-plan             → generate full plan (non-streaming)
router.post("/generate", generatePlan);

// POST /api/meal-plan/stream      → generate full plan (SSE streaming)
router.post("/stream", streamPlan);

// POST /api/meal-plan/chat        → iterative feedback chat
router.post("/chat", chatFeedback);

module.exports = router;
