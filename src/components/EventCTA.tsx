import { EventConfig } from "../types/event";
import { Calendar } from "lucide-react";

interface EventCTAProps {
  event: EventConfig;
}

export default function EventCTA({ event }: EventCTAProps) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="py-16 md:py-24 px-4 relative overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg)",
        borderTop: "2px solid var(--color-primary)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex justify-center mb-6">
          <Calendar size={48} style={{ color: "var(--color-primary)" }} />
        </div>

        <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
          {event.title}
        </h2>

        <p className="text-xl md:text-2xl mb-6 font-semibold" style={{ color: "var(--color-primary)" }}>
          {event.date} • {event.startTime}
        </p>

        <p className="text-sm md:text-base mb-10 max-w-2xl mx-auto" style={{ color: "var(--color-muted)" }}>
          Spots are limited — RSVP to secure your place
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={event.cta.primaryLink}
            onClick={(e) => handleScroll(e, event.cta.primaryLink)}
            className="btn-primary"
          >
            {event.cta.primary}
          </a>
          {event.cta.secondary && (
            <a
              href={event.cta.secondaryLink || "#"}
              onClick={(e) => handleScroll(e, event.cta.secondaryLink || "#")}
              className="btn-outline"
            >
              {event.cta.secondary}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
