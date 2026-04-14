import { EventConfig } from "../types/event";
import { Clock, Sun, Moon } from "lucide-react";

interface EventScheduleProps {
  event: EventConfig;
}

export default function EventSchedule({ event }: EventScheduleProps) {
  const isSplitMode = event.mode === "split" && event.schedule.length === 2;

  return (
    <section className="py-12 md:py-20 px-4" style={{ backgroundColor: "var(--color-surface)" }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {event.mode === "split" ? "The Lineup" : "Tonight's Schedule"}
        </h2>

        {isSplitMode ? (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {event.schedule.map((block, index) => (
              <>
                <div
                  key={index}
                  className="flex-1 w-full p-6 md:p-8 rounded-lg relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    border: "2px solid var(--color-primary)",
                    borderLeft: "4px solid var(--color-primary)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />

                  <div className="text-center mb-6">
                    <div
                      className="flex items-center justify-center gap-2 text-xl font-semibold mb-4"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <Clock size={24} />
                      <span>{block.time}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">{block.name}</h3>
                  </div>

                  {block.description && (
                    <p className="text-center text-lg" style={{ color: "var(--color-muted)" }}>
                      {block.description}
                    </p>
                  )}
                </div>

                {index === 0 && (
                  <div className="flex-shrink-0 flex items-center gap-3 my-4 md:my-0">
                    <div className="hidden md:flex flex-col items-center gap-2">
                      <Sun size={28} style={{ color: "var(--color-primary)" }} />
                      <div
                        className="h-12 w-px"
                        style={{
                          background: "linear-gradient(to bottom, var(--color-primary), transparent)",
                        }}
                      />
                      <span
                        className="text-sm font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                        style={{
                          color: "var(--color-primary)",
                          border: "1px solid var(--color-primary)",
                        }}
                      >
                        THEN
                      </span>
                      <div
                        className="h-12 w-px"
                        style={{
                          background: "linear-gradient(to bottom, transparent, var(--color-primary))",
                        }}
                      />
                      <Moon size={28} style={{ color: "var(--color-primary)" }} />
                    </div>

                    <div className="flex md:hidden items-center gap-2 w-full">
                      <Sun size={24} style={{ color: "var(--color-primary)" }} />
                      <div
                        className="flex-1 h-px"
                        style={{
                          background: "linear-gradient(to right, var(--color-primary), transparent)",
                        }}
                      />
                      <span
                        className="text-xs font-bold tracking-widest uppercase px-2 py-1 rounded-full"
                        style={{
                          color: "var(--color-primary)",
                          border: "1px solid var(--color-primary)",
                        }}
                      >
                        THEN
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{
                          background: "linear-gradient(to right, transparent, var(--color-primary))",
                        }}
                      />
                      <Moon size={24} style={{ color: "var(--color-primary)" }} />
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {event.schedule.map((block, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-lg relative overflow-hidden"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{block.name}</h3>
                    {block.description && (
                      <p className="text-lg" style={{ color: "var(--color-muted)" }}>
                        {block.description}
                      </p>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2 text-xl font-semibold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <Clock size={24} />
                    <span>{block.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center max-w-3xl mx-auto">
          <p className="text-lg" style={{ color: "var(--color-muted)" }}>
            {event.description}
          </p>
        </div>
      </div>
    </section>
  );
}
