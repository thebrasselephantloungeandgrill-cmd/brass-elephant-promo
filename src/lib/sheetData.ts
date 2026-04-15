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
