"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Message, Filters, ChatResponse } from "@/types";
import { useChat } from "@/context/ChatContext";
import { FilterChips } from "./FilterChips";
import { MessageBubble } from "./MessageBubble";
import { RecipeCard } from "./RecipeCard";
import { LoadingIndicator } from "./LoadingIndicator";

export function ChatInterface() {
  const {
    language,
    t,
    activeSession,
    addMessage,
    setSessionFilters,
    toggleSidebar,
    isSidebarOpen,
  } = useChat();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = activeSession?.messages || [];
  const filters = activeSession?.filters || {
    dietary: "none",
    cuisine: "any",
    time: "any",
  };

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

  const handleFiltersChange = (newFilters: Filters) => {
    setSessionFilters(newFilters);
  };

  const sendMessage = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setError(null);

    // Add user message to active session
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      filters: { ...filters },
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput("");

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    setIsLoading(true);

    try {
      // Build history from current session's prior messages
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
          language,
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

      addMessage(assistantMessage);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
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
    sendMessage(suggestion);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-interface-wrapper">
      {/* Top Navbar */}
      <header className="chat-topbar">
        <div className="topbar-left">
          <button
            className="btn-sidebar-toggle"
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="topbar-title-block">
            <span className="topbar-chat-icon">🍳</span>
            <h1 className="topbar-title" title={activeSession?.title || t.appName}>
              {activeSession?.title || t.appName}
            </h1>
          </div>
        </div>

        <div className="topbar-right">
          <span className="language-badge">
            🌐 {language.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <div className="chat-scroll-area">
        {!hasMessages && !isLoading ? (
          <div className="welcome-container">
            <div className="welcome-content">
              <span className="welcome-icon">👨‍🍳</span>
              <h2 className="welcome-title">{t.startCooking}</h2>
              <p className="welcome-subtitle">
                {t.placeholder}
              </p>
              <div className="welcome-suggestions">
                {t.quickPrompts.map((s, i) => (
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
      </div>

      {/* Filter Chips Bar */}
      <div className="chat-filters-wrapper">
        <FilterChips filters={filters} onFiltersChange={handleFiltersChange} />
      </div>

      {/* Input Console */}
      <div className="input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="input-field"
            placeholder={t.placeholder}
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
            aria-label={t.send}
            title={t.send}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
