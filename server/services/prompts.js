/**
 * services/prompts.js
 * 1-day meal plan — 2 steps only for speed.
 * Optimized for llama3.1 (instruction-tuned model).
 */

function mealPlanPrompt(profileStr) {
  return (
    `You are a dietitian and chef. ${profileStr}\n\n` +
    "Create a 1-day meal plan with full details. Be concise.\n\n" +
    "For each meal (Breakfast, Lunch, Dinner) include:\n" +
    "  - Dish name\n" +
    "  - Ingredients with quantities\n" +
    "  - Brief cooking steps (3-5 steps)\n" +
    "  - Nutrition: calories / protein / carbs / fat\n\n" +
    "End with a Daily Macro Summary table.\n" +
    "Heading format: ## [Meal]: [Dish Name]"
  );
}

function shoppingListPrompt(profileStr, mealPlan, servings) {
  return (
    `You are a meal prep expert. ${profileStr}\n\n` +
    `Today's meal plan:\n${mealPlan.slice(0, 800)}\n\n` +
    `Write a shopping list for ${servings} person(s).\n` +
    "Group into: Proteins | Vegetables & Fruits | Grains & Legumes | Dairy | Pantry\n" +
    "Keep it short and practical."
  );
}

module.exports = { mealPlanPrompt, shoppingListPrompt };