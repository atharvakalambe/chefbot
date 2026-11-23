# 🍳 ChefBot — AI Cooking Assistant

A full-stack AI cooking assistant chatbot built with **Next.js 16** (App Router) and **Google Gemini**. Tell it what ingredients you have, your dietary preferences, or your desired cooking time — it generates complete, structured recipes in real time.

[![Live Demo](https://img.shields.io/badge/Live_Demo-cooking--chatbot--three.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://cooking-chatbot-three.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

### 🌐 Live Application
🔗 **Live URL:** [https://cooking-chatbot-three.vercel.app](https://cooking-chatbot-three.vercel.app)

---

## ✨ Features

- **Natural Language Chat** — Talk naturally: *"I have chicken, rice, and 20 minutes"* or *"Vegetarian dinner, no dairy, feeling spicy"*.
- **Structured Recipe Cards** — Beautiful glassmorphic UI displaying prep time, cook time, difficulty badge, servings, ingredient amounts, and numbered steps.
- **Interactive Quick-Pick Filters** — Instant chips for Dietary Restrictions (Vegetarian, Vegan, Gluten-Free, None), Cuisine Type (Italian, Indian, Mexican, Asian, Any), and Time constraints (15 min, 30 min, 1 hr+).
- **Conversational Memory** — Context-aware follow-ups: *"Make it vegan"*, *"Double the servings"*, or *"Substitute pasta for rice"*.
- **Multi-Model Quota Fallback** — Automated cascade across Gemini model tiers (`gemini-3.5-flash-lite` → `gemini-3.5-flash` → `gemini-2.5-flash` → `gemini-2.0-flash`) ensuring zero downtime on free-tier rate limits.
- **Enterprise-Grade Security** — All Gemini API operations are executed server-side; API keys are never exposed to the client browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **AI Models** | Google Gemini 3.5 Flash-Lite / 2.5 Flash via `@google/genai` |
| **Styling** | Vanilla CSS Design System with Glassmorphism & Custom Properties |
| **Typography** | Inter & JetBrains Mono |
| **Hosting & CI/CD** | Vercel Global Edge Network |

---

## 📋 Prerequisites

- **Node.js** (v20.x or later)
- **Google Gemini API Key** — Available at [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/atharvakalambe/chefbot.git
   cd chefbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key inside `.env.local`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
cooking-chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Server-side Gemini API route handler & fallback
│   ├── globals.css             # Glassmorphic CSS design system
│   ├── layout.tsx              # Root HTML & font configuration
│   └── page.tsx                # Home page wrapper
├── components/
│   ├── ChatInterface.tsx       # Main chat state manager & message stream
│   ├── FilterChips.tsx         # Dietary, cuisine & cooking time selectors
│   ├── LoadingIndicator.tsx    # Animated culinary loading spinner
│   ├── MessageBubble.tsx       # User & AI message presentation
│   └── RecipeCard.tsx          # Structured recipe card renderer
├── public/                     # Static icons and assets
├── types.ts                    # Shared TypeScript interfaces
├── .env.example                # Sample environment template
└── README.md
```

---

## 🌐 Deployment

The application is deployed on **Vercel**:
* **Live App:** [https://cooking-chatbot-three.vercel.app](https://cooking-chatbot-three.vercel.app)

To deploy your own instance:
1. Fork or push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Project Settings → Environment Variables**, add:
   * Key: `GEMINI_API_KEY`
   * Value: `<your-gemini-api-key>`
4. Deploy!

---

## 👥 Team & Collaborators

| Member | Role | GitHub |
|---|---|---|
| **Atharva Kalambe** | Full-Stack & AI Architecture | [@atharvakalambe](https://github.com/atharvakalambe) |
| **Shaikh Hassan** | Frontend Development | [@SkHassan1573](https://github.com/SkHassan1573) |
| **Meet Dholam** | UI/UX & Design System | [@Meetdholam](https://github.com/Meetdholam) |
| **Arpit Shinde** | Prompt Engineering & Testing | [@arpit-rgbt](https://github.com/arpit-rgbt) |
| **Pranay Thombare** | Backend & API Integration | [@pranayth-dev](https://github.com/pranayth-dev) |
| **Ravi Kanojia** | Documentation & QA | [@kanojiaravi305-tech](https://github.com/kanojiaravi305-tech) |

---

## 🔒 Security

- The `GEMINI_API_KEY` is loaded strictly on the server-side via `process.env`.
- API keys are never bundled in client JavaScript or exposed over HTTP headers.

---

## 📄 License

This project is licensed under the MIT License.
