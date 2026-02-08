# Repository Parts: Frontend vs Backend

This document breaks the repository into two primary parts.

## Frontend (Next.js App)

**Primary location:** `src/`

**What it includes:**
- Next.js App Router pages and layouts.
- React components, hooks, and providers.
- Client-side utilities, types, and styles.
- Static assets under `public/` used by the UI.

**Key paths:**
- `src/app/` — routes, layouts, and pages.
- `src/components/` — UI components (auth, chat, room, video, etc.).
- `src/hooks/` — reusable React hooks.
- `src/lib/` — frontend utilities and API clients.
- `src/providers/` — React context providers.
- `public/` — static assets used by the frontend.

## Backend (Express + GraphQL API)

**Primary location:** `backend/`

**What it includes:**
- Express server entry point.
- GraphQL schema and resolvers.
- MongoDB models and data access.
- REST endpoints (deprecated, kept for compatibility).

**Key paths:**
- `backend/server.js` — Express server bootstrap.
- `backend/graphql/` — GraphQL schema and resolvers.
- `backend/models/` — Mongoose models for MongoDB.
- `backend/routes/` — REST endpoints (deprecated).
