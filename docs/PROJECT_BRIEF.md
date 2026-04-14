# Project Brief

## Project Name

Brass Elephant Event Engine

## Mission

Create a repeatable event landing page system that helps The Brass Elephant Lounge & Grill launch, promote, and manage event campaigns as part of its broader marketing engine.

## Current State

- React 18, TypeScript, Vite, and Tailwind CSS are already in place.
- Event pages are driven by JSON config files in `src/events`.
- Shared sections exist for hero, highlights, schedule, gallery, RSVP, FAQ, CTA, location, and footer.
- Routing is live for an events index and individual event pages.
- RSVP submissions are still stored in `localStorage` and need backend persistence.
- Bolt/Supabase dependencies are installed, but database integration has not started.

## Source-of-Truth Files

- Event routes: `src/App.tsx`
- Event renderer: `src/pages/EventPage.tsx`
- Events listing: `src/pages/EventsIndex.tsx`
- Event registry: `src/lib/getEvent.ts`
- Theme tokens: `src/lib/themes.ts`
- Event schema: `src/types/event.ts`
- Event content: `src/events/*.json`

## Delivery Goals

1. Launch polished event landing pages quickly from structured content.
2. Keep brand styling consistent while allowing event-specific themes.
3. Capture RSVP intent and support follow-up marketing workflows.
4. Give the team a predictable way to add events without rewriting UI code.
5. Prepare the system for admin operations, analytics, and campaign reporting.

## Known Gaps

- No backend persistence for RSVP data yet.
- No admin dashboard or event editing workflow.
- Events index is functional but still basic.
- Media operations are not yet standardized.
- SEO, analytics, and release process are not documented in-repo.

## Working Agreements

- New events should be created as JSON-first content unless a feature requires schema changes.
- Shared styling changes should go through `src/lib/themes.ts` and `src/index.css` before component-level overrides.
- All roadmap work should be mapped to an owning agent in `docs/AGENTS.md`.
- Production changes should pass `build`, `typecheck`, and `lint`.
