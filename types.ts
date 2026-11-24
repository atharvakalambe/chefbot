export type Language = "en" | "hi" | "mr" | "es" | "fr" | "de" | "it";

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  title: string;
  servings: number;
  time: string;
  ingredients: Ingredient[];
  steps: string[];
}

export interface Filters {
  dietary: string;
  cuisine: string;
  time: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recipe?: Recipe;
  filters?: Filters;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface SavedRecipe {
  id: string;
  recipe: Recipe;
  savedAt: number;
  notes?: string;
  sourceSessionId?: string;
  language: Language;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  filters: Filters;
  language: Language;
}

export interface ChatRequest {
  message: string;
  filters: Filters;
  language?: Language;
  history: { role: "user" | "assistant"; content: string }[];
}

export interface ChatResponse {
  reply: string;
  recipe?: Recipe;
  error?: string;
}
