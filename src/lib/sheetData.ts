import { parseCSV } from "./parseCSV";
import type { EventConfig, ThemePreset, EventMode } from "../types/event";

let sheetIdPromise: Promise<string> | null = null;
const MEMORIAL_DAY_HERO_VIDEO =
  "https://res.cloudinary.com/dtbjdxsv6/video/upload/v1776200376/ElevenLabs_Memorial_Day_23_2026_Day_and_Night_party_runvig.mp4";
const MEMORIAL_DAY_EVENT_OVERRIDES: Partial<EventConfig> = {
  date: "May 23, 2026",
  isoDate: "2026-05-23T21:00:00-04:00",
  doorsOpen: "9:00 PM",
  startTime: "10:00 PM",
  endTime: "2:00 AM",
  heroImage: "",
  heroVideo: MEMORIAL_DAY_HERO_VIDEO,
  overlayOpacity: 0.65,
  showCountdown: true,
};

function csvUrl(sheetId: string, tab: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${tab}`;
}

function asNonEmptyString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function resolveSheetId(): Promise<string> {
  const sheetIdFromBuild = asNonEmptyString(import.meta.env.VITE_SHEET_ID);
  if (sheetIdFromBuild) return sheetIdFromBuild;

  if (!sheetIdPromise) {
    sheetIdPromise = fetch("/.netlify/functions/sheet-config")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Sheet config request failed: ${res.status}`);
        }

        const data = (await res.json()) as { sheetId?: string };
        const sheetId = asNonEmptyString(data.sheetId);
        if (!sheetId) {
          throw new Error("Missing sheet ID from runtime config");
        }

        return sheetId;
      })
      .catch((error) => {
        sheetIdPromise = null;
        throw error;
      });
  }

  return sheetIdPromise;
}

async function fetchTab(tab: string): Promise<Record<string, string>[]> {
  const sheetId = await resolveSheetId();
  const url = csvUrl(sheetId, tab);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch sheet tab "${tab}" (${res.status}): ${url}`);
  }

  return parseCSV(await res.text());
}

function bool(val: string): boolean {
  const normalized = val?.trim().toUpperCase();
  return normalized === "TRUE" || normalized === "1" || normalized === "YES";
}

function num(val: string, fallback: number): number {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

function normalizeMediaType(value: string | undefined): "image" | "video" | "" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "image") return "image";
  if (normalized === "video") return "video";
  return "";
}

function parseMediaUrl(value: string | undefined): string {
  const raw = value?.trim() ?? "";
  if (!raw) return "";

  try {
    new URL(raw);
    return raw;
  } catch {
    return "";
  }
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
  const mediaType = normalizeMediaType(hero?.bg_type);
  const heroMedia = parseMediaUrl(hero?.media_url);
  const heroImage = mediaType === "image" ? heroMedia : "";
  const heroVideo = mediaType === "video" ? heroMedia : "";

  const event: EventConfig = {
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
    heroImage,
    heroVideo,
    overlayOpacity: hero ? num(hero.overlayOpacity, 0.65) : 0.65,
    flyerImage: eventRow.flyerImage || eventRow.ogImage || "",
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

  if (slug === "memorial-day-kickoff") {
    return {
      ...event,
      ...MEMORIAL_DAY_EVENT_OVERRIDES,
    };
  }

  return event;
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
