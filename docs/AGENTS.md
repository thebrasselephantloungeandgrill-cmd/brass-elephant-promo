# Agents

This document defines the operating agents for the Brass Elephant Event Engine. These are workstream owners, not separate applications. They keep delivery coordinated as the marketing engine grows.

## 1. Platform Agent

Owns the application foundation and release readiness.

- Maintains Vite, React, TypeScript, Tailwind, routing, and shared architecture.
- Reviews changes to `src/App.tsx`, `src/main.tsx`, and build config.
- Verifies `npm run build`, `npm run typecheck`, and `npm run lint`.
- Protects component reuse and prevents one-off event code from leaking into the core system.

## 2. Event Content Agent

Owns event definitions and publishing quality.

- Manages `src/events/*.json`.
- Validates copy, dates, CTA labels, media references, and structured event data.
- Ensures each event maps cleanly to the shared `EventConfig` type in `src/types/event.ts`.
- Tracks which events are draft, scheduled, live, or recap-ready.

## 3. Experience Agent

Owns event page quality and conversion UX.

- Maintains shared event components under `src/components/`.
- Improves event page hierarchy, mobile layout, CTA visibility, and themed presentation.
- Owns enhancements to the events index experience in `src/pages/EventsIndex.tsx`.
- Keeps the brand experience consistent with Brass Elephant positioning.

## 4. RSVP and Data Agent

Owns attendee capture and data integrity.

- Replaces `localStorage` RSVP handling in `src/components/EventRSVPForm.tsx`.
- Designs RSVP schema, validation rules, and submission workflows.
- Implements Supabase tables, policies, and typed client access when backend work begins.
- Defines how RSVP data feeds waitlists, VIP follow-up, and reporting.

## 5. Media and SEO Agent

Owns asset quality, discoverability, and campaign metadata.

- Standardizes image hosting, naming, alt text, and aspect-ratio rules.
- Manages hero images, flyers, gallery assets, and OG image quality.
- Reviews SEO titles, descriptions, and social metadata in event JSON files.
- Prepares sitemap, analytics, and sharing requirements once enabled.

## 6. Ops and Growth Agent

Owns execution tracking for the full marketing engine.

- Converts roadmap items into milestones and release priorities.
- Tracks campaign dependencies such as RSVP launch, email capture, calendar links, and analytics.
- Coordinates future admin dashboard and reporting needs.
- Keeps `docs/ROADMAP.md` current as priorities shift.

## Operating Cadence

- Before starting a feature, identify the owning agent and impacted files.
- If a task spans multiple agents, the primary owner coordinates acceptance criteria.
- Content and design changes should not ship without platform verification.
- RSVP and analytics changes should not ship without data and privacy review.

## Active Priorities

- `RSVP and Data Agent`: database-backed RSVP flow
- `Experience Agent`: richer events index page
- `Media and SEO Agent`: asset strategy and metadata audit
- `Ops and Growth Agent`: admin/dashboard scoping
