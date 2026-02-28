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
 *   GET  /api/data-safety/audit      → PII/PHI audit log (protected)
 *
 * Data Safety:
 *   PII detection, masking & redaction on every request/response
 *   PHI de-identification before LLM prompt injection
 *   HIPAA Safe Harbor & GDPR data-minimisation compliance
 */

// ─── Load environment variables FIRST ─────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// ─── Database connection ──────────────────────────────────────────────────────
require("./models/db.connection");

// ─── Routers ──────────────────────────────────────────────────────────────────
const authRouter = require("./routes/auth.router");
const mealPlanRouter = require("./routes/mealplan.router");

// ─── Middleware ───────────────────────────────────────────────────────────────
const authMiddleware = require("./middlewares/auth");
const dataSafetyMiddleware = require("./middlewares/dataSafety");

// ─── Data safety service (for audit endpoint) ────────────────────────────────
const dataSafety = require("./services/dataSafety");

// ─── Create Express app ───────────────────────────────────────────────────────
const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────
// HTTP security headers via Helmet
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production",
  crossOriginEmbedderPolicy: false,
}));

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

// ─── Rate limiting (abuse prevention for PII/PHI endpoints) ──────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests — please try again later." },
});
app.use("/api/", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                    // stricter for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many auth attempts — please try again later." },
});
app.use("/api/auth", authLimiter);

// Simple request logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`  [${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Data-safety headers are now set by helmet + dataSafetyMiddleware

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({
    success: true,
    status: "ok",
    model: process.env.DEFAULT_MODEL || "adrienbrault/biomistral-7b:Q5_K_M",
    timestamp: new Date().toISOString(),
  })
);

// ─── Public routes (with auth-specific data safety) ──────────────────────────
app.use("/api/auth", ...dataSafetyMiddleware.forAuth(), authRouter);

// ─── Protected routes (with full PII/PHI data safety) ─────────────────────────
app.use("/api/meal-plan", authMiddleware, ...dataSafetyMiddleware.forMealPlan(), mealPlanRouter);

// ─── Optional Wearables Route (Strava integration) ────────────────────────────
try {
  const wearablesRouter = require("./routes/wearables.router");
  app.use("/api/wearables", wearablesRouter);
  console.log("  🔌 Wearables module loaded successfully.");
} catch (e) {
  // Gracefully handle if wearables.router.js has been removed
}

// ─── Data-safety audit endpoint (protected) ──────────────────────────────────
app.get("/api/data-safety/audit", authMiddleware, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const log = dataSafety.getAuditLog(limit);
  res.json({
    success: true,
    count: log.length,
    entries: log,
  });
});

// ─── Data-safety DEMO endpoint (protected) ───────────────────────────────────
// POST /api/data-safety/demo
// Send any JSON body and see exactly what each safety step does to it.
app.post("/api/data-safety/demo", authMiddleware, express.json(), (req, res) => {
  const input = req.body;
  const steps = [];

  // Step 1: Detection — what sensitive fields are present?
  const detected = dataSafety.detectSensitiveFields(input);
  steps.push({
    step: 1,
    name: "🔍 Detection — Identify PII & PHI fields",
    piiFieldsFound: detected.pii.length > 0 ? detected.pii : "(none)",
    phiFieldsFound: detected.phi.length > 0 ? detected.phi : "(none)",
  });

  // Step 2: Sanitisation — clean XSS/injection
  const sanitized = dataSafety.sanitizeObject(JSON.parse(JSON.stringify(input)));
  const sanitizeChanges = {};
  for (const key of Object.keys(input)) {
    if (typeof input[key] === "string" && input[key] !== sanitized[key]) {
      sanitizeChanges[key] = { before: input[key], after: sanitized[key] };
    }
  }
  steps.push({
    step: 2,
    name: "🧹 Sanitisation — Clean XSS & injection",
    changes: Object.keys(sanitizeChanges).length > 0
      ? sanitizeChanges
      : "✅ No dangerous characters found — nothing changed",
    result: sanitized,
  });

  // Step 3: Transient field stripping
  const stripped = dataSafety.stripTransientFields(JSON.parse(JSON.stringify(input)));
  const removedFields = Object.keys(input).filter((k) => !(k in stripped));
  steps.push({
    step: 3,
    name: "🔒 Transient Stripping — Remove fields that must never persist",
    fieldsRemoved: removedFields.length > 0
      ? removedFields
      : "✅ No transient fields found — nothing removed",
    result: stripped,
  });

  // Step 4: De-identification (if profile present)
  if (input.profile || input.age || input.gender) {
    const profileData = input.profile || input;
    const before = JSON.parse(JSON.stringify(profileData));
    const deIdentified = dataSafety.deIdentifyProfile(profileData);
    const removedProfileFields = Object.keys(before).filter((k) => !(k in deIdentified));
    steps.push({
      step: 4,
      name: "🏥 De-identification — HIPAA Safe Harbor (whitelist only health fields)",
      before: before,
      after: deIdentified,
      fieldsStripped: removedProfileFields.length > 0
        ? removedProfileFields
        : "✅ All fields are health-related — nothing removed",
    });
  }

  // Step 5: Free-text PII scanning
  const textFindings = {};
  const scanTarget = input.profile || input;
  for (const [key, value] of Object.entries(scanTarget)) {
    if (typeof value === "string") {
      const findings = dataSafety.scanTextForPII(value);
      if (findings.length > 0) {
        textFindings[key] = {
          piiFound: findings.map((f) => ({ type: f.type, match: f.match })),
          before: value,
          after: dataSafety.redactTextPII(value),
        };
      }
    }
  }
  steps.push({
    step: 5,
    name: "📝 Free-text PII Scan — Find emails, phones, SSNs in text fields",
    findings: Object.keys(textFindings).length > 0
      ? textFindings
      : "✅ No PII patterns found in any text fields",
  });

  // Step 6: Masking (for safe logging)
  const masked = dataSafety.maskObject(JSON.parse(JSON.stringify(input)));
  steps.push({
    step: 6,
    name: "🎭 Masking — What gets logged (safe for debug logs)",
    before: input,
    after: masked,
  });

  // Step 7: Health data validation
  const profileForValidation = input.profile || input;
  const warnings = dataSafety.validateHealthDataRanges(profileForValidation);
  steps.push({
    step: 7,
    name: "✅ Health Data Validation — Check plausible ranges",
    result: warnings.length > 0
      ? { status: "⚠️ WARNINGS", warnings }
      : "✅ All health values are within safe ranges",
  });

  // Step 8: Encryption / Decryption round-trip demo
  const encryptDemo = {};
  for (const [key, value] of Object.entries(input)) {
    const cls = dataSafety.classifyField(key);
    if (cls !== "SAFE" && value !== undefined && value !== null && key !== "password") {
      const original = String(value);
      const encrypted = dataSafety.encrypt(original);
      const decrypted = dataSafety.decrypt(encrypted);
      encryptDemo[key] = {
        classification: cls,
        original: original,
        encrypted: encrypted,
        decrypted: decrypted,
        match: original === decrypted ? "✅ Perfect match" : "❌ Mismatch!",
      };
    }
  }
  steps.push({
    step: 8,
    name: "🔐 Encryption/Decryption — AES-256-GCM round-trip proof",
    description: "Each sensitive field is encrypted, then decrypted back. 'match' confirms data integrity.",
    fields: Object.keys(encryptDemo).length > 0
      ? encryptDemo
      : "✅ No sensitive fields to encrypt",
  });

  res.json({
    success: true,
    message: "Data Safety Demo — see what each protection layer does to your data",
    originalInput: input,
    steps,
  });
});

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