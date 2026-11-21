# 🍳 ChefBot — AI Cooking Assistant

A full-stack AI cooking assistant chatbot built with **Next.js 15** (App Router) and **Google Gemini**. Tell it what ingredients you have, your dietary preferences, or just describe your mood — it generates complete, structured recipes in real time.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-orange?logo=google)

## ✨ Features

- **Natural language chat** — talk like you would to a friend: "I have chicken, rice, and 20 minutes"
- **Structured recipe cards** — beautifully rendered with title, servings, ingredients, steps, and cook time
- **Quick-pick filter chips** — dietary restrictions, cuisine type, and time available
- **Conversation context** — ask follow-ups like "make it vegan" or "double the servings"
- **Server-side AI calls** — API key never exposed to the browser
- **Stunning dark UI** — glassmorphic design with smooth animations

## 📋 Prerequisites

- **Node.js** 20 or later
- **Gemini API key** — get one free at [Google AI Studio](https://aistudio.google.com/)

## 🚀 Setup

1. **Clone the repo**
   ```bash
   git clone <your-repo-url> cooking-chatbot
   cd cooking-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API key**
   
   Copy the example env file and add your key:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
cooking-chatbot/
├── app/
│   ├── api/chat/
│   │   └── route.ts        # Server-side Gemini API handler
│   ├── globals.css          # Full design system
│   ├── layout.tsx           # Root layout with fonts & metadata
│   └── page.tsx             # Home page
├── components/
│   ├── ChatInterface.tsx    # Main chat UI & state management
│   ├── FilterChips.tsx      # Dietary/cuisine/time filter chips
│   ├── RecipeCard.tsx       # Structured recipe card renderer
│   ├── MessageBubble.tsx    # User & assistant message bubbles
│   └── LoadingIndicator.tsx # Animated loading state
├── types.ts                 # Shared TypeScript interfaces
├── .env.example             # Environment variable template
└── README.md
```

## 🌐 Deployment

### Vercel (recommended)

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` as an environment variable in Vercel project settings
4. Deploy — that's it!

### Self-hosted

```bash
npm run build
npm start
```

Make sure `GEMINI_API_KEY` is set in your environment.

## 🛡️ Security

- The Gemini API key is **never** sent to the browser
- All AI calls happen server-side via the `/api/chat` route handler
- The key is read from `process.env.GEMINI_API_KEY` at runtime

## 📝 License

MIT

## ?? Team & Collaborators

| Member | Role | GitHub |
|---|---|---|
| **Atharva Kalambe** (Lead) | Full-Stack & AI Architecture | [@Atharva](https://github.com) |
| **Collaborator 2** | Frontend Development | [@username](https://github.com) |
| **Collaborator 3** | UI/UX & Design System | [@username](https://github.com) |
| **Collaborator 4** | Prompt Engineering & Testing | [@username](https://github.com) |
| **Collaborator 5** | Backend & API Integration | [@username](https://github.com) |
| **Collaborator 6** | Documentation & QA | [@username](https://github.com) |
