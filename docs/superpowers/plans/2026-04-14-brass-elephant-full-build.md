# Brass Elephant Event System — Full Build Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Brass Elephant event promotion site to Google Sheets as a live CMS, replace localStorage RSVP with Zapier webhook + digital ticket confirmation, add a staff check-in portal, and upgrade the UI/UX with the refined design system.

**Architecture:** Google Sheets CSV tabs are fetched at runtime via gviz endpoints and assembled into the existing `EventConfig` TypeScript shape. The RSVP form generates a ticket code client-side, POSTs to Zapier, then renders a styled digital ticket with QR code. A staff portal at `/staff/checkin` provides guest lookup and check-in tracking.

**Tech Stack:** React 18, TypeScript (strict), Vite, Tailwind CSS, papaparse, React Router v7, Lucide React, api.qrserver.com (QR image), Zapier webhook

**Spec:** `docs/superpowers/specs/2026-04-03-google-sheets-cms-design.md`

---

## Chunk 1: Foundation — CSV Data Layer

### File Map

| Action | File | Responsibility |
|---|---|---|
| Install | `package.json` | Add papaparse + @types/papaparse |
| Update | `.env` | Add VITE_SHEET_ID |
| Update | `src/types/event.ts` | Add `overlayOpacity?: number` |
| Create | `src/lib/parseCSV.ts` | Papa.parse wrapper → typed row objects |
| Create | `src/lib/sheetData.ts` | Fetch 6 CSVs, assemble EventConfig by slug |

---

### Task 1: Install papaparse

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the library**

```bash
cd "c:/Users/Owner/Pictures/The Brass Elegant night club/Brass Elephant Lounge and Grill Promotion Sytem Landing page"
npm install papaparse
npm install --save-dev @types/papaparse
```

Expected output: `added X packages` with no errors.

- [ ] **Step 2: Verify it appears in package.json**

Check `package.json` dependencies — `"papaparse"` should appear under `dependencies` and `"@types/papaparse"` under `devDependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add papaparse for CSV parsing"
```

---

### Task 2: Add VITE_SHEET_ID to .env

**Files:**
- Modify: `.env`

- [ ] **Step 1: Add the sheet ID**

Open `.env` and ensure it contains:

```
VITE_SHEET_ID=12W2hPotIDNF58qxsywbEG-xOiYj2_f2iJiqYHY8VaRA
VITE_RSVP_ENDPOINT=https://hooks.zapier.com/hooks/catch/26234146/u7ya5ix/
```

The `VITE_RSVP_ENDPOINT` line should already be there. Add `VITE_SHEET_ID` if it's missing.

- [ ] **Step 2: No commit** — `.env` is in `.gitignore`. Do not commit it.

---

### Task 3: Update EventConfig type

**Files:**
- Modify: `src/types/event.ts`

- [ ] **Step 1: Add overlayOpacity to EventConfig**

In `src/types/event.ts`, find the `heroVideo?` line inside the `EventConfig` interface and add `overlayOpacity` directly after it:

```ts
// Before
heroVideo?: string;
flyerImage?: string;

// After
heroVideo?: string;
overlayOpacity?: number;
flyerImage?: string;
```

`overlayOpacity` is a float 0–1 (e.g. `0.65`). It is read as an inline style in `EventHero` — **not** via the CSS variable `--overlay-opacity`. The CSS variable is the fallback default only. This is important: when the sheet provides a value, the component uses `event.overlayOpacity ?? 0.65` as a direct inline style value, overriding the CSS variable.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/event.ts
git commit -m "feat: add overlayOpacity to EventConfig type"
```

---

### Task 4: Create parseCSV.ts

**Files:**
- Create: `src/lib/parseCSV.ts`

- [ ] **Step 1: Create the file**

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

- [ ] **Step 2: Manual verification**

Open browser console at `http://localhost:5180` and run:

```js
import('/src/lib/parseCSV.ts').then(m => {
  console.log(m.parseCSV(`name,age\nJordan,30\nSam,25`));
});
```

Expected: `[{name: "Jordan", age: "30"}, {name: "Sam", age: "25"}]`

- [ ] **Step 3: Commit**

```bash
git add src/lib/parseCSV.ts
git commit -m "feat: add CSV parser utility"
```

---

### Task 5: Create sheetData.ts

**Files:**
- Create: `src/lib/sheetData.ts`

This is the core data layer. It fetches all 6 CSV tabs in parallel and assembles `EventConfig` objects.

- [ ] **Step 1: Create the file**

```ts
import { parseCSV } from "./parseCSV";
import type { EventConfig, ThemePreset, EventMode } from "../types/event";

const SHEET_ID = import.meta.env.VITE_SHEET_ID;

function csvUrl(tab: string): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${tab}`;
}

