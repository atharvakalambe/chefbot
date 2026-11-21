"use client";

import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message-wrapper ${message.role}`}>
      <div className={`message-bubble ${message.role}`}>
        <span>{message.content}</span>
        {isUser && message.filters && hasActiveFilters(message.filters) && (
          <div className="message-filters">
            {message.filters.dietary !== "none" && (
              <span className="message-filter-tag">{message.filters.dietary}</span>
            )}
            {message.filters.cuisine !== "any" && (
              <span className="message-filter-tag">{message.filters.cuisine}</span>
            )}
            {message.filters.time && (
              <span className="message-filter-tag">{message.filters.time}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function hasActiveFilters(filters: { dietary: string; cuisine: string; time: string }): boolean {
  return filters.dietary !== "none" || filters.cuisine !== "any" || !!filters.time;
}
