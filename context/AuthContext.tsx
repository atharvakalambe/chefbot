"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: () => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "chefbot_auth_user";
const USERS_STORAGE_KEY = "chefbot_registered_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: "Please enter both email and password." };
    }

    try {
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const registered = usersData ? JSON.parse(usersData) : [];
      const found = registered.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
      );

      if (found) {
        const loggedInUser: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          createdAt: found.createdAt,
        };
        setUser(loggedInUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
        setIsAuthModalOpen(false);
        return { success: true };
      }

      // If user is testing, allow login if password matches simple criteria
      return {
        success: false,
        error: "Invalid email or password. Click 'Instant Demo Login' to try immediately!",
      };
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || !email || !pass) {
      return { success: false, error: "All fields are required." };
    }
    if (pass.length < 4) {
      return { success: false, error: "Password must be at least 4 characters." };
    }

    try {
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const registered = usersData ? JSON.parse(usersData) : [];

      if (registered.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "An account with this email already exists." };
      }

      const newUser: User = {
        id: "usr_" + Date.now(),
        name,
        email,
        createdAt: new Date().toISOString(),
      };

      registered.push({ ...newUser, password: pass });
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registered));

      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: "Failed to create account." };
    }
  };

  const demoLogin = () => {
    const demoUser: User = {
      id: "usr_demo",
      name: "Chef Atharva",
      email: "chef.atharva@example.com",
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        demoLogin,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