async function fetchTab(tab: string): Promise<Record<string, string>[]> {
  const res = await fetch(csvUrl(tab));
  if (!res.ok) throw new Error(`Failed to fetch sheet tab: ${tab}`);
  const text = await res.text();
  return parseCSV(text);
}

function bool(val: string): boolean {
  return val?.trim().toUpperCase() === "TRUE";
}

function num(val: string, fallback: number): number {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

function assembleEvent(
  eventRow: Record<string, string>,
  heroRows: Record<string, string>[],
  scheduleRows: Record<string, string>[],
  highlightRows: Record<string, string>[],
  faqRows: Record<string, string>[]
): EventConfig {
  const slug = eventRow.slug;
  const hero = heroRows.find((r) => r.slug === slug);
  const schedule = scheduleRows
    .filter((r) => r.slug === slug)
    .sort((a, b) => num(a.sortOrder, 0) - num(b.sortOrder, 0));
  const highlights = highlightRows
    .filter((r) => r.slug === slug)
    .sort((a, b) => num(a.sortOrder, 0) - num(b.sortOrder, 0));
  const faq = faqRows
    .filter((r) => r.slug === slug)
    .sort((a, b) => num(a.sortOrder, 0) - num(b.sortOrder, 0));

  return {
    slug,
    title: eventRow.title ?? "",
    subtitle: eventRow.subtitle ?? "",
    date: eventRow.date ?? "",
    isoDate: eventRow.isoDate ?? "",
    doorsOpen: eventRow.doorsOpen ?? "",
    startTime: eventRow.startTime ?? "",
    endTime: eventRow.endTime ?? "",
    location: eventRow.location ?? "",
    address: eventRow.address ?? "",
    ageRequirement: eventRow.ageRequirement ?? "",
    dresscode: eventRow.dresscode ?? "",
    description: eventRow.description ?? "",
    mode: (eventRow.mode as EventMode) ?? "single",
    themePreset: (eventRow.themePreset as ThemePreset) ?? "brass-luxe",
    heroImage: hero?.bg_type === "image" ? (hero.media_url ?? "") : "",
    heroVideo: hero?.bg_type === "video" ? (hero.media_url ?? "") : "",
    overlayOpacity: hero ? num(hero.overlayOpacity, 0.65) : 0.65,
    flyerImage: "",
    gallery: [],
    recapVideo: "",
    highlights: highlights.map((h) => ({ icon: h.icon, label: h.label })),
    schedule: schedule.map((s) => ({
      name: s.name,
      time: s.time,
      description: s.description,
    })),
    faq: faq.map((f) => ({ question: f.question, answer: f.answer })),
    cta: {
      primary: eventRow.ctaPrimary ?? "RSVP Now",
      primaryLink: eventRow.ctaPrimaryLink ?? "#rsvp",
      secondary: eventRow.ctaSecondary || undefined,
      secondaryLink: eventRow.ctaSecondaryLink || undefined,
    },
    showCountdown: bool(eventRow.showCountdown),
    showRSVP: bool(eventRow.showRSVP),
    showTickets: bool(eventRow.showTickets),
    showVIP: bool(eventRow.showVIP),
    showGallery: bool(eventRow.showGallery),
    showRecap: bool(eventRow.showRecap),
    seoTitle: eventRow.seoTitle ?? "",
    seoDescription: eventRow.seoDescription ?? "",
    ogImage: eventRow.ogImage ?? "",
  };
}

interface AllSheetData {
  events: Record<string, string>[];
  hero: Record<string, string>[];
  schedule: Record<string, string>[];
  highlights: Record<string, string>[];
  faq: Record<string, string>[];
  settings: Record<string, string>[];
}

async function fetchAllTabs(): Promise<AllSheetData> {
  const [events, hero, schedule, highlights, faq, settings] =
    await Promise.all([
      fetchTab("events"),
      fetchTab("hero"),
      fetchTab("schedule"),
      fetchTab("highlights"),
      fetchTab("faq"),
      fetchTab("settings"),
    ]);
  return { events, hero, schedule, highlights, faq, settings };
}

export async function getAllEvents(): Promise<EventConfig[]> {
  const data = await fetchAllTabs();
  return data.events.map((row) =>
    assembleEvent(row, data.hero, data.schedule, data.highlights, data.faq)
  );
}

export async function getEventBySlug(slug: string): Promise<EventConfig | null> {
  const data = await fetchAllTabs();
  const row = data.events.find((r) => r.slug === slug);
  if (!row) return null;
  return assembleEvent(row, data.hero, data.schedule, data.highlights, data.faq);
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await fetchTab("settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sheetData.ts
git commit -m "feat: add Google Sheets CSV data layer"
```

---

## Chunk 2: Async Hooks + Page Refactor

### File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/hooks/useEventData.ts` | Async hook: single event by slug |
| Create | `src/hooks/useAllEvents.ts` | Async hook: all events list |
| Create | `src/hooks/useSettings.ts` | Async hook: venue settings |
| Modify | `src/pages/EventPage.tsx` | Sync → async hook, add loading/error UI |
| Modify | `src/pages/EventsIndex.tsx` | Sync → async hook, add loading spinner |
| Delete | `src/lib/getEvent.ts` | No longer needed |
| Delete | `src/events/memorial-day-kickoff.json` | Data lives in Sheets |
| Delete | `src/events/juneteenth-night.json` | Data lives in Sheets |

---

### Task 6: Create useEventData hook

**Files:**
- Create: `src/hooks/useEventData.ts`

- [ ] **Step 1: Create the file**

```ts
import { useState, useEffect } from "react";
import { getEventBySlug } from "../lib/sheetData";
import type { EventConfig } from "../types/event";

export function useEventData(slug: string) {
  const [event, setEvent] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getEventBySlug(slug)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load event. Please try again.");
        setLoading(false);
      });
  }, [slug]);

  return { event, loading, error };
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useEventData.ts
git commit -m "feat: add useEventData async hook"
```

---

### Task 7: Create useAllEvents and useSettings hooks

**Files:**
- Create: `src/hooks/useAllEvents.ts`
- Create: `src/hooks/useSettings.ts`

- [ ] **Step 1: Create useAllEvents.ts**

```ts
import { useState, useEffect } from "react";
import { getAllEvents } from "../lib/sheetData";
import type { EventConfig } from "../types/event";

export function useAllEvents() {
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { events, loading };
}
```

- [ ] **Step 2: Create useSettings.ts**

```ts
import { useState, useEffect } from "react";
import { getSettings } from "../lib/sheetData";

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { settings, loading };
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAllEvents.ts src/hooks/useSettings.ts
git commit -m "feat: add useAllEvents and useSettings hooks"
```

---

### Task 8: Refactor EventPage.tsx to async

**Files:**
- Modify: `src/pages/EventPage.tsx`

- [ ] **Step 1: Rewrite EventPage.tsx**

**Critical:** The `useEffect` that calls `applyTheme` must be preserved in the refactor. It is easy to drop accidentally. The refactored version below includes it — do not remove it.

```tsx
import { useParams } from "react-router-dom";
import { useEventData } from "../hooks/useEventData";
import { applyTheme } from "../lib/themes";
import { useEffect } from "react";

import EventHero from "../components/EventHero";
import EventHighlights from "../components/EventHighlights";
import EventSchedule from "../components/EventSchedule";
import EventMediaGallery from "../components/EventMediaGallery";
import EventCTA from "../components/EventCTA";
import EventRSVPForm from "../components/EventRSVPForm";
import EventFAQ from "../components/EventFAQ";
import EventLocation from "../components/EventLocation";
import EventFooter from "../components/EventFooter";

export default function EventPage() {
  const { slug } = useParams();
  const { event, loading, error } = useEventData(slug ?? "");

  useEffect(() => {
    if (event) applyTheme(event.themePreset);
  }, [event]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--color-muted)" }}>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: "var(--color-muted)" }}>{error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Event not found</h1>
          <p style={{ color: "var(--color-muted)" }}>The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <EventHero event={event} />
      <EventHighlights event={event} />
      {event.schedule.length > 0 && <EventSchedule event={event} />}
      {event.showGallery && <EventMediaGallery event={event} />}
      <EventCTA event={event} />
      {event.showRSVP && <EventRSVPForm event={event} />}
      {event.faq.length > 0 && <EventFAQ event={event} />}
      <EventLocation event={event} />
      <EventFooter event={event} />
    </main>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/EventPage.tsx
git commit -m "feat: refactor EventPage to async Google Sheets data"
```

---

### Task 9: Refactor EventsIndex.tsx to async

**Files:**
- Modify: `src/pages/EventsIndex.tsx`

- [ ] **Step 1: Rewrite EventsIndex.tsx**

```tsx
import { useAllEvents } from "../hooks/useAllEvents";
import { Link } from "react-router-dom";

export default function EventsIndex() {
  const { events, loading } = useAllEvents();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">The Brass Elephant</h1>
        <p className="text-xl mb-12 text-center" style={{ color: "var(--color-muted)" }}>
          Upcoming Events
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.slug}
              to={`/events/${event.slug}`}
              className="block p-6 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
              <p className="mb-4" style={{ color: "var(--color-muted)" }}>
                {event.subtitle}
              </p>
              <p className="font-semibold" style={{ color: "var(--color-primary)" }}>
                {event.date}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/EventsIndex.tsx
git commit -m "feat: refactor EventsIndex to async Google Sheets data"
```

---

### Task 10: Delete static JSON files and getEvent.ts

**Files:**
- Delete: `src/lib/getEvent.ts`
- Delete: `src/events/memorial-day-kickoff.json`
- Delete: `src/events/juneteenth-night.json`

**Prerequisite before this task:** Verify the Google Sheet has at least the `memorial-day-kickoff` slug populated in the `events` tab with all required columns. The `App.tsx` root route redirects to `/events/memorial-day-kickoff` — if that slug is missing from the sheet after the JSON files are deleted, the page will render "Event not found". Check the sheet first. If the slug isn't there yet, add it before proceeding.

- [ ] **Step 0: Verify sheet has memorial-day-kickoff row**

Open `https://docs.google.com/spreadsheets/d/12W2hPotIDNF58qxsywbEG-xOiYj2_f2iJiqYHY8VaRA` and confirm the `events` tab has a row where `slug = memorial-day-kickoff` with title, date, and hero tab has a matching row. Only proceed if confirmed.

- [ ] **Step 1: Delete the files**

```bash
rm "src/lib/getEvent.ts"
rm "src/events/memorial-day-kickoff.json"
rm "src/events/juneteenth-night.json"
```

- [ ] **Step 2: Run typecheck to confirm no remaining imports**

```bash
npm run typecheck
```

Expected: no errors. If you see import errors, search for any remaining references to `getEvent` or the JSON files and remove them.

- [ ] **Step 3: Manual test in browser**

Open `http://localhost:5180/events/memorial-day-kickoff`. The page should load with data from Google Sheets. Check:
- Event title displays correctly
- Schedule section shows
- Countdown is ticking
- Hero video plays

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove static JSON files — data now live from Google Sheets"
```

---

## Chunk 3: RSVP Form — Zapier + Premium Confirmation

**PM Brief direction (overrides earlier plan):**
- No client-side ticket code or QR generation — Zapier/backend handles ticket creation and email delivery
- Confirmation card tells guest to check email for their ticket
- Party size 1–10 (not 1–8+)
- Benefits list shown above the form
- Gold primary button (not red) — PM brief explicitly says avoid overuse of red
- "Back to Event Details" scroll button on confirmation
- Loading text: "Sending RSVP..."
- Error copy: "We couldn't submit your RSVP right now. Please try again in a moment."
- `vipInterest` and `marketingConsent` converted to strings `"true"` / `"false"` in payload

### File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/components/EventRSVPForm.tsx` | Premium section layout, validation, Zapier POST, confirmation state |

No `ticketUtils.ts`. No `TicketConfirmation.tsx` as a separate file — confirmation is inline in `EventRSVPForm.tsx`.

---

### Task 11: Rewrite EventRSVPForm.tsx

**Files:**
- Modify: `src/components/EventRSVPForm.tsx`

- [ ] **Step 1: Rewrite the component**

```tsx
import { EventConfig } from "../types/event";
import { useState } from "react";

// Zapier webhook — configured via environment variable
const WEBHOOK_URL = import.meta.env.VITE_RSVP_ENDPOINT;

interface EventRSVPFormProps {
  event: EventConfig;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  partySize: string;
  vipInterest: boolean;
  marketingConsent: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "Required";
  if (!form.lastName.trim()) errors.lastName = "Required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Valid email required";
  if (!/^\+?[\d\s\-(). ]{10,}$/.test(form.phone.trim()))
    errors.phone = "Valid phone required";
  return errors;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#0C0B0A",
  border: "1px solid #302C24",
  borderRadius: 4,
  color: "#F2E8D0",
  padding: "0.875rem 1rem",
  fontSize: "1rem",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid #CC4444",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#7A7060",
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "0.4rem",
};

export default function EventRSVPForm({ event }: EventRSVPFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    partySize: "1",
    vipInterest: false,
    marketingConsent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError(null);

    // Build payload — checkboxes sent as strings per PM brief
    const payload = {
      eventTitle: event.title,
      eventSlug: event.slug,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      partySize: formData.partySize,
      vipInterest: String(formData.vipInterest),
      marketingConsent: String(formData.marketingConsent),
    };

    try {
      // Zapier webhooks don't return CORS headers — mode: "no-cors" is required.
      // The response body cannot be read, but submissions land in Zapier regardless.
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });

      setGuestFirstName(formData.firstName.trim());
      setGuestEmail(formData.email.trim());
      setSubmitted(true);
    } catch {
      setSubmitError(
        "We couldn't submit your RSVP right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Confirmation card ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <section
        id="rsvp"
        className="py-16 md:py-24 px-4"
        style={{ backgroundColor: "#181614" }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          {/* Check icon */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid #C9A44A",
              background: "rgba(201,164,74,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: 26,
              color: "#C9A44A",
            }}
          >
            ✓
          </div>

          <p
            style={{
              color: "#C9A44A",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: "0 0 0.5rem",
            }}
          >
            You're On the List
          </p>

          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#F2E8D0", margin: "0 0 1.25rem" }}
          >
            RSVP Confirmed, {guestFirstName}
          </h2>

          {/* Confirmation card */}
          <div
            style={{
              border: "1px solid #302C24",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: "1.5rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                background: "rgba(201,164,74,0.06)",
                borderBottom: "1px solid #302C24",
                padding: "1rem 1.5rem",
              }}
            >
              <p style={{ color: "#C9A44A", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", margin: "0 0 0.3rem" }}>
                The Brass Elephant Lounge & Grill
              </p>
              <p className="font-bold" style={{ color: "#F2E8D0", fontSize: "1rem", margin: 0 }}>
                {event.title}
              </p>
              <p style={{ color: "#7A7060", fontSize: "0.82rem", margin: "0.2rem 0 0" }}>
                {event.date} · {event.doorsOpen} Doors
              </p>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", background: "#0C0B0A" }}>
              <p style={{ color: "#F2E8D0", fontSize: "0.92rem", lineHeight: 1.6, margin: "0 0 1rem" }}>
                Your RSVP has been received for {event.title}. Check your email at <strong style={{ color: "#C9A44A" }}>{guestEmail}</strong> for your digital RSVP ticket and ticket number. You'll need to show it at the door before 6PM for priority entry access.
              </p>

              {[
                "Ticket sent to your email",
                "Arrive before 6PM for priority entry",
                "30+ Only · ID Required",
              ].map((item) => (
                <div
                  key={item}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}
                >
                  <span style={{ color: "#C9A44A", fontSize: 11, flexShrink: 0 }}>✦</span>
                  <span style={{ color: "#F2E8D0", fontSize: "0.85rem" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            style={{
              background: "transparent",
              border: "1px solid #302C24",
              color: "#7A7060",
              padding: "0.75rem 1.75rem",
              borderRadius: 4,
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            ← Back to Event Details
          </button>
        </div>
      </section>
    );
  }

  // ── RSVP section + form ───────────────────────────────────────────────────
  return (
    <section
      id="rsvp"
      className="py-16 md:py-24 px-4"
      style={{ backgroundColor: "#181614" }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p
            style={{
              color: "#C9A44A",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              margin: "0 0 0.75rem",
            }}
          >
            Limited RSVP Tickets Available
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#F2E8D0", margin: "0 0 1rem" }}
          >
            Get Your RSVP Ticket
          </h2>
          <p
            style={{
              color: "#7A7060",
              fontSize: "0.95rem",
              lineHeight: 1.65,
              maxWidth: 440,
              margin: "0 auto 1.5rem",
            }}
          >
            RSVP now to receive your digital entry ticket for {event.title}.
            Early arrival is strongly suggested. Show your ticket at the door
            before 6PM for priority entry access.
          </p>

          {/* Benefits list */}
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: "0.4rem",
              textAlign: "left",
              background: "rgba(201,164,74,0.05)",
              border: "1px solid rgba(201,164,74,0.18)",
              borderRadius: 6,
              padding: "0.875rem 1.25rem",
              marginBottom: "0.75rem",
            }}
          >
            {[
              "Skip the Line Before 6PM",
              "Priority Entry Access",
              "Guaranteed Day Party Entry Window",
            ].map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#C9A44A", fontSize: 10 }}>✦</span>
                <span style={{ color: "#F2E8D0", fontSize: "0.85rem" }}>{b}</span>
              </div>
            ))}
          </div>

          <p style={{ color: "#7A7060", fontSize: "0.75rem", letterSpacing: "0.05em", margin: 0 }}>
            30+ Only · ID Required · Dress to Impress · Security Enforced
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#0C0B0A",
            border: "1px solid #302C24",
            borderRadius: 8,
            padding: "2rem 1.75rem",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={errors.firstName ? errorInputStyle : inputStyle}
                />
                {errors.firstName && (
                  <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={errors.lastName ? errorInputStyle : inputStyle}
                />
                {errors.lastName && (
                  <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                style={errors.email ? errorInputStyle : inputStyle}
              />
              {errors.email && (
                <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="(803) 555-0100"
                value={formData.phone}
                onChange={handleChange}
                style={errors.phone ? errorInputStyle : inputStyle}
              />
              {errors.phone && (
                <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Party size */}
            <div>
              <label style={labelStyle}>Party Size *</label>
              <select
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {["1","2","3","4","5","6","7","8","9","10"].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === "1" ? "Person" : "People"}
                  </option>
                ))}
              </select>
            </div>

            {/* VIP interest */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <input
                type="checkbox"
                id="vipInterest"
                name="vipInterest"
                checked={formData.vipInterest}
                onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: "#C9A44A", marginTop: 2, cursor: "pointer", flexShrink: 0 }}
              />
              <label htmlFor="vipInterest" style={{ color: "#F2E8D0", fontSize: "0.88rem", cursor: "pointer", lineHeight: 1.5 }}>
                I'm interested in VIP or bottle service
              </label>
            </div>

            {/* Marketing consent */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <input
                type="checkbox"
                id="marketingConsent"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: "#C9A44A", marginTop: 2, cursor: "pointer", flexShrink: 0 }}
              />
              <label htmlFor="marketingConsent" style={{ color: "#7A7060", fontSize: "0.85rem", cursor: "pointer", lineHeight: 1.5 }}>
                Keep me updated on future events and special announcements
              </label>
            </div>

            {/* Submission error */}
            {submitError && (
              <p style={{ color: "#CC4444", fontSize: "0.88rem", textAlign: "center" }}>
                {submitError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                background: loading ? "#211E1A" : "#C9A44A",
                color: loading ? "#7A7060" : "#0C0B0A",
                border: "none",
                borderRadius: 4,
                fontWeight: 700,
                fontSize: "0.88rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: loading ? "default" : "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {loading ? "Sending RSVP..." : "Get My RSVP Ticket"}
            </button>

            <p style={{ color: "#7A7060", fontSize: "0.75rem", textAlign: "center", margin: 0 }}>
              Your digital ticket will be sent to your email. By submitting you agree to receive event updates from The Brass Elephant Lounge & Grill.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Manual test — form**

Open `http://localhost:5180/events/memorial-day-kickoff`, scroll to RSVP section. Verify:
- Section header shows eyebrow text "LIMITED RSVP TICKETS AVAILABLE"
- Benefits list renders with gold bullets
- "30+ Only · ID Required · Dress to Impress · Security Enforced" note shows
- Form has all 7 fields (firstName, lastName, email, phone, partySize, vipInterest, marketingConsent)
- Party size goes 1–10
- Submit with empty fields shows inline validation errors
- Submit button disabled during loading, shows "Sending RSVP..."

- [ ] **Step 4: Manual test — submission**

Fill and submit with valid data. Verify:
- Confirmation card appears with guest's first name in heading
- Guest email shown in body copy
- Benefits bullets render
- "Back to Event Details" button scrolls to top
- Check Zapier dashboard — payload received with all fields, checkboxes as `"true"`/`"false"` strings

- [ ] **Step 5: Manual test — error state**

Temporarily set `VITE_RSVP_ENDPOINT` to an invalid URL, submit. Verify error message: "We couldn't submit your RSVP right now. Please try again in a moment." Form stays filled.

- [ ] **Step 6: Commit**

```bash
git add src/components/EventRSVPForm.tsx
git commit -m "feat: premium RSVP form — Zapier POST, validation, email confirmation flow"
```

---

## Chunk 4: Staff Check-In Portal

### File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/pages/StaffCheckin.tsx` | Guest search, check-in, guest list |
| Modify | `src/App.tsx` | Add `/staff/checkin` route |

---

### Task 14: Create StaffCheckin.tsx

**Files:**
- Create: `src/pages/StaffCheckin.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";

interface GuestRecord {
  id: string;
  ticketCode: string;
  qrToken: string;
  type: "general" | "vip";
  firstName: string;
  lastName: string;
  email: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

// In-memory store for this session
const guestStore: GuestRecord[] = [];

export function registerGuest(data: Omit<GuestRecord, "id" | "checkedIn" | "checkedInAt">) {
  guestStore.push({ ...data, id: Date.now().toString(), checkedIn: false, checkedInAt: null });
}

export default function StaffCheckin() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<GuestRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [list, setList] = useState<GuestRecord[]>([...guestStore]);

  const refresh = () => setList([...guestStore]);

  const search = () => {
    const q = query.toLowerCase().trim();
    if (!q) return;
    const found = guestStore.find(
      (r) =>
        r.ticketCode.toLowerCase() === q ||
        r.qrToken.toLowerCase() === q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.email.toLowerCase() === q
    );
    setResult(found ?? null);
    setNotFound(!found);
    refresh();
  };

  const checkIn = (guest: GuestRecord) => {
    guest.checkedIn = true;
    guest.checkedInAt = new Date().toISOString();
    setResult({ ...guest });
    refresh();
  };

  const checkedInCount = list.filter((r) => r.checkedIn).length;

  const gold = "var(--color-primary)";
  const cream = "var(--color-text)";
  const muted = "var(--color-muted)";
  const border = "var(--color-border)";
  const surface = "var(--color-surface)";
  const bg = "var(--color-bg)";
  const green = "#5CCC5C";

  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ color: gold, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 0.2rem" }}>
              Staff Portal
            </p>
            <h2 className="text-2xl font-bold" style={{ color: cream, margin: 0 }}>
              Check-In System
            </h2>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {([["RSVPs", list.length, gold], ["Checked In", checkedInCount, green]] as const).map(([label, val, color]) => (
              <div key={label} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 6, padding: "0.4rem 0.875rem", textAlign: "center" }}>
                <div style={{ color, fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.2 }}>{val}</div>
                <div style={{ color: muted, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <label style={{ display: "block", color: muted, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
            Search by ticket code, name, or email
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setResult(null); setNotFound(false); }}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="BE-MDW26-001 · Guest Name · email"
              style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 4, color: cream, padding: "0.7rem 1rem", fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }}
            />
            <button
              onClick={search}
              style={{ background: gold, color: "#111", border: "none", padding: "0.7rem 1.25rem", borderRadius: 4, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
            >
              Search
            </button>
          </div>

          {notFound && <p style={{ color: "#CC4444", fontSize: "0.82rem", margin: "0.75rem 0 0" }}>No RSVP found.</p>}

          {result && (
            <div style={{ marginTop: "1rem", background: bg, border: `1px solid ${result.checkedIn ? "#2A5A2A" : border}`, borderRadius: 6, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <p className="font-bold" style={{ color: cream, fontSize: "1.1rem", margin: "0 0 0.2rem" }}>{result.firstName} {result.lastName}</p>
                  <p style={{ color: gold, fontFamily: "monospace", fontSize: "0.88rem", letterSpacing: "0.12em", margin: "0 0 0.2rem" }}>{result.ticketCode}</p>
                  <p style={{ color: muted, fontSize: "0.78rem", margin: 0 }}>{result.email} · {result.type.toUpperCase()}</p>
                </div>
                <span style={{
                  padding: "0.25rem 0.75rem", borderRadius: 20,
                  background: result.checkedIn ? "rgba(40,160,40,0.15)" : "rgba(212,175,55,0.12)",
                  color: result.checkedIn ? green : gold,
                  fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", flexShrink: 0,
                }}>
                  {result.checkedIn ? "✓ CHECKED IN" : "CONFIRMED"}
                </span>
              </div>
              {!result.checkedIn && (
                <button
                  onClick={() => checkIn(result)}
                  style={{ marginTop: "0.875rem", width: "100%", background: "#1A4A1A", border: "1px solid #2A7A2A", color: green, padding: "0.75rem", borderRadius: 4, fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}
                >
                  ✓ Mark as Checked In
                </button>
              )}
              {result.checkedIn && result.checkedInAt && (
                <p style={{ color: muted, fontSize: "0.74rem", margin: "0.5rem 0 0" }}>
                  Checked in at {new Date(result.checkedInAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Guest List */}
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "0.875rem 1.25rem", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between" }}>
            <p style={{ color: muted, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Guest List</p>
            {list.length > 0 && <p style={{ color: muted, fontSize: "0.72rem", margin: 0 }}>{checkedInCount} / {list.length} checked in</p>}
          </div>
          {list.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p style={{ color: muted, fontSize: "0.85rem", margin: 0 }}>No RSVPs this session yet.</p>
            </div>
          ) : (
            list.map((r, i) => (
              <div key={r.id} style={{ padding: "0.75rem 1.25rem", borderBottom: i < list.length - 1 ? `1px solid ${border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
                <div>
                  <span style={{ color: cream, fontSize: "0.88rem" }}>{r.firstName} {r.lastName}</span>
                  <span style={{ color: muted, fontSize: "0.76rem", fontFamily: "monospace", marginLeft: "0.75rem" }}>{r.ticketCode}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                  {r.type === "vip" && <span style={{ color: gold, fontSize: "0.62rem", border: `1px solid ${gold}`, padding: "0.1rem 0.4rem", borderRadius: 3 }}>VIP</span>}
                  <span style={{ fontSize: "0.72rem", color: r.checkedIn ? green : gold }}>{r.checkedIn ? "✓ In" : "Pending"}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link to="/events/memorial-day-kickoff" style={{ color: muted, fontSize: "0.82rem" }}>← Back to Event</Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/StaffCheckin.tsx
git commit -m "feat: staff check-in portal"
```

---

### Task 15: Add staff route to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add the route**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EventPage from "./pages/EventPage";
import EventsIndex from "./pages/EventsIndex";
import StaffCheckin from "./pages/StaffCheckin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/events/memorial-day-kickoff" />} />
        <Route path="/events" element={<EventsIndex />} />
        <Route path="/events/:slug" element={<EventPage />} />
        <Route path="/staff/checkin" element={<StaffCheckin />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Manual test**

Open `http://localhost:5180/staff/checkin`. Verify the staff portal loads with the search box and empty guest list.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add staff check-in route"
```

---

## Chunk 5: Hero overlayOpacity + UI Polish

### File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/components/EventHero.tsx` | Wire overlayOpacity from EventConfig |
| Modify | `src/index.css` | Refined design tokens from Codex design |
| Modify | `src/lib/themes.ts` | Update theme color values to match refined palette |

---

### Task 16: Wire overlayOpacity in EventHero

**Files:**
- Modify: `src/components/EventHero.tsx`

- [ ] **Step 1: Update the overlay div**

Find the overlay div (currently around line 92-97):

```tsx
<div
  className="absolute inset-0"
  style={{
    backgroundColor: `rgba(0, 0, 0, var(--overlay-opacity))`,
  }}
/>
```

Replace with:

```tsx
<div
  className="absolute inset-0"
  style={{
    backgroundColor: `rgba(0, 0, 0, ${event.overlayOpacity ?? 0.65})`,
  }}
/>
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/components/EventHero.tsx
git commit -m "feat: wire overlayOpacity from sheet data to hero overlay"
```

---

### Task 17: Refine design tokens

**Files:**
- Modify: `src/index.css`
- Modify: `src/lib/themes.ts`

- [ ] **Step 1: Update index.css root vars with refined palette**

Replace the `:root` block in `src/index.css`:

```css
:root {
  --color-bg: #0C0B0A;
  --color-surface: #181614;
  --color-primary: #C9A44A;
  --color-accent: #C41230;
  --color-text: #F2E8D0;
  --color-muted: #7A7060;
  --color-border: #302C24;
  --color-cta-bg: #C41230;
  --color-cta-text: #F2E8D0;
  --overlay-opacity: 0.65;
}
```

- [ ] **Step 2: Update brass-luxe theme in themes.ts to match**

In `src/lib/themes.ts`, update the `brass-luxe` entry:

```ts
"brass-luxe": {
  "--color-bg": "#0C0B0A",
  "--color-surface": "#181614",
  "--color-primary": "#C9A44A",
  "--color-accent": "#C41230",
  "--color-text": "#F2E8D0",
  "--color-muted": "#7A7060",
  "--color-border": "#302C24",
  "--color-cta-bg": "#C41230",
  "--color-cta-text": "#F2E8D0",
  "--overlay-opacity": "0.65",
},
```

- [ ] **Step 3: Verify site looks correct in browser**

Open `http://localhost:5180`. Check that:
- Gold color is warm/amber (`#C9A44A`)
- Background is deep near-black (`#0C0B0A`)
- CTA buttons use the red (`#C41230`)
- Text is warm cream (`#F2E8D0`)

- [ ] **Step 4: Run typecheck + lint**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/lib/themes.ts
git commit -m "design: refine color palette to luxury nightclub tokens"
```

---

### Task 18: Final end-to-end verification

- [ ] **Step 1: Full page load test**

Open `http://localhost:5180`. Verify:
- Redirects to `/events/memorial-day-kickoff`
- Hero video plays fullscreen
- Logo shows in nav
- Countdown ticking
- Highlights, schedule, FAQ all render

- [ ] **Step 2: RSVP flow test**

Fill out RSVP form → submit → verify:
- Ticket code generated (format: `BE-MDW26-001`)
- QR code image loads
- VIP badge shows if VIP interest checked
- Check Zapier dashboard — payload received with all fields

- [ ] **Step 3: Staff portal test**

Navigate to `http://localhost:5180/staff/checkin`. Verify the portal loads cleanly.

- [ ] **Step 4: Events index test**

Navigate to `http://localhost:5180/events`. Verify events list loads from Google Sheets.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Brass Elephant event system — Sheets CMS + Zapier RSVP + staff portal"
```

---

## Notes for Implementation

**No test framework installed.** This project has no Vitest or Jest setup. All verification is manual via browser and typecheck. If you want to add unit tests later, `npm install -D vitest @testing-library/react` is the recommended path.

**Google Sheets cache.** The gviz CSV endpoint caches for ~5 minutes. If sheet data isn't showing, wait 5 minutes or open an incognito window to bypass browser cache.

**Zapier `mode: "no-cors"`.** Zapier webhooks don't return CORS headers. The fetch uses `mode: "no-cors"` which means we can't read the response body. This is expected — if the webhook URL is correct, submissions will always land in Zapier even if the response is opaque. Verify via Zapier dashboard history.

**Session-only staff portal.** The current guest list in `/staff/checkin` is in-memory only — it resets on page refresh. Connecting it to Zapier Tables is a future enhancement.
