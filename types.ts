export interface Recipe {
  title: string;
  servings: number;
  time: string;
  ingredients: Ingredient[];
  steps: string[];
}

export interface Ingredient {
  name: string;
  quantity: string;
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

export interface ChatRequest {
  message: string;
  filters: Filters;
  history: { role: "user" | "assistant"; content: string }[];
}

export interface ChatResponse {
  reply: string;
  recipe?: Recipe;
}
