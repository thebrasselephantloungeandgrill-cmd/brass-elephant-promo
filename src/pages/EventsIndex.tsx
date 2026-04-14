import { getAllEvents } from "../lib/getEvent";
import { Link } from "react-router-dom";

export default function EventsIndex() {
  const events = getAllEvents();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">The Brass Elephant</h1>
        <p className="text-xl mb-12 text-center" style={{ color: "var(--color-muted)" }}>
          Upcoming Events
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.slug}
              to={`/events/${event.slug}`}
              className="block p-6 rounded-lg transition-all hover:scale-105"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
              <p className="mb-4" style={{ color: "var(--color-muted)" }}>
                {event.subtitle}
              </p>
              <p className="font-semibold" style={{ color: "var(--color-primary)" }}>
                {event.date}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
