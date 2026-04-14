# Brass Elephant Event System — Google Sheets CMS + RSVP Design Spec

**Date:** 2026-04-03
**Last updated:** 2026-04-03 (RSVP architecture change — Zapier)
**Project:** Brass Elephant Lounge & Grill Promotion System
**Status:** Approved for implementation

---

## Overview

Two separate systems with clear responsibilities:

- **Google Sheets** — event content CMS only (title, hero, schedule, highlights, FAQ, settings)
- **React form + Zapier** — RSVP capture, lead handling, notifications, and follow-up automation

The website pulls event display content from Google Sheets CSV. When a visitor submits the RSVP form, the site POSTs JSON to a Zapier webhook. Zapier writes to Zapier Tables and triggers downstream automations (confirmations, staff alerts, VIP routing, SMS/email follow-up).

---

## Architecture

```
Google Sheets (events, hero, schedule, highlights, faq, settings)
        |
        | PULL — CSV fetch at page load
        v
React Website (displays event content)
        |
        | Visitor fills RSVP form on-page
        v
Zapier Webhook (receives POST JSON)
        |
        v
Zapier Tables (primary RSVP database)
        |
        v
Zapier Automations (confirmations, staff alerts, VIP routing, SMS/email)
```

---

## Goals

1. Non-technical venue staff update event content by editing Google Sheets — no code changes, no deployments
2. RSVP submissions captured cleanly in Zapier Tables with full automation layer
3. Existing React component architecture stays intact — only data source and form submission target change

---

## Migration Impact

The current data layer is fully synchronous — `getEvent.ts` imports JSON files and returns data directly. Moving to CSV fetching makes all data loading async. This requires explicit changes to two pages:

**`src/pages/EventPage.tsx`**
Currently: `const event = getEventBySlug(slug)` — synchronous, line 18
After: `const { event, loading, error } = useEventData(slug)` — async hook with loading/error states

**`src/pages/EventsIndex.tsx`**
Currently: `const events = getAllEvents()` — synchronous, line 5
After: `const { events, loading } = useAllEvents()` — new async hook

**`src/lib/getEvent.ts`**
Deleted. No longer needed — both pages use hooks directly.

All other components (`EventHero`, `EventSchedule`, etc.) receive `EventConfig` as props — no changes needed.

---

## Product Decisions

### RSVP

- React form stays on-page — visitors never leave the site
- Form POSTs JSON to Zapier webhook on submit
- No Google Form iframe, no Apps Script endpoint, no Google Sheets RSVP writing
- `rsvp_responses` tab in Google Sheets is no longer used by this system
- VIP interest checkbox always shown (conditional per event is a future enhancement)
- `lastName` included

---

## Google Sheet — Event CMS

**Spreadsheet name:** Brass Elephant Event System
**Sheet ID:** `12W2hPotIDNF58qxsywbEG-xOiYj2_f2iJiqYHY8VaRA`
**Access:** Anyone with link can view (public)

### Tabs Fetched

| Tab | Purpose |
|---|---|
| `events` | Parent table — one row per event |
| `hero` | Hero media (image/video URL + overlay) per event |
| `schedule` | Timeline blocks per event |
| `highlights` | Feature badge chips per event |
| `faq` | FAQ rows per event |
| `settings` | Global key/value venue config |

`rsvp_responses` tab exists in the sheet but is not fetched or written by the frontend.

### Join Key

`events.slug` is the primary key. All child tabs reference events via their `slug` column.

---

## Column Schemas

### Tab: `events`

