"use client";

import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="recipe-card" id="recipe-card">
      {/* Header */}
      <div className="recipe-card-header">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-meta">
          <span className="recipe-meta-badge">
            <span className="icon">⏱️</span>
            {recipe.time}
          </span>
          <span className="recipe-meta-badge">
            <span className="icon">🍽️</span>
            {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Ingredients */}
      <div className="recipe-card-section">
        <h4 className="recipe-section-title">Ingredients</h4>
        <div className="ingredients-grid">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="ingredient-item">
              <span className="ingredient-bullet" />
              <span className="ingredient-quantity">{ing.quantity}</span>
              <span className="ingredient-name">{ing.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="recipe-card-section">
        <h4 className="recipe-section-title">Instructions</h4>
        <div className="steps-list">
          {recipe.steps.map((step, i) => (
            <div key={i} className="step-item">
              <span className="step-number">{i + 1}</span>
              <p className="step-text">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
