import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import type { ChatRequest, Recipe } from "@/types";

const SYSTEM_PROMPT = `You are a professional chef assistant. The user will tell you what they want to cook — ingredients they have, dietary needs, cuisine preferences, and time available.

Your job is to generate a complete recipe. You MUST respond with valid JSON in this exact schema:

{
  "title": "Recipe Name",
  "servings": 4,
  "time": "25 minutes",
  "ingredients": [
    { "name": "ingredient name", "quantity": "amount with unit" }
  ],
  "steps": [
    "Step 1 description",
    "Step 2 description"
  ]
}

Rules:
- Always include realistic quantities and measurements
- Steps should be clear and numbered implicitly by array order
- Time should reflect actual cooking time
- Servings should be reasonable (default 2-4)
- If the user asks to modify a previous recipe (e.g. "make it vegan", "double the servings"), apply the modification to the most recent recipe in the conversation
- If the user's message is a greeting or general question, respond with just a JSON object like: { "title": "", "servings": 0, "time": "", "ingredients": [], "steps": [], "message": "your friendly response here" }
- ONLY output valid JSON, no markdown, no code fences, no extra text`;

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
    const { message, filters, history } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build filter context string
    const filterParts: string[] = [];
    if (filters.dietary && filters.dietary !== "none") {
      filterParts.push(`Dietary restriction: ${filters.dietary}`);
    }
    if (filters.cuisine && filters.cuisine !== "any") {
      filterParts.push(`Cuisine preference: ${filters.cuisine}`);
    }
    if (filters.time) {
      filterParts.push(`Time available: ${filters.time}`);
    }

    const filterContext = filterParts.length > 0
      ? `\n\n[User preferences: ${filterParts.join(", ")}]`
      : "";

    // Build conversation history for context
    const conversationHistory = history.map((msg) => ({
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
      "gemini-2.0-flash"
    ];
    let responseText = "";
    let lastError: unknown = null;

    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          config: {
            systemInstruction: SYSTEM_PROMPT,
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
        // Only retry on rate limit / quota errors
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
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
      return NextResponse.json({
        reply: parsed.message || "I'm your cooking assistant! Tell me what ingredients you have or what you'd like to cook, and I'll whip up a recipe for you. 🍳",
        recipe: undefined,
      });
    }

    // Return structured recipe
    const recipe: Recipe = {
      title: parsed.title,
      servings: parsed.servings,
      time: parsed.time,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
    };

    return NextResponse.json({
      reply: `Here's a recipe for **${recipe.title}**!`,
      recipe,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Detect rate-limit / quota errors from Gemini
    const errorStr = error instanceof Error ? error.message : String(error);
    if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
      // Try to extract retry delay
      const retryMatch = errorStr.match(/retry\s*(?:in|Delay[:\s]*"?)(\d+)/i);
      const retrySeconds = retryMatch ? parseInt(retryMatch[1], 10) : 60;
      return NextResponse.json(
        { error: `⏳ Gemini API rate limit reached. Please wait ~${retrySeconds}s and try again. (Free-tier quota resets every minute)` },
        { status: 429 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate recipe: ${errorMessage}` },
      { status: 500 }
    );
  }
}