| Column | Type | Notes |
|---|---|---|
| slug | string | Primary key, URL-safe (e.g. `memorial-day-kickoff`) |
| title | string | Event title — rendered in hero heading |
| subtitle | string | Short tagline — rendered below hero heading |
| date | string | Human-readable (e.g. `Saturday, May 23rd, 2025`) |
| isoDate | string | ISO 8601 datetime — used for countdown logic |
| doorsOpen | string | Display string (e.g. `3:00 PM`) |
| startTime | string | Display string |
| endTime | string | Display string |
| location | string | Venue name |
| address | string | City/state |
| ageRequirement | string | e.g. `21+` |
| dresscode | string | |
| description | string | Long description paragraph |
| mode | string | `single`, `split`, `rsvp-only`, `paid-vip`, `recap` |
| themePreset | string | `brass-luxe`, `day-party-summer`, `holiday-patriotic`, `vip-after-dark` |
| showCountdown | boolean string | `TRUE` or `FALSE` |
| showRSVP | boolean string | `TRUE` or `FALSE` |
| showVIP | boolean string | `TRUE` or `FALSE` |
| showGallery | boolean string | `TRUE` or `FALSE` |
| showRecap | boolean string | `TRUE` or `FALSE` |
| showTickets | boolean string | `TRUE` or `FALSE` |
| seoTitle | string | Page title tag |
| seoDescription | string | Meta description |
| ogImage | string | Cloudinary URL for social sharing |
| ctaPrimary | string | Primary button label |
| ctaPrimaryLink | string | e.g. `#rsvp` |
| ctaSecondary | string | Optional secondary button label |
| ctaSecondaryLink | string | Optional |

Boolean string fields from CSV arrive as `"TRUE"` / `"FALSE"` — parser must convert to `boolean`.

### Tab: `hero`

Media-only. Title and subtitle come from `events` tab and are rendered from `EventConfig.title` / `EventConfig.subtitle`.

| Column | Type | Notes |
|---|---|---|
| slug | string | Foreign key to events.slug |
| bg_type | string | `image` or `video` |
| media_url | string | Cloudinary URL for background image or video |
| overlayOpacity | number string | Float 0-1 (e.g. `0.65`) — cast to number in parser |

### Tab: `schedule`

| Column | Type | Notes |
|---|---|---|
| slug | string | Foreign key to events.slug |
| sortOrder | number string | Cast to number |
| time | string | Display string (e.g. `3PM - 8PM`) |
| name | string | Block name (e.g. `Cookout Party`) |
| description | string | Short descriptor |

### Tab: `highlights`

| Column | Type | Notes |
|---|---|---|
| slug | string | Foreign key to events.slug |
| sortOrder | number string | Cast to number |
| icon | string | Emoji character |
| label | string | Short label (e.g. `Live DJ`) |

### Tab: `faq`

| Column | Type | Notes |
|---|---|---|
| slug | string | Foreign key to events.slug |
| sortOrder | number string | Cast to number |
| question | string | |
| answer | string | |

### Tab: `settings`

| Column | Type | Notes |
|---|---|---|
| key | string | e.g. `venue_name`, `instagram`, `phone` |
| value | string | Corresponding value |

Known keys: `venue_name`, `venue_address`, `instagram`, `facebook`, `phone`, `booking_email`, `default_theme`

---

## TypeScript Types

The existing `EventConfig` interface in `src/types/event.ts` is the canonical shape. `sheetData.ts` maps CSV rows into this exact interface.

Fields in `EventConfig` not in the sheet (`gallery`, `recapVideo`, `nextEvent`) default to `[]`, `""`, `undefined`.

Hero media mapping:
- `bg_type === "image"` maps to `heroImage`
- `bg_type === "video"` maps to `heroVideo`
- `overlayOpacity` added as new optional field: `overlayOpacity?: number`

---

## CSV Parsing

**Library:** `papaparse`

```
npm install papaparse
npm install --save-dev @types/papaparse
```

```ts
import Papa from "papaparse";

export function parseCSV(csvText: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}
```

Boolean strings `"TRUE"` / `"FALSE"` cast to `boolean`. Numeric strings cast to `number`.

---

## Data Fetching

**Method:** Google Visualization API CSV endpoint (no API key required)
**Pattern:** `https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={tabname}`

All fetch URLs constructed from `VITE_SHEET_ID`. Never hardcode the sheet ID.

**Caching:** Google CDN caches ~5 minutes. Not controlled in code. Venue staff should expect up to 5 minutes for changes to appear.

---

## Code Architecture

### New Files

**`src/lib/parseCSV.ts`**
Papa.parse wrapper. Returns `Record<string, string>[]`.

**`src/lib/sheetData.ts`**
Fetches all 6 CSVs in parallel via `Promise.all`. Assembles `EventConfig` by slug.

```ts
getEventBySlug(slug: string): Promise<EventConfig | null>
getAllEvents(): Promise<EventConfig[]>
getSettings(): Promise<Record<string, string>>
```

Assembly per event:
1. Filter `hero` row by slug
2. Filter + sort `schedule`, `highlights`, `faq` rows by `sortOrder`
3. Map into `EventConfig`, casting booleans and numbers

