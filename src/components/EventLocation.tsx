import { EventConfig } from "../types/event";
import { MapPin, Navigation } from "lucide-react";

interface EventLocationProps {
  event: EventConfig;
}

export default function EventLocation({ event }: EventLocationProps) {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-24 px-4"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(212, 175, 55, 0.12), transparent 32%), radial-gradient(circle at bottom right, rgba(139, 0, 0, 0.14), transparent 30%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-xs md:text-sm uppercase tracking-[0.35em] mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            Venue Details
          </p>
          <h2 className="text-3xl md:text-5xl font-bold">Find Us</h2>
        </div>

        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          <div
            className="rounded-[28px] p-8 md:p-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(11, 11, 13, 0.9) 0%, rgba(20, 20, 20, 0.98) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.18)",
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.28)",
            }}
          >
            <div className="flex items-start gap-4 mb-8">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "rgba(212, 175, 55, 0.1)",
                  border: "1px solid rgba(212, 175, 55, 0.35)",
                }}
              >
                <MapPin size={28} style={{ color: "var(--color-primary)" }} />
              </div>

              <div>
                <p
                  className="text-xs uppercase tracking-[0.3em] mb-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  The Destination
                </p>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  The Brass Elephant Lounge & Grill
                </h3>
                <p className="text-lg" style={{ color: "var(--color-muted)" }}>
                  Vance, SC
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="font-semibold mb-2" style={{ color: "var(--color-primary)" }}>
                  Event Details
                </p>
                <p style={{ color: "var(--color-text)" }}>{event.date}</p>
                <p style={{ color: "var(--color-muted)" }}>Doors Open: {event.doorsOpen}</p>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="font-semibold mb-2" style={{ color: "var(--color-primary)" }}>
                  Parking
                </p>
                <p style={{ color: "var(--color-muted)" }}>
                  Free on-site parking available
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02))",
                  border: "1px solid rgba(212, 175, 55, 0.28)",
                }}
              >
                <p className="font-semibold mb-2" style={{ color: "var(--color-primary)" }}>
                  Age Requirement
                </p>
                <p className="text-2xl font-bold">{event.ageRequirement}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                  Mature crowd experience
                </p>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="font-semibold mb-2" style={{ color: "var(--color-primary)" }}>
                  Dress Code
                </p>
                <p style={{ color: "var(--color-text)" }}>{event.dresscode}</p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/The+Brass+Elephant+Lounge+Grill+Vance+SC"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-primary"
            >
              <Navigation size={20} />
              Get Directions
            </a>
          </div>

          <div
            className="relative rounded-[28px] overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(11, 11, 13, 0.96) 0%, rgba(18, 18, 26, 0.98) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.18)",
              minHeight: "420px",
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(circle at top, rgba(212, 175, 55, 0.1), transparent 40%)",
              }}
            />

            <div className="relative w-full h-full flex items-center justify-center p-8 md:p-12 text-center">
              <div>
                <MapPin
                  size={72}
                  className="mx-auto mb-5"
                  style={{ color: "var(--color-primary)" }}
                />
                <p
                  className="text-xs uppercase tracking-[0.32em] mb-3"
                  style={{ color: "var(--color-primary)" }}
                >
                  Visit The Venue
                </p>
                <p className="text-xl md:text-2xl font-semibold mb-2">
                  The Brass Elephant Lounge & Grill
                </p>
                <p className="text-lg" style={{ color: "var(--color-muted)" }}>
                  Vance, SC
                </p>
                <div
                  className="mt-8 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                    border: "1px solid rgba(212, 175, 55, 0.22)",
                    color: "var(--color-primary)",
                  }}
                >
                  Interactive map coming soon
                </div>
                <p className="mt-5 text-sm max-w-xs mx-auto" style={{ color: "var(--color-muted)" }}>
                  Pull up, park easy, and step into the full Brass Elephant experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
