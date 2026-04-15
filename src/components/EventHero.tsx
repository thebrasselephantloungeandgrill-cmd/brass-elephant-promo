import { EventConfig } from "../types/event";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface EventHeroProps {
  event: EventConfig;
}

function parseEventDate(value: string): Date | null {
  const raw = value?.trim();
  if (!raw) return null;

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;

  const normalized =
    raw.includes(" ") && !raw.includes("T") ? raw.replace(" ", "T") : raw;
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);
  const withTimezone = hasTimezone ? normalized : `${normalized}Z`;
  const parsed = new Date(withTimezone);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function EventHero({ event }: EventHeroProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!event.showCountdown) return;
    const parsedEventDate = parseEventDate(event.isoDate);

    if (!parsedEventDate) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = parsedEventDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [event.isoDate, event.showCountdown]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Logo Navigation */}
      <nav className="absolute top-6 left-8 z-20">
        <img
          src="/media/brass-elephant-logo.png"
          alt="The Brass Elephant"
          className="h-16 md:h-20"
        />
      </nav>

      {event.heroVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={event.heroVideo} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: event.heroImage
              ? `url(${event.heroImage})`
              : "linear-gradient(135deg, var(--color-surface) 0%, var(--color-bg) 100%)",
          }}
        >
          {!event.heroImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-2xl" style={{ color: "var(--color-muted)" }}>
                {event.title}
              </p>
            </div>
          )}
        </div>
      )}

      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${event.overlayOpacity ?? 0.65})`,
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
          {event.title}
        </h1>
        <p className="text-xl md:text-2xl mb-6" style={{ color: "var(--color-primary)" }}>
          {event.subtitle}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <MapPin size={20} style={{ color: "var(--color-primary)" }} />
          <span className="text-lg">{event.location} • {event.address}</span>
        </div>

        <p className="text-2xl md:text-3xl font-bold mb-2">{event.date}</p>
        <p className="text-lg mb-8" style={{ color: "var(--color-muted)" }}>
          Doors Open: {event.doorsOpen}
        </p>

        {event.showCountdown && timeRemaining && (
          <div className="mb-8 flex justify-center gap-4 md:gap-8">
            {[
              { label: "Days", value: timeRemaining.days },
              { label: "Hours", value: timeRemaining.hours },
              { label: "Minutes", value: timeRemaining.minutes },
              { label: "Seconds", value: timeRemaining.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid var(--color-primary)",
                }}
              >
                <div className="text-3xl md:text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
                  {item.value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}

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
