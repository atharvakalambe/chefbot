"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ChatSession, Filters, Language, Message, Recipe, SavedRecipe } from "@/types";
import { TRANSLATIONS, Translations } from "@/lib/i18n";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  sessions: ChatSession[];
  activeSessionId: string;
  activeSession: ChatSession | null;
  createSession: () => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  addMessage: (message: Message) => void;
  setSessionFilters: (filters: Filters) => void;
  savedRecipes: SavedRecipe[];
  saveRecipe: (recipe: Recipe) => void;
  removeSavedRecipe: (recipeTitle: string) => void;
  isRecipeSaved: (recipeTitle: string) => boolean;
  isCookbookOpen: boolean;
  openCookbook: () => void;
  closeCookbook: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const DEFAULT_FILTERS: Filters = {
  dietary: "none",
  cuisine: "any",
  time: "any",
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>("en");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isCookbookOpen, setIsCookbookOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Storage keys scoped to user
  const userScope = user ? user.id : "guest";
  const SESSIONS_KEY = `chefbot_sessions_${userScope}`;
  const SAVED_RECIPES_KEY = `chefbot_saved_recipes_${userScope}`;
  const LANG_KEY = "chefbot_selected_lang";

  // Load language preference
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY) as Language;
      if (savedLang && TRANSLATIONS[savedLang]) {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.error("Failed to load language", e);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  // Load user sessions and saved recipes
  useEffect(() => {
    try {
      const rawSessions = localStorage.getItem(SESSIONS_KEY);
      let parsedSessions: ChatSession[] = rawSessions ? JSON.parse(rawSessions) : [];

      if (parsedSessions.length === 0) {
        // Create initial default session
        const initialSession: ChatSession = {
          id: "session_" + Date.now(),
          title: t.newChat,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          filters: DEFAULT_FILTERS,
          language: language,
        };
        parsedSessions = [initialSession];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(parsedSessions));
      }

      setSessions(parsedSessions);
      setActiveSessionId(parsedSessions[0].id);

      const rawSaved = localStorage.getItem(SAVED_RECIPES_KEY);
      setSavedRecipes(rawSaved ? JSON.parse(rawSaved) : []);
    } catch (e) {
      console.error("Failed to load user chat data", e);
    }
  }, [userScope]);

  // Sync sessions to localStorage
  const persistSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
    } catch (e) {
      console.error(e);
    }
  };

  // Sync saved recipes to localStorage
  const persistSavedRecipes = (newRecipes: SavedRecipe[]) => {
    setSavedRecipes(newRecipes);
    try {
      localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(newRecipes));
    } catch (e) {
      console.error(e);
    }
  };

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  const createSession = (): string => {
    const newSession: ChatSession = {
      id: "session_" + Date.now(),
      title: t.newChat,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      filters: DEFAULT_FILTERS,
      language: language,
    };
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const switchSession = (id: string) => {
    setActiveSessionId(id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === 0) {
      // Re-create one empty session
      const fresh: ChatSession = {
        id: "session_" + Date.now(),
        title: t.newChat,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        filters: DEFAULT_FILTERS,
        language: language,
      };
      persistSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      persistSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, title: newTitle.trim() || t.newChat, updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  };

  const addMessage = (msg: Message) => {
    setSessions((prev) => {
      return prev.map((s) => {
        if (s.id !== activeSessionId) return s;

        // Auto-generate a readable title from the first recipe or message
        let newTitle = s.title;
        if (s.messages.length === 0) {
          if (msg.recipe?.title) {
            newTitle = msg.recipe.title;
          } else if (msg.role === "user") {
            newTitle = msg.content.length > 28 ? msg.content.substring(0, 28) + "..." : msg.content;
          }
        } else if (s.title === t.newChat && msg.recipe?.title) {
          newTitle = msg.recipe.title;
        }

        const updatedSession = {
          ...s,
          title: newTitle,
          updatedAt: Date.now(),
          messages: [...s.messages, msg],
        };

        const otherSessions = prev.filter((item) => item.id !== activeSessionId);
        const finalSessions = [updatedSession, ...otherSessions];
        try {
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(finalSessions));
        } catch (e) {
          console.error(e);
        }
        return updatedSession;
      });
    });
  };

  const setSessionFilters = (filters: Filters) => {
    const updated = sessions.map((s) =>
      s.id === activeSessionId ? { ...s, filters, updatedAt: Date.now() } : s
    );
    persistSessions(updated);
  };

  // Recipe Archive / Cookbook operations
  const saveRecipe = (recipe: Recipe) => {
    if (isRecipeSaved(recipe.title)) return;
    const newSaved: SavedRecipe = {
      id: "saved_" + Date.now(),
      recipe,
      savedAt: Date.now(),
      sourceSessionId: activeSessionId,
      language: language,
    };
    persistSavedRecipes([newSaved, ...savedRecipes]);
  };

  const removeSavedRecipe = (recipeTitle: string) => {
    const filtered = savedRecipes.filter(
      (r) => r.recipe.title.toLowerCase() !== recipeTitle.toLowerCase()
    );
    persistSavedRecipes(filtered);
  };

  const isRecipeSaved = (recipeTitle: string): boolean => {
    return savedRecipes.some(
      (r) => r.recipe.title.toLowerCase() === recipeTitle.toLowerCase()
    );
  };

  return (
    <ChatContext.Provider
      value={{
        language,
        setLanguage,
        t,
        sessions,
        activeSessionId,
        activeSession,
        createSession,
        switchSession,
        deleteSession,
        renameSession,
        addMessage,
        setSessionFilters,
        savedRecipes,
        saveRecipe,
        removeSavedRecipe,
        isRecipeSaved,
        isCookbookOpen,
        openCookbook: () => setIsCookbookOpen(true),
        closeCookbook: () => setIsCookbookOpen(false),
        isSidebarOpen,
        toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
        closeSidebar: () => setIsSidebarOpen(false),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
