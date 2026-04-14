# Roadmap

## Now

### 1. RSVP Backend Integration

Owner: RSVP and Data Agent

- Create RSVP table design and submission model.
- Replace local `localStorage` submission handling.
- Add validation, error states, and submission success handling.
- Define optional confirmation email workflow.

### 2. Events Index Upgrade

Owner: Experience Agent

- Turn the current listing into a branded discovery page.
- Add event status, filtering, and stronger card presentation.
- Support upcoming versus past event treatment if recap pages are added.

### 3. Media System Standards

Owner: Media and SEO Agent

- Confirm long-term media host strategy.
- Define asset naming, folder conventions, and fallback rules.
- Audit hero, flyer, gallery, and OG image requirements.

## Next

### 4. Data Model Expansion

Owner: RSVP and Data Agent

- Add tables for events, attendees, VIP requests, and waitlists.
- Define row-level security and admin access rules.
- Prepare a typed data access layer for frontend use.

### 5. Admin and Publishing Workflow

Owner: Ops and Growth Agent

- Scope admin dashboard requirements.
- Decide when to keep JSON-based authoring versus UI-based event creation.
- Design event lifecycle states: draft, scheduled, live, closed, recap.

### 6. SEO and Analytics

Owner: Media and SEO Agent

- Add analytics instrumentation plan.
- Generate sitemap and page metadata strategy.
- Review social sharing behavior and Open Graph assets.

## Later

### 7. Growth Features

Owner: Ops and Growth Agent

- Add email notifications and campaign automations.
- Support add-to-calendar and ticketing flows.
- Introduce capacity management and waitlist promotion.

### 8. Authentication

Owner: Platform Agent

- Add protected admin routes only if dashboard workflows require them.
- Keep public event pages fast and low-friction.

## Definition of Done

- Feature owner is identified in `docs/AGENTS.md`.
- Content, UI, and data impacts are documented.
- `build`, `typecheck`, and `lint` pass.
- New events or feature behavior are reflected in repo docs when needed.
