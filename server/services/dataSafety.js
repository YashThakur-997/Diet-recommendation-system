/**
 * services/dataSafety.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Core PII (Personally Identifiable Information) & PHI (Protected Health
 * Information) data-safety module for the Diet Recommendation System.
 *
 * Provides:
 *   • Detection  — identify PII/PHI fields in arbitrary objects
 *   • Masking    — reversible masking for internal processing
 *   • Redaction  — irreversible removal for logs & responses
 *   • Sanitisation — input cleaning (XSS, injection)
 *   • Audit trail — structured logging of data-access events
 *
 * Regulatory alignment:
 *   HIPAA Safe-Harbor de-identification (§ 164.514(b)(2))
 *   GDPR Art. 5 — data minimisation, purpose limitation
 * ─────────────────────────────────────────────────────────────────────────────
 */

const crypto = require("crypto");

// ─── Encryption key for reversible masking ─────────────────────────────────────
// In production derive from env; here we fall back to a 256-bit key.
const ENCRYPTION_KEY =
    process.env.DATA_ENCRYPTION_KEY ||
    crypto.randomBytes(32).toString("hex");

const ALGORITHM = "aes-256-gcm";

// ─── Classification maps ─────────────────────────────────────────────────────
// Every field that touches user data is classified as PII, PHI, or SAFE.

/** Fields that constitute PII (identifiable to a natural person) */
const PII_FIELDS = new Set([
    "email",
    "username",
    "name",
    "firstName",
    "first_name",
    "lastName",
    "last_name",
    "phone",
    "phoneNumber",
    "phone_number",
    "address",
    "ip",
    "ipAddress",
    "ip_address",
    "ssn",
    "socialSecurity",
    "dateOfBirth",
    "date_of_birth",
    "dob",
    "password",
]);

/** Fields that constitute PHI (health-related, governed by HIPAA) */
const PHI_FIELDS = new Set([
    "age",
    "gender",
    "weight",
    "height",
    "conditions",
    "medicalConditions",
    "medical_conditions",
    "allergies",
    "medications",
    "bloodType",
    "blood_type",
    "bmi",
    "calories",
    "protein",
    "carbs",
    "fat",
    "fiber",
    "sodium",
    "dietType",
    "diet_type",
    "mealsPerDay",
    "meals_per_day",
]);

