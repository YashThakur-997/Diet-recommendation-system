/**
 * services/prompts.js
 * 1-day meal plan — 2 steps only for speed.
 * Optimized for llama3.1 (instruction-tuned model).
 */

function mealPlanPrompt(profileStr) {
  const match = profileStr.match(/(\d+)\s+meals\/day/);
  const mealsCount = match ? parseInt(match[1], 10) : 3;

  let mealNames = "Breakfast, Lunch, Dinner";
  if (mealsCount === 1) mealNames = "Main Meal";
  if (mealsCount === 2) mealNames = "Breakfast, Dinner";
  if (mealsCount === 4) mealNames = "Breakfast, Lunch, Snack, Dinner";
  if (mealsCount === 5) mealNames = "Breakfast, Morning Snack, Lunch, Evening Snack, Dinner";
  if (mealsCount >= 6) mealNames = "Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner, Evening Snack";

  return (
    `You are a dietitian and chef. ${profileStr}\n\n` +
    `Create a 1-day meal plan strictly containing exactly ${mealsCount} meals.\n` +
    `Use EXACTLY these meal names: ${mealNames}.\n\n` +
    "For each meal include exactly these headings:\n" +
    "  ### Ingredients\n" +
    "  ### Cooking Steps\n" +
    "  ### Nutrition\n\n" +
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

/**
 * Build a prompt for the NutriAI feedback chat.
 * @param {string} profileStr  User profile summary
 * @param {string} currentPlan The current meal plan text
 * @param {string} userMessage The user's feedback/request
 * @param {Array}  history     Array of { role: 'user'|'ai', text: string }
 */
function chatFeedbackPrompt(profileStr, currentPlan, userMessage, history = []) {
  // Build conversation context from recent history (last 6 messages)
  const recentHistory = history.slice(-6);
  let conversationContext = "";
  if (recentHistory.length > 0) {
    conversationContext =
      "Previous conversation:\n" +
      recentHistory
        .map((m) => `${m.role === "user" ? "User" : "NutriAI"}: ${m.text}`)
        .join("\n") +
      "\n\n";
  }

  return (
    `You are NutriAI, a friendly and knowledgeable dietitian assistant. ${profileStr}\n\n` +
    `Current meal plan:\n${currentPlan.slice(0, 1500)}\n\n` +
    conversationContext +
    `User's latest message: "${userMessage}"\n\n` +
    "INSTRUCTIONS:\n" +
    "- If the user asks to modify, swap, replace, or change a specific meal, provide ONLY the updated version of that meal.\n" +
    "- CRITICAL: When providing an updated meal, your response MUST start with the heading line in this EXACT format:\n" +
    "  ## Breakfast: Egg White Omelette\n" +
    "  ## Lunch: Grilled Chicken Salad\n" +
    "  ## Dinner: Salmon with Vegetables\n" +
    "  ## Snack: Greek Yogurt Bowl\n" +
    "- Do NOT include any introductory text before the heading (no 'Sure!' or 'Here is your updated meal'). Start directly with ## MealType: DishName.\n" +
    "- After the heading, include exactly these headings: ### Ingredients, ### Cooking Steps, ### Nutrition.\n" +
    "- If the user asks a nutrition question or gives general feedback, respond conversationally WITHOUT using ## headings.\n" +
    "- Be concise. Keep responses under 300 words unless providing a full meal replacement.\n" +
    "- Always consider the user's dietary profile, allergies, and health conditions.\n"
  );
}

module.exports = { mealPlanPrompt, shoppingListPrompt, chatFeedbackPrompt };