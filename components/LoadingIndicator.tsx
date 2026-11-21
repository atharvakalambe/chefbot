"use client";

export function LoadingIndicator() {
  return (
    <div className="loading-wrapper">
      <div className="loading-indicator" id="loading-indicator">
        <div className="loading-dots">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
        <span className="loading-text">Chef is cooking up a recipe…</span>
      </div>
    </div>
  );
}