// ─── Regex patterns for detecting PII in free text ──────────────────────────
const PII_PATTERNS = [
    { name: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { name: "phone", regex: /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g },
    { name: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
    { name: "ipv4", regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
    { name: "creditCard", regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
];

// ─── Audit logger ────────────────────────────────────────────────────────────
const auditLog = [];
const MAX_AUDIT_LOG = 1000; // ring-buffer size

/**
 * Record a data-access event for compliance audit.
 * @param {"ACCESS"|"MASK"|"REDACT"|"ENCRYPT"|"SANITIZE"} action
 * @param {string} entity   — e.g. "user:abc123", "request:POST /api/meal-plan"
 * @param {string[]} fields — which fields were involved
 * @param {object}  [meta]  — extra context
 */
function recordAudit(action, entity, fields = [], meta = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        action,
        entity,
        fields,
        ...meta,
    };

    auditLog.push(entry);
    if (auditLog.length > MAX_AUDIT_LOG) auditLog.shift();

    if (process.env.NODE_ENV !== "production") {
        console.log(`  [DataSafety] ${action} → ${entity} [${fields.join(", ")}]`);
    }
}

/** Return a snapshot of the last N audit entries. */
function getAuditLog(limit = 50) {
    return auditLog.slice(-limit);
}

// ─── Encryption / Decryption helpers ─────────────────────────────────────────

/**
 * Encrypt a plaintext string → hex-encoded ciphertext.
 * Uses AES-256-GCM with a random IV per call.
 */
function encrypt(plainText) {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let enc = cipher.update(String(plainText), "utf8", "hex");
    enc += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    // pack  iv:authTag:ciphertext
    return `${iv.toString("hex")}:${authTag}:${enc}`;
}

/**
 * Decrypt a previously-encrypted string back to plaintext.
 */
function decrypt(packed) {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const [ivHex, authTagHex, cipherText] = packed.split(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let dec = decipher.update(cipherText, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
}

// ─── Field classification ────────────────────────────────────────────────────

/**
 * Classify a single field name.
 * @returns {"PII"|"PHI"|"SAFE"}
 */
function classifyField(fieldName) {
    const lower = fieldName.toLowerCase();
    if (PII_FIELDS.has(fieldName) || PII_FIELDS.has(lower)) return "PII";
    if (PHI_FIELDS.has(fieldName) || PHI_FIELDS.has(lower)) return "PHI";
    return "SAFE";
}

/**
 * Scan an object and return { pii: [...], phi: [...] } with the keys found.
 */
function detectSensitiveFields(obj, prefix = "") {
    const result = { pii: [], phi: [] };
    if (!obj || typeof obj !== "object") return result;

    for (const [key, value] of Object.entries(obj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const cls = classifyField(key);

        if (cls === "PII") result.pii.push(fullPath);
        if (cls === "PHI") result.phi.push(fullPath);

        // Recurse into nested objects (but not arrays of primitives)
        if (value && typeof value === "object" && !Array.isArray(value)) {
            const nested = detectSensitiveFields(value, fullPath);
            result.pii.push(...nested.pii);
            result.phi.push(...nested.phi);
        }
    }
    return result;
}

// ─── Masking helpers ─────────────────────────────────────────────────────────

/**
 * Mask a value so it cannot be read but retains structure (debugging aid).
 * E.g. "john@example.com" → "jo***om"
 */
function maskValue(value) {
    const str = String(value);
    if (str.length <= 2) return "**";
    if (str.length <= 6) return str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
    return str.slice(0, 2) + "*".repeat(Math.min(str.length - 4, 6)) + str.slice(-2);
}

/**
 * Redact (completely remove) the value, replacing with a classification tag.
 */
function redactValue(fieldName) {
    const cls = classifyField(fieldName);
    return `[${cls}_REDACTED]`;
}

// ─── Object-level operations ─────────────────────────────────────────────────

/**
 * Deep-clone an object and mask every PII / PHI field.
 * Safe to use for logging — original data is untouched.
 */
function maskObject(obj) {
    if (!obj || typeof obj !== "object") return obj;

    const masked = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
        const cls = classifyField(key);

        if (cls !== "SAFE" && value !== undefined && value !== null) {
            masked[key] = maskValue(value);
        } else if (value && typeof value === "object") {
            masked[key] = maskObject(value);
        } else {
            masked[key] = value;
        }
    }
    return masked;
}

/**
 * Deep-clone an object and redact every PII / PHI field.
 */
function redactObject(obj) {
    if (!obj || typeof obj !== "object") return obj;

    const redacted = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
        const cls = classifyField(key);

        if (cls !== "SAFE" && value !== undefined && value !== null) {
            redacted[key] = redactValue(key);
        } else if (value && typeof value === "object") {
            redacted[key] = redactObject(value);
        } else {
            redacted[key] = value;
        }
    }
    return redacted;
}

/**
 * Encrypt every sensitive field in-place (mutates the object).
 * Returns a map of fieldName → encrypted value for decryption later.
 */
function encryptSensitiveFields(obj) {
    if (!obj || typeof obj !== "object") return {};
    const encryptedMap = {};

    for (const [key, value] of Object.entries(obj)) {
        const cls = classifyField(key);
        if (cls !== "SAFE" && value !== undefined && value !== null && key !== "password") {
            const encrypted = encrypt(String(value));
            encryptedMap[key] = encrypted;
            obj[key] = encrypted;
        } else if (value && typeof value === "object" && !Array.isArray(value)) {
            const nested = encryptSensitiveFields(value);
            Object.assign(encryptedMap, nested);
        }
    }
    return encryptedMap;
}

// ─── Free-text PII scanning ─────────────────────────────────────────────────

/**
 * Scan a free-text string for PII patterns (email, phone, SSN, etc).
 * Returns an array of { type, match, index } objects.
 */
function scanTextForPII(text) {
    if (typeof text !== "string") return [];
    const findings = [];

    for (const { name, regex } of PII_PATTERNS) {
        // Reset lastIndex for each search
        const re = new RegExp(regex.source, regex.flags);
        let m;
        while ((m = re.exec(text)) !== null) {
            findings.push({ type: name, match: m[0], index: m.index });
        }
    }
    return findings;
}

/**
 * Redact PII from free text, replacing matches with [REDACTED_<type>].
 */
function redactTextPII(text) {
    if (typeof text !== "string") return text;
    let cleaned = text;

    for (const { name, regex } of PII_PATTERNS) {
        const re = new RegExp(regex.source, regex.flags);
        cleaned = cleaned.replace(re, `[REDACTED_${name.toUpperCase()}]`);
    }
    return cleaned;
}

// ─── Input sanitisation ──────────────────────────────────────────────────────

/**
 * Sanitise a string to prevent XSS / injection vectors.
 */
function sanitizeString(str) {
    if (typeof str !== "string") return str;

    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

/**
 * Recursively sanitise all string values in an object.
 * Skips "password" (will be hashed downstream).
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== "object") return obj;

    const clean = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string" && key !== "password") {
            clean[key] = sanitizeString(value);
        } else if (value && typeof value === "object") {
            clean[key] = sanitizeObject(value);
        } else {
            clean[key] = value;
        }
    }
    return clean;
}

// ─── Data retention helpers ──────────────────────────────────────────────────

/**
 * Strip fields that should never be persisted beyond the current request
 * (e.g. plaintext passwords echoed back, raw IP addresses).
 */
const NEVER_PERSIST_FIELDS = new Set([
    "password",
    "ssn",
    "socialSecurity",
    "creditCard",
    "credit_card",
]);

function stripTransientFields(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const stripped = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        if (NEVER_PERSIST_FIELDS.has(key)) continue;
        if (value && typeof value === "object") {
            stripped[key] = stripTransientFields(value);
        } else {
            stripped[key] = value;
        }
    }
    return stripped;
}

// ─── Profile-specific helpers ────────────────────────────────────────────────

/**
 * Build a de-identified (anonymised) profile summary for the LLM prompt.
 * Removes direct identifiers, keeps only the health parameters needed
 * for meal planning.  Complies with HIPAA Safe Harbor by stripping:
 *   names, email, dates (except age), phone, IP, etc.
 *
 * @param {object} profileData — raw profile from the client
 * @returns {object}           — de-identified copy
 */
function deIdentifyProfile(profileData) {
    if (!profileData || typeof profileData !== "object") return profileData;

    // Allow only the minimum fields the LLM needs
    const ALLOWED_LLM_FIELDS = new Set([
        "age", "gender", "weight", "height",
        "activity", "goal",
        "dietType", "diet_type",
        "allergies", "conditions",
        "disliked", "cuisine",
        "mealsPerDay", "meals_per_day",
        "cookTime", "cook_time",
        "budget", "servings",
        "calories", "protein", "carbs", "fat", "fiber", "sodium",
        "special",
    ]);

    const safe = {};
    for (const [key, value] of Object.entries(profileData)) {
        if (ALLOWED_LLM_FIELDS.has(key)) {
            safe[key] = value;
        }
    }
    return safe;
}

/**
 * Validate that health data is within plausible ranges (protects
 * against data-poisoning attacks aimed at the LLM).
 */
function validateHealthDataRanges(profile) {
    const warnings = [];

    if (profile.age !== undefined) {
        const age = Number(profile.age);
        if (isNaN(age) || age < 1 || age > 130) {
            warnings.push("Age must be between 1 and 130.");
        }
    }

    if (profile.weight !== undefined) {
        const w = String(profile.weight).replace(/[^\d.]/g, "");
        if (parseFloat(w) > 700) {
            warnings.push("Weight value seems unreasonably high.");
        }
    }

    if (profile.height !== undefined) {
        const h = String(profile.height).replace(/[^\d.]/g, "");
        if (parseFloat(h) > 300) {
            warnings.push("Height value seems unreasonably high (cm expected).");
        }
    }

    if (profile.calories !== undefined) {
        const cal = Number(profile.calories);
        if (!isNaN(cal) && (cal < 500 || cal > 10000)) {
            warnings.push("Calorie target should be between 500 and 10,000.");
        }
    }

    return warnings;
}

// ─── Consent tracker (in-memory — use DB in production) ──────────────────────

const consentStore = new Map();

function recordConsent(userId, scope, granted = true) {
    consentStore.set(userId, {
        scope,
        granted,
        timestamp: new Date().toISOString(),
    });
    recordAudit("ACCESS", `consent:${userId}`, [scope], { granted });
}

function hasConsent(userId, scope) {
    const entry = consentStore.get(userId);
    return entry && entry.granted && entry.scope === scope;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
    // Classification
    classifyField,
    detectSensitiveFields,

    // Masking & redaction
    maskValue,
    maskObject,
    redactValue,
    redactObject,
    redactTextPII,

    // Encryption
    encrypt,
    decrypt,
    encryptSensitiveFields,

    // Free-text scanning
    scanTextForPII,

    // Sanitisation
    sanitizeString,
    sanitizeObject,

    // Data retention
    stripTransientFields,

    // Profile-specific
    deIdentifyProfile,
    validateHealthDataRanges,

    // Consent
    recordConsent,
    hasConsent,

    // Audit
    recordAudit,
    getAuditLog,

    // Field sets (for testing / extension)
    PII_FIELDS,
    PHI_FIELDS,
};
