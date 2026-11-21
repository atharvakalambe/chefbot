"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, Filters, ChatResponse } from "@/types";
import { FilterChips } from "./FilterChips";
import { MessageBubble } from "./MessageBubble";
import { RecipeCard } from "./RecipeCard";
import { LoadingIndicator } from "./LoadingIndicator";

const DEFAULT_FILTERS: Filters = {
  dietary: "none",
  cuisine: "any",
  time: "30 min",
};

const SUGGESTIONS = [
  "🍗 I have chicken, rice, and 20 minutes",
  "🌶️ Vegetarian dinner, no dairy, feeling spicy",
  "🍝 Quick Italian pasta with whatever's common",
  "🥗 Healthy lunch under 15 minutes",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const sendMessage = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setError(null);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      filters: { ...filters },
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    setIsLoading(true);

    try {
      // Build history from previous messages
      const history = messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content + (msg.recipe ? `\n\nRecipe: ${JSON.stringify(msg.recipe)}` : ""),
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          filters,
          history,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        recipe: data.recipe,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Strip emoji prefix for cleaner message
    const cleanText = suggestion.replace(/^[^\w]*\s*/, "");
    sendMessage(cleanText);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>🍳 ChefBot</h1>
        <p>Your AI cooking assistant — tell me what you have, I&apos;ll make it delicious</p>
      </header>

      {/* Messages or Welcome */}
      {!hasMessages && !isLoading ? (
        <div className="welcome-container">
          <div className="welcome-content">
            <span className="welcome-icon">👨‍🍳</span>
            <h2 className="welcome-title">What are we cooking today?</h2>
            <p className="welcome-subtitle">
              Tell me what ingredients you have, your dietary preferences, or just
              describe your mood — I&apos;ll generate the perfect recipe for you.
            </p>
            <div className="welcome-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(s)}
                  id={`suggestion-${i}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-messages" id="chat-messages">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <MessageBubble key={msg.id} message={msg} />
            ) : msg.recipe ? (
              <div key={msg.id} className="recipe-card-wrapper">
                <RecipeCard recipe={msg.recipe} />
              </div>
            ) : (
              <MessageBubble key={msg.id} message={msg} />
            )
          )}
          {isLoading && <LoadingIndicator />}
          {error && (
            <div className="error-message" id="error-message">
              ⚠️ {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Filter Chips */}
      <FilterChips filters={filters} onFiltersChange={setFilters} />

      {/* Input */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="input-field"
            placeholder="Tell me what you want to cook..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            id="chat-input"
            disabled={isLoading}
          />
          <button
            className="send-button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            id="send-button"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
