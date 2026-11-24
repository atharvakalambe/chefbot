"use client";

import React from "react";
import type { Filters } from "@/types";
import { useChat } from "@/context/ChatContext";

interface FilterChipsProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterChips({ filters, onFiltersChange }: FilterChipsProps) {
  const { t } = useChat();

  const handleSelect = (group: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [group]: value,
    });
  };

  const filterConfigs: {
    group: keyof Filters;
    label: string;
    options: { value: string; label: string; icon?: string }[];
  }[] = [
    {
      group: "dietary",
      label: t.dietary,
      options: [
        { value: "none", label: t.allDietary.none || "None" },
        { value: "vegetarian", label: t.allDietary.vegetarian || "Vegetarian", icon: "🥬" },
        { value: "vegan", label: t.allDietary.vegan || "Vegan", icon: "🌱" },
        { value: "gluten-free", label: t.allDietary["gluten-free"] || "Gluten-Free", icon: "🌾" },
      ],
    },
    {
      group: "cuisine",
      label: t.cuisine,
      options: [
        { value: "any", label: t.allCuisines.any || "Any" },
        { value: "italian", label: t.allCuisines.italian || "Italian", icon: "🇮🇹" },
        { value: "indian", label: t.allCuisines.indian || "Indian", icon: "🇮🇳" },
        { value: "mexican", label: t.allCuisines.mexican || "Mexican", icon: "🇲🇽" },
        { value: "asian", label: t.allCuisines.asian || "Asian", icon: "🥢" },
      ],
    },
    {
      group: "time",
      label: t.timeAvailable,
      options: [
        { value: "any", label: t.allTimes.any || "Any" },
        { value: "15 min", label: t.allTimes["15 min"] || "15 min", icon: "⚡" },
        { value: "30 min", label: t.allTimes["30 min"] || "30 min", icon: "⏱️" },
        { value: "1 hour+", label: t.allTimes["1 hour+"] || "1 hour+", icon: "🕐" },
      ],
    },
  ];

  return (
    <div className="filters-container" id="filter-chips">
      {filterConfigs.map(({ group, label, options }) => (
        <div key={group} className="filter-group">
          <div className="filter-label">{label}</div>
          <div className="filter-chips">
            {options.map((option) => (
              <button
                key={option.value}
                className={`filter-chip ${
                  filters[group] === option.value ? "selected" : ""
                }`}
                onClick={() => handleSelect(group, option.value)}
                id={`filter-${group}-${option.value}`}
              >
                {option.icon && <span className="chip-icon">{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
