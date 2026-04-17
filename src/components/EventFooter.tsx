import { EventConfig } from "../types/event";
import { Instagram, Facebook, Phone } from "lucide-react";
import { useSettings } from "../hooks/useSettings";

interface EventFooterProps {
  event: EventConfig;
}

export default function EventFooter({ event }: EventFooterProps) {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();
  const phoneNumber = settings.phone?.trim() ?? "";
  const instagramUrl = normalizeUrl(settings.instagram);
  const facebookUrl = normalizeUrl(settings.facebook);
  const phoneHref = phoneNumber ? `tel:${phoneNumber.replace(/[^\d+]/g, "")}` : "";

  return (
    <footer
      className="relative overflow-hidden py-12 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.7) 50%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div
            className="rounded-[24px] p-6"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: "var(--color-primary)" }}
            >
              Venue
            </p>
            <h3 className="text-xl font-bold mb-4">
              {event.location}
            </h3>
            <p style={{ color: "var(--color-muted)" }}>{event.address}</p>
            {phoneNumber && (
              <a
                href={phoneHref}
                className="mt-3 inline-flex items-center gap-2 transition-colors hover:opacity-80"
                style={{ color: "var(--color-muted)" }}
              >
                <Phone size={18} style={{ color: "var(--color-primary)" }} />
                <span>{phoneNumber}</span>
              </a>
            )}
          </div>

          <div
            className="rounded-[24px] p-6"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: "var(--color-primary)" }}
            >
              Social
            </p>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            {instagramUrl || facebookUrl ? (
              <div className="flex gap-4">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-primary)",
                      border: "1px solid rgba(212, 175, 55, 0.18)",
                    }}
                    aria-label="Instagram"
                  >
                    <Instagram size={24} />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-primary)",
                      border: "1px solid rgba(212, 175, 55, 0.18)",
                    }}
                    aria-label="Facebook"
                  >
                    <Facebook size={24} />
                  </a>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--color-muted)" }}>
                Social links coming soon
              </p>
            )}
          </div>

          <div
            className="rounded-[24px] p-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02))",
              border: "1px solid rgba(212, 175, 55, 0.24)",
            }}
          >
            <p
              className="text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: "var(--color-primary)" }}
            >
              Event Info
            </p>
            <h3 className="text-xl font-bold mb-4">Before You Arrive</h3>
            <p className="mb-2" style={{ color: "var(--color-text)" }}>
              Age: <span style={{ color: "var(--color-primary)" }}>{event.ageRequirement}</span>
            </p>
            <div className="mb-2">
              <p className="font-medium" style={{ color: "var(--color-text)" }}>
                Dress Code
              </p>
              <p className="leading-relaxed break-words" style={{ color: "var(--color-muted)" }}>
                {event.dresscode}
              </p>
            </div>
            <p style={{ color: "var(--color-muted)" }}>Valid ID Required</p>
          </div>
        </div>

        <div
          className="pt-8 border-t text-center space-y-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p style={{ color: "var(--color-muted)" }}>
            &copy; {currentYear} The Brass Elephant Lounge & Grill. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Powered by BeatBreakerz Entertainment
          </p>
        </div>
      </div>
    </footer>
  );
}

function normalizeUrl(value?: string): string {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}
