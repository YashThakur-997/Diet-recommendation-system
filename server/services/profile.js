/**
 * services/profile.js
 * Validates incoming profile data and builds the compact summary string
 * that is injected into every LLM prompt.
 */

const ACTIVITY_MAP = {
  "1": "Sedentary",
  "2": "Light",
  "3": "Moderate",
  "4": "Very active",
  "5": "Extreme",
};

const GOAL_MAP = {
  "1": "Lose weight",
  "2": "Maintain weight",
  "3": "Gain muscle",
  "4": "Better health",
  "5": "Manage condition",
};

/**
 * Build a compact one-liner profile injected into every prompt.
 * @param {object} p  Raw profile object from the request body.
 * @returns {string}
 */
function buildProfileSummary(p) {
  const nutrients = [
    ["kcal",       p.calories],
    ["protein",    p.protein],
    ["carbs",      p.carbs],
    ["fat",        p.fat],
    ["fiber",      p.fiber],
    ["sodium-max", p.sodium],
  ]
    .filter(([, val]) => val)
    .map(([lbl, val]) => `${lbl}=${val}`)
    .join(" ") || "auto-calculate";

  const nutrientStr = p.special
    ? `${nutrients}, focus=${p.special}`
    : nutrients;

  return (
    `Profile: ${p.age}yr ${p.gender}, ${p.weight}, ${p.height}, ` +
    `activity=${ACTIVITY_MAP[p.activity] || p.activity}, ` +
    `goal=${GOAL_MAP[p.goal] || p.goal}, ` +
    `diet=${p.dietType || p.diet_type || "omnivore"}, ` +
    `allergies=${p.allergies || "none"}, ` +
    `conditions=${p.conditions || "none"}, ` +
    `avoid=${p.disliked || "none"}, ` +
    `cuisine=${p.cuisine || "any"}, ` +
    `${p.mealsPerDay || p.meals_per_day || 3} meals/day, ` +
    `max-cook=${p.cookTime || p.cook_time || "30 min"}, ` +
    `budget=${p.budget || "medium"}, ` +
    `servings=${p.servings || 1}. ` +
    `Nutrients: ${nutrientStr}.`
  );
}

/**
 * Validate required fields. Returns an array of error strings (empty = valid).
 */
function validateProfile(p) {
  const required = ["age", "gender", "weight", "height"];
  return required
    .filter((field) => !p[field])
    .map((field) => `Missing required field: ${field}`);
}

module.exports = { buildProfileSummary, validateProfile };