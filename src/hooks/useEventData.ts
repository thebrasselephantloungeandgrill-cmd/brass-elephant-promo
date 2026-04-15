import { useState, useEffect } from "react";
import { getEventBySlug } from "../lib/sheetData";
import type { EventConfig } from "../types/event";

export function useEventData(slug: string) {
  const [event, setEvent] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setEvent(null);
      setError("Unable to load event. Please try again.");
      setLoading(false);
      return;
    }
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
