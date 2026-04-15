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