**`src/hooks/useEventData.ts`**
```ts
useEventData(slug: string): { event: EventConfig | null, loading: boolean, error: string | null }
```
Loading: full-screen dark bg + centered spinner at `var(--color-primary)`.
Error: "Unable to load event. Please try again."

**`src/hooks/useAllEvents.ts`**
```ts
useAllEvents(): { events: EventConfig[], loading: boolean }
```

**`src/hooks/useSettings.ts`**
```ts
useSettings(): { settings: Record<string, string>, loading: boolean }
```

### Modified Files

**`src/pages/EventPage.tsx`**
```tsx
// Before (sync)
const event = getEventBySlug(slug ?? "");

// After (async hook)
const { event, loading, error } = useEventData(slug ?? "");
```

**`src/pages/EventsIndex.tsx`**
```tsx
// Before (sync)
const events = getAllEvents();

// After (async hook)
const { events, loading } = useAllEvents();
```

**`src/components/EventHero.tsx`**
`overlayOpacity` from sheet applied as inline style:
```tsx
style={{ backgroundColor: `rgba(0,0,0,${event.overlayOpacity ?? 0.65})` }}
```

**`src/components/EventRSVPForm.tsx`**
Keep the existing React form UI. Replace `localStorage` submission with a `fetch` POST to Zapier webhook:

```ts
await fetch(import.meta.env.VITE_ZAPIER_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    eventSlug: event.slug,
    eventTitle: event.title,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    email: formData.email,
    partySize: formData.partySize,
    vipInterest: formData.vipInterest,
    marketingConsent: formData.marketingConsent,
    submittedAt: new Date().toISOString(),
  }),
});
```

On success: show existing "You're on the list!" confirmation.
On error: show inline error message, keep form filled so visitor can retry.

Add `lastName` field to the form UI (currently missing).

### Deleted Files

```
src/lib/getEvent.ts
src/events/memorial-day-kickoff.json
src/events/juneteenth-night.json
```

---

## RSVP — Zapier Integration

**Prerequisite:** Zapier webhook URL must be created before RSVP implementation.
Set up in Zapier: New Zap → Trigger: Webhooks by Zapier (Catch Hook) → copy the webhook URL.

**Payload shape (what the React form POSTs):**

```json
{
  "eventSlug": "memorial-day-kickoff",
  "eventTitle": "Memorial Day Weekend Kickoff",
  "firstName": "Jordan",
  "lastName": "Smith",
  "phone": "803-555-0100",
  "email": "jordan@example.com",
  "partySize": "2",
  "vipInterest": true,
  "marketingConsent": true,
  "submittedAt": "2026-04-03T14:30:00.000Z"
}
```

**Zapier automation layer (configured in Zapier, not in code):**
- Write submission to Zapier Tables
- Send confirmation SMS/email to guest
- Alert staff on VIP interest
- Route to marketing list if marketingConsent = true

---

## Environment Variables

```
VITE_SHEET_ID=12W2hPotIDNF58qxsywbEG-xOiYj2_f2iJiqYHY8VaRA
VITE_ZAPIER_WEBHOOK_URL=[webhook URL from Zapier — prerequisite before RSVP build]
```

---

## What Venue Staff Does to Update an Event

1. Open the Google Sheet
2. Edit any row in any tab
3. To change the hero: paste new Cloudinary URL in `hero.media_url`, set `bg_type` to `image` or `video`
4. Changes appear within ~5 minutes
5. To add a new event: add a row to `events`, then matching rows in `hero`, `schedule`, `highlights`, `faq` using the same `slug`

No code changes. No deployments.

---

## Implementation Constraints

- Do not rename sheet tabs or column headers
- `slug` must be consistent across all tabs
- All fetch URLs constructed from `VITE_SHEET_ID` only
- Never write RSVP data to Google Sheets from the frontend
- Zapier webhook URL stored in `.env` only — never hardcoded

---

## Out of Scope (Future Work)

- Make.com automations (replaced by Zapier)
- Google Form RSVP (rejected — using React form + Zapier)
- Apps Script RSVP endpoint (rejected)
- Admin dashboard
- POS system integration
- Ticket/capacity management
- Google Analytics
- Conditional VIP checkbox per event (always shown for now)
