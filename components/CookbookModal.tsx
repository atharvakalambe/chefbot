"use client";

import React, { useState, useMemo } from "react";
import { useChat } from "@/context/ChatContext";
import { Recipe } from "@/types";

export default function CookbookModal() {
  const { isCookbookOpen, closeCookbook, savedRecipes, removeSavedRecipe, t } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  // Filter recipes based on search
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return savedRecipes;
    const q = searchQuery.toLowerCase();
    return savedRecipes.filter((item) => {
      const matchTitle = item.recipe.title.toLowerCase().includes(q);
      const matchIngr = item.recipe.ingredients.some((i) =>
        i.name.toLowerCase().includes(q)
      );
      return matchTitle || matchIngr;
    });
  }, [savedRecipes, searchQuery]);

  if (!isCookbookOpen) return null;

  const handlePrint = (recipe: Recipe) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${recipe.title} - ChefBot Recipe</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #222; }
            h1 { color: #d97706; border-bottom: 2px solid #fef3c7; padding-bottom: 8px; }
            .meta { font-size: 14px; color: #666; margin-bottom: 20px; }
            ul, ol { line-height: 1.6; }
            li { margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <h1>🍳 ${recipe.title}</h1>
          <div class="meta">
            <strong>⏱️ ${t.time}:</strong> ${recipe.time} &nbsp;|&nbsp;
            <strong>👥 ${t.servings}:</strong> ${recipe.servings * servingsMultiplier}
          </div>
          <h2>🛒 ${t.ingredients}</h2>
          <ul>
            ${recipe.ingredients
              .map((i) => `<li><strong>${i.name}:</strong> ${i.quantity}</li>`)
              .join("")}
          </ul>
          <h2>👩‍🍳 ${t.instructions}</h2>
          <ol>
            ${recipe.steps.map((s) => `<li>${s}</li>`).join("")}
          </ol>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="modal-backdrop" onClick={closeCookbook}>
      <div className="cookbook-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cookbook-header">
          <div className="cookbook-title-area">
            <span className="cookbook-big-icon">📚</span>
            <div>
              <h2>{t.cookbookTitle}</h2>
              <p>{t.cookbookDesc}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={closeCookbook} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="cookbook-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCookbook}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="cookbook-body">
          {savedRecipes.length === 0 ? (
            <div className="cookbook-empty-state">
              <span className="empty-icon">📖</span>
              <h3>{t.noSavedRecipes}</h3>
              <p>{t.noSavedDesc}</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="cookbook-empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No matching recipes found</h3>
              <p>Try searching for a different ingredient or dish name.</p>
            </div>
          ) : (
            <div className="cookbook-grid">
              {filteredRecipes.map((item) => (
                <div key={item.id} className="saved-recipe-card">
                  <div className="saved-card-header">
                    <h4>{item.recipe.title}</h4>
                    <button
                      className="btn-remove-saved"
                      onClick={() => removeSavedRecipe(item.recipe.title)}
                      title={t.remove}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="saved-card-badges">
                    <span className="badge">⏱️ {item.recipe.time}</span>
                    <span className="badge">👥 {item.recipe.servings} {t.servings}</span>
                  </div>

                  <div className="saved-card-preview">
                    <strong>{t.ingredients}:</strong>
                    <p>
                      {item.recipe.ingredients.slice(0, 4).map((i) => i.name).join(", ")}
                      {item.recipe.ingredients.length > 4 && "..."}
                    </p>
                  </div>

                  <div className="saved-card-actions">
                    <button
                      className="btn-view-recipe"
                      onClick={() => setSelectedRecipe(item.recipe)}
                    >
                      👁️ View Details
                    </button>
                    <button
                      className="btn-print-recipe"
                      onClick={() => handlePrint(item.recipe)}
                      title={t.printRecipe}
                    >
                      🖨️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Recipe Viewer Sub-Modal */}
        {selectedRecipe && (
          <div className="recipe-detail-overlay" onClick={() => setSelectedRecipe(null)}>
            <div className="recipe-detail-card" onClick={(e) => e.stopPropagation()}>
              <div className="detail-card-header">
                <h3>{selectedRecipe.title}</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setSelectedRecipe(null)}
                >
                  ✕
                </button>
              </div>

              <div className="detail-meta-row">
                <span className="badge">⏱️ {selectedRecipe.time}</span>
                <span className="badge">👥 {selectedRecipe.servings} {t.servings}</span>
                <div className="servings-scaler">
                  <span>Scale: </span>
                  <button
                    className={servingsMultiplier === 1 ? "active" : ""}
                    onClick={() => setServingsMultiplier(1)}
                  >
                    1x
                  </button>
                  <button
                    className={servingsMultiplier === 2 ? "active" : ""}
                    onClick={() => setServingsMultiplier(2)}
                  >
                    2x
                  </button>
                  <button
                    className={servingsMultiplier === 3 ? "active" : ""}
                    onClick={() => setServingsMultiplier(3)}
                  >
                    3x
                  </button>
                </div>
              </div>

              <div className="detail-section">
                <h4>🛒 {t.ingredients}</h4>
                <ul className="detail-ingredients-list">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}>
                      <span className="ing-name">{ing.name}</span>
                      <span className="ing-qty">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h4>👩‍🍳 {t.instructions}</h4>
                <ol className="detail-steps-list">
                  {selectedRecipe.steps.map((st, idx) => (
                    <li key={idx}>{st}</li>
                  ))}
                </ol>
              </div>

              <div className="detail-footer">
                <button
                  className="btn-print-full"
                  onClick={() => handlePrint(selectedRecipe)}
                >
                  🖨️ {t.printRecipe}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
