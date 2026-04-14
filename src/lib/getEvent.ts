import memorialDay from "../events/memorial-day-kickoff.json";
import juneteenth from "../events/juneteenth-night.json";
import type { EventConfig } from "../types/event";

const events: EventConfig[] = [memorialDay, juneteenth] as EventConfig[];

export function getEventBySlug(slug: string): EventConfig | undefined {
  return events.find((e) => e.slug === slug);
}

export function getAllEvents(): EventConfig[] {
  return events;
}
