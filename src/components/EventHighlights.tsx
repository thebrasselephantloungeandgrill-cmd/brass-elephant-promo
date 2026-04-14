import { EventConfig } from "../types/event";

interface EventHighlightsProps {
  event: EventConfig;
}

export default function EventHighlights({ event }: EventHighlightsProps) {
  const displayedHighlights = event.highlights.slice(0, 6);

  if (displayedHighlights.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          What to Expect
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          {displayedHighlights.map((highlight, index) => (
            <div
              key={index}
              className="highlight-pill flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-base font-semibold"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-primary)",
                color: "var(--color-primary)",
              }}
            >
              <span className="text-xl" role="img" aria-label={highlight.label}>
                {highlight.icon}
              </span>
              <span>{highlight.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
