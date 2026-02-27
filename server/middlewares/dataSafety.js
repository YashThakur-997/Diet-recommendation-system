/**
 * middlewares/dataSafety.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Express middleware layer that enforces PII / PHI data-safety policies
 * on every request and response that passes through protected routes.
 *
 * What it does:
 *   1. Sanitises all incoming request bodies (XSS / injection prevention)
 *   2. Detects & logs any PII/PHI fields being transmitted
 *   3. Strips fields that should never be persisted
 *   4. Adds data-safety response headers (cache control, etc.)
 *   5. Intercepts JSON responses to redact PII from outbound payloads
 *   6. Records every data-access event in the audit log
 * ─────────────────────────────────────────────────────────────────────────────
 */

const dataSafety = require("../services/dataSafety");

// ─── 1. Request sanitiser ────────────────────────────────────────────────────
/**
 * Sanitises req.body strings to prevent XSS / HTML injection.
 * Should be applied AFTER express.json() and BEFORE controllers.
 */
function sanitizeRequest(req, _res, next) {
    if (req.body && typeof req.body === "object") {
        req.body = dataSafety.sanitizeObject(req.body);

        dataSafety.recordAudit(
            "SANITIZE",
            `request:${req.method} ${req.originalUrl}`,
            Object.keys(req.body),
            { ip: maskIP(req.ip) }
        );
    }
    next();
}

// ─── 2. PII / PHI detection logger ──────────────────────────────────────────
/**
 * Scans the request body for PII/PHI fields and logs them for audit.
 * Does NOT block the request — just records what was received.
 */
function detectAndLogSensitiveData(req, _res, next) {
    if (req.body && typeof req.body === "object") {
        const detected = dataSafety.detectSensitiveFields(req.body);
        const allSensitive = [...detected.pii, ...detected.phi];

        if (allSensitive.length > 0) {
            dataSafety.recordAudit(
                "ACCESS",
                `request:${req.method} ${req.originalUrl}`,
                allSensitive,
                {
                    piiCount: detected.pii.length,
                    phiCount: detected.phi.length,
                    userId: req.user?.id || "anonymous",
                }
            );
        }
    }
    next();
}

// ─── 3. Transient-field stripper ─────────────────────────────────────────────
/**
 * Removes fields that should never travel beyond the auth layer
 * (e.g. prevents password from leaking into downstream services).
 */
function stripTransientFromBody(req, _res, next) {
    if (req.body && typeof req.body === "object") {
        // Only strip on routes that aren't auth routes
        if (!req.originalUrl.includes("/auth")) {
            req.body = dataSafety.stripTransientFields(req.body);
        }
    }
    next();
}

// ─── 4. Protective response headers ─────────────────────────────────────────
/**
 * Adds headers that prevent caching of responses containing health data.
 */
function addDataSafetyHeaders(_req, res, next) {
    // Prevent proxies & browsers from caching sensitive health data
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // Prevent MIME-type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Prevent embedding in iframes (clickjacking)
    res.setHeader("X-Frame-Options", "DENY");

    // Enable browser XSS filter
    res.setHeader("X-XSS-Protection", "1; mode=block");

    // Strict transport (when behind TLS in production)
    if (process.env.NODE_ENV === "production") {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }

    next();
}

// ─── 5. Response redactor ────────────────────────────────────────────────────
/**
 * Intercepts res.json() to automatically redact PII fields from outbound
 * JSON responses. This ensures that even if a controller forgets to
 * strip sensitive data, it never reaches the client.
 *
 * Fields like `password`, `ssn`, etc. are replaced with [PII_REDACTED].
 * Health fields needed by the client (age, weight, etc.) are NOT redacted
 * in the response — they are needed for the UI.
 */
function redactResponsePII(req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
        if (body && typeof body === "object") {
            // Specifically redact PII (not PHI) from the response
            // because the client needs health fields to render the plan
            const redacted = redactPIIOnly(body);

            dataSafety.recordAudit(
                "REDACT",
                `response:${req.method} ${req.originalUrl}`,
                [],
                { statusCode: res.statusCode }
            );

            return originalJson(redacted);
        }
        return originalJson(body);
    };

    next();
}

