"use client";

import type { Filters } from "@/types";

interface FilterChipsProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const FILTER_OPTIONS = {
  dietary: {
    label: "Dietary",
    options: [
      { value: "none", label: "None" },
      { value: "vegetarian", label: "🥬 Vegetarian" },
      { value: "vegan", label: "🌱 Vegan" },
      { value: "gluten-free", label: "🌾 Gluten-Free" },
    ],
  },
  cuisine: {
    label: "Cuisine",
    options: [
      { value: "any", label: "Any" },
      { value: "italian", label: "🇮🇹 Italian" },
      { value: "indian", label: "🇮🇳 Indian" },
      { value: "mexican", label: "🇲🇽 Mexican" },
      { value: "asian", label: "🥢 Asian" },
    ],
  },
  time: {
    label: "Time",
    options: [
      { value: "15 min", label: "⚡ 15 min" },
      { value: "30 min", label: "⏱️ 30 min" },
      { value: "1 hour+", label: "🕐 1 hour+" },
    ],
  },
};

export function FilterChips({ filters, onFiltersChange }: FilterChipsProps) {
  const handleSelect = (group: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [group]: value,
    });
  };

  return (
    <div className="filters-container" id="filter-chips">
      {(Object.entries(FILTER_OPTIONS) as [keyof Filters, typeof FILTER_OPTIONS.dietary][]).map(
        ([group, config]) => (
          <div key={group} className="filter-group">
            <div className="filter-label">{config.label}</div>
            <div className="filter-chips">
              {config.options.map((option) => (
                <button
                  key={option.value}
                  className={`filter-chip ${
                    filters[group] === option.value ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(group, option.value)}
                  id={`filter-${group}-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
