# PROJECT A³ — Frontend (UI Design Framework)

A complete, working React + TypeScript + Tailwind CSS frontend for the A³ customer-to-product
intelligence platform, matching the provided dashboard mockup. Ships with realistic mock data and
a mock AI service so every screen is fully interactive without any backend.

## What's included

- **Developer Dashboard** — stats, recent cases, review sentiment donut, agent workflow overview, quick actions, system status
- **Product Management** — list, publish/unpublish
- **Customer Product Feed + Product Detail** — browsing, reviews, "Write a Review" flow that triggers the mock Sentinel and opens a case on low ratings
- **Customer Cases** — list + detail with tabs: Case Overview, Conversation (live mock chat with case memory), Agent Workflow, Engineering Issue
- **Engineering Issues** — list + full detail with markdown ticket preview and Approve/Edit/Reject
- **Analytics Dashboard** — sentiment/severity/status donuts, review trend, root causes, resolution trend
- **Integrations, Settings, Agent Workflow explainer pages**

## Tech stack

- React 19 + TypeScript
- Tailwind CSS v4
- React Router v6
- Recharts (charts)
- lucide-react (icons)

## Project structure

```
src/
  components/     Sidebar, Topbar, Layout, Badge, StatCard, ProductThumb,
                   CaseConversation, AgentWorkflowPanel, EngineeringIssuePanel
  pages/          One file per route/screen
  context/        AppContext (role-based demo auth)
  services/       aiService.ts — the AIService interface + MockAIService
  data/           mockData.ts — seeded products, reviews, cases, issues
  types/          Shared TypeScript interfaces
```

## Running locally

```bash
npm install
npm run dev
```

For the connected experience, start the backend in a second terminal first:

```bash
cd ../a3-backend
python -m app.seed
python -m uvicorn app.main:app --reload --port 8000
```

The frontend uses `http://127.0.0.1:8000` by default. To use another backend URL, create a
`.env` file from `.env.example` and set `VITE_API_URL`.

Open the printed local URL, then choose **Continue as Developer** or **Continue as Customer** on the
login screen (no password needed in this demo).

Build for production:

```bash
npm run build
npm run preview
```

## Where the mock AI lives

`src/services/aiService.ts` exports a single `AIService` interface with two methods:

- `analyzeReview(text, rating)` — mirrors the future **Product Sentinel** agent
- `generateCustomerResponse(message, memory)` — mirrors the future **Customer Resolution Agent**

Today `MockAIService` implements this interface with deterministic, realistic responses (with a
simulated delay). When the real backend is built, a FastAPI endpoint backed by CrewAI + Ollama can
be swapped in behind the same interface — **no changes to any page or component are required.**

## Demo scenario

1. Log in as Customer → open **Smart Wireless Headphones** in the Product Feed
2. Click **Write a Review**, give it 2 stars, describe battery/heat issues, submit
3. You're redirected into the pre-seeded case (**CASE-1024**) showing the full Sentinel analysis
4. Switch to Developer → **Customer Cases** → open **CASE-1024** → walk through the Conversation,
   Agent Workflow, and Engineering Issue tabs
5. **Engineering Issues** → open **ISSUE-2025-1024** → Approve / Edit / Reject

## Current backend connection

Authentication, review analysis, and case conversation now call the FastAPI backend. The remaining
dashboard and management screens still use the seeded frontend display data while their asynchronous
loading states are added incrementally.

The integration boundary is:

1. `src/services/apiClient.ts` owns the API base URL, bearer token, and request handling.
2. `src/context/AppContext.tsx` logs in with the seeded backend demo accounts.
3. `src/services/aiService.ts` calls `/api/reviews/analyze` and `/api/cases/{id}/messages`.
