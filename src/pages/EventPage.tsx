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
