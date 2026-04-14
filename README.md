# Brass Elephant Event Engine

The Brass Elephant Event Engine is the event landing page system for The Brass Elephant Lounge & Grill marketing stack. It uses React, TypeScript, Vite, and Tailwind CSS to generate branded event pages from JSON event definitions.

## What This Repo Owns

- Dynamic event landing pages at `/events/:slug`
- Shared event page components and theming
- Event content stored in JSON files under `src/events`
- RSVP experience frontend, ready for backend integration
- Project operating docs for planning, ownership, and delivery

## Core Paths

- `src/events/`: event configuration files
- `src/components/`: reusable event page sections
- `src/pages/`: route-level pages
- `src/lib/`: event loading and theming utilities
- `src/types/`: shared TypeScript models
- `docs/`: project brief, agent ownership, and roadmap

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Current Priorities

1. Replace local RSVP storage with database-backed submissions.
2. Expand the events index into a true discovery page.
3. Standardize media hosting and asset naming.
4. Prepare admin workflows for event operations and reporting.

See `docs/PROJECT_BRIEF.md`, `docs/AGENTS.md`, and `docs/ROADMAP.md` for the operating model.
