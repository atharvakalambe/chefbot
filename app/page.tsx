"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import Sidebar from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import CookbookModal from "@/components/CookbookModal";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  return (
    <AuthProvider>
      <ChatProvider>
        <div className="chefbot-layout">
          <Sidebar />
          <main className="chefbot-main">
            <ChatInterface />
          </main>
          <CookbookModal />
          <AuthModal />
        </div>
      </ChatProvider>
    </AuthProvider>
  );
}
