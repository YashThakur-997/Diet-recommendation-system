const ollama = require("./ollama");
const prompts = require("./prompts");

const STEPS = [
  {
    key: "meal_plan",
    label: "Step 1/2 — Meal plan + recipes",
    prompt: (profileStr) => prompts.mealPlanPrompt(profileStr),
  },
  {
    key: "shopping_list",
    label: "Step 2/2 — Shopping list",
    prompt: (profileStr, sections) => {
      const match = profileStr.match(/servings=(\d+)/);
      const servings = match ? match[1] : "1";
      return prompts.shoppingListPrompt(profileStr, sections.meal_plan, servings);
    },
  },
];

async function generateAll(model, profileStr) {
  const sections = {};
  for (const step of STEPS) {
    console.log(`  [${step.label}]`);
    sections[step.key] = await ollama.generate(model, step.prompt(profileStr, sections));
  }
  return sections;
}

// SSE "streaming" — uses non-streaming generate under the hood because
// BioMistral Q5_K_M returns empty responses with stream: true.
// The client still receives SSE events for progress tracking.
async function generateAllStreaming(model, profileStr, send) {
  const sections = {};
  for (const step of STEPS) {
    send({ step: step.key, label: step.label, status: "start" });

    // Generate full response (non-streaming)
    const result = await ollama.generate(
      model,
      step.prompt(profileStr, sections)
    );

    sections[step.key] = result;

    // Send the full text as a single token event
    if (result) {
      send({ step: step.key, token: result });
    }

    send({ step: step.key, status: "done" });
  }
  return sections;
}

module.exports = { generateAll, generateAllStreaming };
