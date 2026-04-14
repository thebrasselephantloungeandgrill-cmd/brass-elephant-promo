import { EventConfig } from "../types/event";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface EventFAQProps {
  event: EventConfig;
}

export default function EventFAQ({ event }: EventFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {event.faq.map((item, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:opacity-80"
              >
                <span className="font-semibold text-lg pr-4">{item.question}</span>
                <ChevronDown
                  size={24}
                  className="flex-shrink-0 transition-transform duration-300"
                  style={{
                    transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--color-primary)",
                  }}
                />
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openIndex === index ? "500px" : "0",
                }}
              >
                <div
                  className="px-6 pb-5 pt-2"
                  style={{ color: "var(--color-muted)" }}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg mb-4" style={{ color: "var(--color-muted)" }}>
            Still have questions?
          </p>
          <p className="text-lg">
            DM us on Instagram or call the venue directly.
          </p>
        </div>
      </div>
    </section>
  );
}
