"use client";

import React, { useMemo } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { LANGUAGES } from "@/lib/i18n";
import { Language } from "@/types";

export default function Sidebar() {
  const {
    language,
    setLanguage,
    t,
    sessions,
    activeSessionId,
    createSession,
    switchSession,
    deleteSession,
    savedRecipes,
    openCookbook,
    isSidebarOpen,
    toggleSidebar,
  } = useChat();

  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  // Group sessions by Today, Yesterday, Older
  const groupedSessions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    const today: typeof sessions = [];
    const yesterday: typeof sessions = [];
    const older: typeof sessions = [];

    sessions.forEach((s) => {
      const time = s.updatedAt || s.createdAt;
      if (time >= todayStart) {
        today.push(s);
      } else if (time >= yesterdayStart) {
        yesterday.push(s);
      } else {
        older.push(s);
      }
    });

    return { today, yesterday, older };
  }, [sessions]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`app-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">🍳</span>
            <div className="brand-text">
              <h2>{t.appName}</h2>
              <span className="brand-tag">{t.appTagline}</span>
            </div>
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            ✕
          </button>
        </div>

        {/* Language Selector */}
        <div className="sidebar-lang-picker">
          <label htmlFor="lang-select">🌐</label>
          <select
            id="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="lang-select"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action: New Recipe */}
        <div className="sidebar-actions">
          <button
            className="btn-new-chat"
            onClick={() => createSession()}
          >
            <span className="plus-icon">+</span>
            <span>{t.newChat}</span>
          </button>

          {/* Cookbook / Archive Button */}
          <button
            className="btn-cookbook"
            onClick={openCookbook}
          >
            <span className="cookbook-icon">📚</span>
            <span className="cookbook-label">{t.myCookbook}</span>
            {savedRecipes.length > 0 && (
              <span className="cookbook-badge">{savedRecipes.length}</span>
            )}
          </button>
        </div>

        {/* Chat History Section */}
        <div className="sidebar-history-container">
          <div className="history-header">
            <span>{t.recentChats}</span>
          </div>

          <div className="history-list">
            {sessions.length === 0 ? (
              <div className="history-empty">
                <p>{t.noChatsYet}</p>
              </div>
            ) : (
              <>
                {groupedSessions.today.length > 0 && (
                  <div className="history-group">
                    <span className="group-label">{t.today}</span>
                    {groupedSessions.today.map((s) => (
                      <HistoryItem
                        key={s.id}
                        session={s}
                        isActive={s.id === activeSessionId}
                        onSelect={() => switchSession(s.id)}
                        onDelete={() => deleteSession(s.id)}
                        deleteLabel={t.deleteChat}
                      />
                    ))}
                  </div>
                )}

                {groupedSessions.yesterday.length > 0 && (
                  <div className="history-group">
                    <span className="group-label">{t.yesterday}</span>
                    {groupedSessions.yesterday.map((s) => (
                      <HistoryItem
                        key={s.id}
                        session={s}
                        isActive={s.id === activeSessionId}
                        onSelect={() => switchSession(s.id)}
                        onDelete={() => deleteSession(s.id)}
                        deleteLabel={t.deleteChat}
                      />
                    ))}
                  </div>
                )}

                {groupedSessions.older.length > 0 && (
                  <div className="history-group">
                    <span className="group-label">{t.older}</span>
                    {groupedSessions.older.map((s) => (
                      <HistoryItem
                        key={s.id}
                        session={s}
                        isActive={s.id === activeSessionId}
                        onSelect={() => switchSession(s.id)}
                        onDelete={() => deleteSession(s.id)}
                        deleteLabel={t.deleteChat}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="sidebar-footer">
          {isAuthenticated && user ? (
            <div className="user-profile">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button
                className="btn-logout"
                onClick={logout}
                title={t.signOut}
              >
                🚪
              </button>
            </div>
          ) : (
            <div className="guest-profile">
              <div className="guest-info">
                <span className="guest-avatar">👤</span>
                <span className="guest-name">{t.guestUser}</span>
              </div>
              <button
                className="btn-login-open"
                onClick={openAuthModal}
              >
                {t.signIn}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function HistoryItem({
  session,
  isActive,
  onSelect,
  onDelete,
  deleteLabel,
}: {
  session: { id: string; title: string };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  deleteLabel: string;
}) {
  return (
    <div className={`history-item ${isActive ? "active" : ""}`} onClick={onSelect}>
      <span className="history-icon">💬</span>
      <span className="history-title" title={session.title}>
        {session.title}
      </span>
      <button
        className="btn-delete-session"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title={deleteLabel}
        aria-label={deleteLabel}
      >
        🗑️
      </button>
    </div>
  );
}
