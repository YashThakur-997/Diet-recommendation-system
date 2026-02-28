/**
 * services/ollama.js
 * Low-level wrapper for the Ollama HTTP API.
 * Default model: adrienbrault/biomistral-7b:Q5_K_M
 */

const http = require("http");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const TAGS_URL = `${OLLAMA_HOST}/api/tags`;
const GEN_URL = `${OLLAMA_HOST}/api/generate`;

// Tuned for llama3.1 — 7-day meal plans need large output space
const DEFAULT_OPTIONS = {
  temperature: 0.7,
  top_p: 0.9,
  num_predict: 8192,
  num_ctx: 16384,
  repeat_penalty: 1.1,
};

const REQUEST_TIMEOUT_MS = 600_000; // 10 minutes — 7-day plans take longer

// ─── List installed models ────────────────────────────────────────────────────
async function listModels() {
  const body = await fetchJSON(TAGS_URL);
  return (body.models || []).map((m) => m.name);
}

// ─── Generate (no streaming) — returns full response string ──────────────────
// Uses stream: false since BioMistral Q5_K_M doesn't work well with streaming
async function generate(model, prompt, opts = {}) {
  const payload = JSON.stringify({
    model,
    prompt,
    stream: false,
    options: { ...DEFAULT_OPTIONS, ...opts },
  });

  console.log(`  [Ollama] generate() model="${model}", prompt length=${prompt.length}`);

  return new Promise((resolve, reject) => {
    const url = new URL(GEN_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode === 404) {
          return reject(
            new Error(`Model '${model}' not found in Ollama. Run: ollama pull ${model}`)
          );
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Ollama responded with HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          const obj = JSON.parse(data);
          const response = obj.response || "";
          console.log(`  [Ollama] Done. Response length=${response.length} chars`);
          resolve(response);
        } catch (e) {
          reject(new Error("Failed to parse Ollama response: " + data.slice(0, 200)));
        }
      });
      res.on("error", reject);
    });

    req.on("error", (err) => {
      if (err.code === "ECONNREFUSED") {
        reject(new Error("Cannot reach Ollama at " + OLLAMA_HOST + " — is it running?"));
      } else {
        reject(err);
      }
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error("Ollama request timed out after " + (REQUEST_TIMEOUT_MS / 1000) + "s"));
    });

    req.write(payload);
    req.end();
  });
}

// ─── Generate with per-token callback ────────────────────────────────────────
// onToken(token: string) is called for every streamed token.
// Returns the full accumulated response string.
async function streamGenerate(model, prompt, opts = {}, onToken) {
  const payload = JSON.stringify({
    model,
    prompt,
    stream: true,
    options: { ...DEFAULT_OPTIONS, ...opts },
  });

  console.log(`  [Ollama] Requesting model="${model}", prompt length=${prompt.length}`);

  return new Promise((resolve, reject) => {
    const url = new URL(GEN_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 11434,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    let full = "";
    let lineBuffer = ""; // Buffer for partial NDJSON lines across chunks

    const req = http.request(options, (res) => {
      if (res.statusCode === 404) {
        return reject(
          new Error(
            `Model '${model}' not found in Ollama. ` +
            `Run: ollama pull ${model}`
          )
        );
      }
      if (res.statusCode !== 200) {
        // Read the error body for better diagnostics
        let errBody = "";
        res.on("data", (c) => (errBody += c));
        res.on("end", () => {
          reject(new Error(
            `Ollama responded with HTTP ${res.statusCode}: ${errBody.slice(0, 200)}`
          ));
        });
        return;
      }

      res.on("data", (chunk) => {
        // Append to buffer and split by newline — handles partial lines
        lineBuffer += chunk.toString();
        const lines = lineBuffer.split("\n");

        // The last element may be an incomplete line — keep it in the buffer
        lineBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const obj = JSON.parse(trimmed);
            const token = obj.response || "";
            if (token) {
              full += token;
              if (typeof onToken === "function") onToken(token);
            }
          } catch (parseErr) {
            console.warn("  [Ollama] Failed to parse line:", trimmed.slice(0, 100));
          }
        }
      });

      res.on("end", () => {
        // Process any remaining data in the buffer
        if (lineBuffer.trim()) {
          try {
            const obj = JSON.parse(lineBuffer.trim());
            const token = obj.response || "";
            if (token) {
              full += token;
              if (typeof onToken === "function") onToken(token);
            }
          } catch {
            console.warn("  [Ollama] Unparsed trailing data:", lineBuffer.slice(0, 100));
          }
        }
        console.log(`  [Ollama] Done. Response length=${full.length} chars`);
        resolve(full);
      });

      res.on("error", reject);
    });

    req.on("error", (err) => {
      if (err.code === "ECONNREFUSED") {
        reject(new Error("Cannot reach Ollama at " + OLLAMA_HOST + " — is it running?"));
      } else {
        reject(err);
      }
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error("Ollama request timed out after " + (REQUEST_TIMEOUT_MS / 1000) + "s"));
    });

    req.write(payload);
    req.end();
  });
}

// ─── Simple GET helper ────────────────────────────────────────────────────────
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
      res.on("error", reject);
    }).on("error", (err) => {
      if (err.code === "ECONNREFUSED") {
        reject(new Error("Cannot reach Ollama at " + OLLAMA_HOST + " — is it running?"));
      } else {
        reject(err);
      }
    });
  });
}

module.exports = { listModels, generate, streamGenerate };