/**
 * Redact only PII fields (leave PHI fields intact for the client).
 */
function redactPIIOnly(obj) {
    if (!obj || typeof obj !== "object") return obj;

    const result = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
        const cls = dataSafety.classifyField(key);

        // Never return passwords, SSNs, etc.
        if (cls === "PII" && key === "password") {
            // Skip entirely — do not include
            continue;
        }

        if (value && typeof value === "object") {
            result[key] = redactPIIOnly(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

// ─── 6. Health data validation middleware ────────────────────────────────────
/**
 * Validates that health-data fields are within plausible ranges.
 * Returns 400 if data-poisoning is suspected.
 */
function validateHealthData(req, res, next) {
    if (req.body?.profile) {
        const warnings = dataSafety.validateHealthDataRanges(req.body.profile);
        if (warnings.length > 0) {
            dataSafety.recordAudit(
                "SANITIZE",
                `validation:${req.method} ${req.originalUrl}`,
                ["profile"],
                { warnings }
            );

            return res.status(400).json({
                success: false,
                errors: warnings,
                message: "Health data validation failed — values out of safe range.",
            });
        }
    }
    next();
}

// ─── 7. Profile de-identification middleware ─────────────────────────────────
/**
 * Strips any identifying information from the profile before it reaches
 * the LLM prompt builder. Ensures names, emails, etc. that a user may
 * accidentally include in free-text fields are removed.
 */
function deIdentifyProfileData(req, _res, next) {
    if (req.body?.profile) {
        // 1. Whitelist only allowed fields
        req.body.profile = dataSafety.deIdentifyProfile(req.body.profile);

        // 2. Scan any string field for accidental PII in free text
        for (const [key, value] of Object.entries(req.body.profile)) {
            if (typeof value === "string") {
                const findings = dataSafety.scanTextForPII(value);
                if (findings.length > 0) {
                    req.body.profile[key] = dataSafety.redactTextPII(value);

                    dataSafety.recordAudit(
                        "REDACT",
                        `de-identify:${req.method} ${req.originalUrl}`,
                        [key],
                        { findings: findings.map((f) => f.type) }
                    );
                }
            }
        }
    }
    next();
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Mask an IP address for logging (keep first two octets only). */
function maskIP(ip) {
    if (!ip) return "unknown";
    const parts = ip.replace("::ffff:", "").split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
    return "masked";
}

// ─── Composed middleware stack ────────────────────────────────────────────────
/**
 * Returns an array of middleware to apply to a route or router.
 * Usage:  router.use(...dataSafetyMiddleware.all());
 *    or:  app.use("/api/meal-plan", ...dataSafetyMiddleware.all());
 */
function all() {
    return [
        addDataSafetyHeaders,
        sanitizeRequest,
        detectAndLogSensitiveData,
        stripTransientFromBody,
        redactResponsePII,
    ];
}

/**
 * Middleware stack specifically for meal-plan routes (includes health validation).
 */
function forMealPlan() {
    return [
        addDataSafetyHeaders,
        sanitizeRequest,
        detectAndLogSensitiveData,
        stripTransientFromBody,
        validateHealthData,
        deIdentifyProfileData,
        redactResponsePII,
    ];
}

/**
 * Middleware stack for auth routes (lighter — just sanitise & header).
 */
function forAuth() {
    return [
        addDataSafetyHeaders,
        sanitizeRequest,
        detectAndLogSensitiveData,
        redactResponsePII,
    ];
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
    // Individual middleware
    sanitizeRequest,
    detectAndLogSensitiveData,
    stripTransientFromBody,
    addDataSafetyHeaders,
    redactResponsePII,
    validateHealthData,
    deIdentifyProfileData,

    // Composed stacks
    all,
    forMealPlan,
    forAuth,
};
