import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import type { ChatRequest, Recipe, Language } from "@/types";

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  mr: "Marathi (मराठी)",
  es: "Spanish (Español)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  it: "Italian (Italiano)",
};

function getSystemPrompt(targetLang: Language): string {
  const langName = LANGUAGE_NAMES[targetLang] || "English";
  return `You are a professional chef assistant. The user will tell you what they want to cook — ingredients they have, dietary needs, cuisine preferences, and time available.

Target Language: ${langName}.
IMPORTANT LANGUAGE INSTRUCTION:
You MUST generate all content (recipe title, ingredients names, ingredient quantities, preparation steps, and any conversational message) fluently in ${langName}.
Keep the JSON keys in English as shown below, but all string values MUST be in ${langName}.

Your job is to generate a complete recipe. You MUST respond with valid JSON in this exact schema:

{
  "title": "Recipe Name in ${langName}",
  "servings": 4,
  "time": "25 minutes (in ${langName})",
  "ingredients": [
    { "name": "ingredient name in ${langName}", "quantity": "amount with unit in ${langName}" }
  ],
  "steps": [
    "Step 1 description in ${langName}",
    "Step 2 description in ${langName}"
  ]
}

Rules:
- Always include realistic quantities and measurements in ${langName}
- Steps should be clear, detailed, and numbered implicitly by array order in ${langName}
- Time should reflect actual cooking time
- Servings should be reasonable (default 2-4)
- If the user asks to modify a previous recipe (e.g. "make it vegan", "double the servings"), apply the modification to the most recent recipe in the conversation
- If the user's message is a greeting or general question, respond with just a JSON object like: { "title": "", "servings": 0, "time": "", "ingredients": [], "steps": [], "message": "friendly greeting in ${langName}" }
- ONLY output valid JSON, no markdown, no code fences, no extra text`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const body: ChatRequest = await req.json();
    const { message, filters, history, language = "en" } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build filter context string
    const filterParts: string[] = [];
    if (filters?.dietary && filters.dietary !== "none") {
      filterParts.push(`Dietary restriction: ${filters.dietary}`);
    }
    if (filters?.cuisine && filters.cuisine !== "any") {
      filterParts.push(`Cuisine preference: ${filters.cuisine}`);
    }
    if (filters?.time && filters.time !== "any") {
      filterParts.push(`Time available: ${filters.time}`);
    }

    const langName = LANGUAGE_NAMES[language] || "English";
    filterParts.push(`Target language: ${langName}`);

    const filterContext = `\n\n[User context: ${filterParts.join(", ")}]`;

    // Build conversation history for context
    const conversationHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.content }],
    }));

    // Add current message with filter context
    conversationHistory.push({
      role: "user" as const,
      parts: [{ text: message + filterContext }],
    });

    const ai = new GoogleGenAI({ apiKey });

    // Try models in order — if one quota is exhausted, fall back to the next
    const MODELS = [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
    ];
    let responseText = "";
    let lastError: unknown = null;

    const systemPrompt = getSystemPrompt(language);

    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
          },
          contents: conversationHistory,
        });
        responseText = response.text || "";
        lastError = null;
        break; // success — stop trying
      } catch (err) {
        lastError = err;
        const errStr = err instanceof Error ? err.message : String(err);
        // Retry on rate limit / quota errors
        if (
          errStr.includes("429") ||
          errStr.includes("RESOURCE_EXHAUSTED") ||
          errStr.includes("quota")
        ) {
          console.warn(`Model ${model} quota exhausted, trying next...`);
          continue;
        }
        throw err; // non-quota error — don't retry
      }
    }

    if (lastError) {
      throw lastError; // all models exhausted
    }

    // Parse the JSON response
    let parsed: Recipe & { message?: string };
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // If Gemini returns text instead of JSON, wrap it
      return NextResponse.json({
        reply: responseText,
        recipe: undefined,
      });
    }

    // Check if it's a conversational response (no real recipe)
    if (!parsed.title || parsed.title === "") {
      const defaultReplies: Record<Language, string> = {
        en: "I'm your cooking assistant! Tell me what ingredients you have or what you'd like to cook, and I'll whip up a recipe for you. 🍳",
        hi: "मैं आपका कुकिंग असिस्टेंट हूँ! मुझे बताएं आपके पास क्या सामग्री है, और मैं आपके लिए एक स्वादिष्ट रेसिपी बनाऊँगा। 🍳",
        mr: "मी तुमचा शेफ सहाय्यक आहे! तुमच्याकडे काय साहित्य आहे ते सांगा, मी तुमच्यासाठी छान रेसिपी तयार करतो. 🍳",
        es: "¡Soy tu asistente de cocina! Dime qué ingredientes tienes o qué deseas cocinar, y te prepararé una receta deliciosa. 🍳",
        fr: "Je suis votre assistant culinaire ! Dites-moi quels ingrédients vous avez ou ce que vous voulez cuisiner, et je vous prépare une recette. 🍳",
        de: "Ich bin dein Kochassistent! Sag mir, welche Zutaten du hast oder was du kochen möchtest, und ich erstelle ein Rezept für dich. 🍳",
        it: "Sono il tuo assistente culinario! Dimmi quali ingredienti hai o cosa vuoi cucinare e creerò una deliziosa ricetta per te. 🍳",
      };
      return NextResponse.json({
        reply: parsed.message || defaultReplies[language] || defaultReplies.en,
        recipe: undefined,
      });
    }

    // Return structured recipe
    return NextResponse.json({
      reply: parsed.title,
      recipe: {
        title: parsed.title,
        servings: parsed.servings || 2,
        time: parsed.time || "20 mins",
        ingredients: parsed.ingredients || [],
        steps: parsed.steps || [],
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";

    // Detect rate limit errors
    if (
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.includes("quota")
    ) {
      let retryDelay = "60s";
      const match = errorMessage.match(/retry in ([0-9.]+s)/);
      if (match) retryDelay = match[1];

      return NextResponse.json(
        {
          error: `Gemini API rate limit reached. Please wait ~${retryDelay} and try again. (Free-tier quota resets every minute)`,
          retryDelay,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate recipe. Please try again." },
      { status: 500 }
    );
  }
}
