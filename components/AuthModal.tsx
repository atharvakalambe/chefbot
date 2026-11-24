"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup, demoLogin } = useAuth();
  const { t } = useChat();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signup(name, email, password);
        if (!res.success) setError(res.error || "Signup failed");
      } else {
        const res = await login(email, password);
        if (!res.success) setError(res.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    demoLogin();
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuthModal} aria-label="Close">
          ✕
        </button>

        <div className="auth-header">
          <span className="auth-icon">🍳</span>
          <h2>{isSignUp ? t.createAccount : t.welcomeBack}</h2>
          <p className="auth-subtitle">{t.appTagline}</p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isSignUp ? "active" : ""}`}
            onClick={() => {
              setIsSignUp(false);
              setError("");
            }}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            className={`auth-tab ${isSignUp ? "active" : ""}`}
            onClick={() => {
              setIsSignUp(true);
              setError("");
            }}
          >
            {t.signUp}
          </button>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="auth-name">{t.nameLabel}</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Atharva"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">{t.emailLabel}</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chef@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-pass">{t.passwordLabel}</label>
            <input
              id="auth-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-submit-auth" disabled={loading}>
            {loading ? "..." : isSignUp ? t.submitSignUp : t.submitSignIn}
          </button>
        </form>

        <div className="auth-divider">
          <span>{t.orContinueWith}</span>
        </div>

        {/* 1-Click Demo Login Button */}
        <button type="button" className="btn-demo-auth" onClick={handleDemo}>
          <span className="demo-sparkle">✨</span>
          <span>{t.demoLogin}</span>
        </button>
      </div>
    </div>
  );
}
