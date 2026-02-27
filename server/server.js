#!/usr/bin/env node
/**
 * Meal Plan Generator — Express.js Backend
 * MERN-ready REST API powered by Ollama (BioMistral-7B)
 *
 * Routes:
 *   GET  /health                     → health check
 *   POST /api/auth/login             → user login
 *   POST /api/auth/signup            → user registration
 *   POST /api/auth/logout            → user logout
 *   GET  /api/meal-plan/models       → list available Ollama models
 *   POST /api/meal-plan/generate     → generate full plan (non-streaming)
 *   POST /api/meal-plan/stream       → generate full plan (SSE streaming)
 */

// ─── Load environment variables FIRST ─────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// ─── Database connection ──────────────────────────────────────────────────────
require("./models/db.connection");

// ─── Routers ──────────────────────────────────────────────────────────────────
const authRouter = require("./routes/auth.router");
const mealPlanRouter = require("./routes/mealplan.router");

// ─── Middleware ───────────────────────────────────────────────────────────────
const authMiddleware = require("./middlewares/auth");

// ─── Create Express app ───────────────────────────────────────────────────────
const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
// CORS — allow credentials & restrict origin in production
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple request logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`  [${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({
    success: true,
    status: "ok",
    model: process.env.DEFAULT_MODEL || "adrienbrault/biomistral-7b:Q5_K_M",
    timestamp: new Date().toISOString(),
  })
);

// ─── Public routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// ─── Protected routes ─────────────────────────────────────────────────────────
// Meal-plan endpoints require authentication
app.use("/api/meal-plan", authMiddleware, mealPlanRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(`  [ERROR] ${err.message}`);

  // Ollama connectivity issues
  if (err.message?.includes("Cannot reach Ollama")) {
    return res.status(503).json({
      success: false,
      error: "AI service is currently unavailable. Make sure Ollama is running.",
    });
  }

  // Model not found
  if (err.message?.includes("not found in Ollama")) {
    return res.status(404).json({
      success: false,
      error: err.message,
    });
  }

  // Generic error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  const model = process.env.DEFAULT_MODEL;
  console.log(`  🚀 Server running on port ${PORT}, using model "${model}"`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n  🛑 ${signal} received — shutting down gracefully…`);
  server.close(() => {
    console.log("  ✅ Server closed. Goodbye!\n");
    process.exit(0);
  });
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("  ⚠  Forced exit after timeout.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));