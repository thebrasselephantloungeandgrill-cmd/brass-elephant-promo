import { EventConfig } from "../types/event";
import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface EventRSVPFormProps {
  event: EventConfig;
}

const RSVP_ENDPOINT = import.meta.env.VITE_RSVP_ENDPOINT;

export default function EventRSVPForm({ event }: EventRSVPFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    partySize: "1",
    vipInterest: false,
    marketingConsent: false,
    company: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!RSVP_ENDPOINT) {
      setErrorMessage(
        "RSVP is not configured yet. Please add the Zapier webhook endpoint."
      );
      return;
    }

    if (formData.company.trim()) {
      setErrorMessage("Unable to submit RSVP. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const submission = {
      eventSlug: event.slug,
      eventTitle: event.title,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      partySize: formData.partySize,
      vipInterest: String(event.showVIP ? formData.vipInterest : false),
      marketingConsent: String(formData.marketingConsent),
      submittedAt: new Date().toISOString(),
    };

    try {
      const requestBody = new URLSearchParams(submission);

      const response = await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: requestBody,
      });

      void response;
      setSubmitted(true);
    } catch {
      setErrorMessage(
        "We couldn't submit your RSVP right now. Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmitButtonText = () => {
    if (isSubmitting) return "Sending RSVP...";

    switch (event.mode) {
      case "rsvp-only":
        return "Confirm My Spot";
      case "paid-vip":
        return "RSVP + Get Tickets";
      default:
        return "RSVP Now";
    }
  };

  if (submitted) {
    return (
      <section
        id="rsvp"
        className="py-16 md:py-24 px-4"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle
            size={64}
            className="mx-auto mb-6"
            style={{ color: "var(--color-primary)" }}
          />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            You're on the list!
          </h2>
          <p className="text-xl mb-2">See you there, {formData.firstName}!</p>
          <p className="text-lg" style={{ color: "var(--color-muted)" }}>
            We'll send you a confirmation shortly at {formData.email}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="rsvp"
      className="py-16 md:py-24 px-4"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Reserve Your Spot
        </h2>
        <p className="text-center text-lg mb-10" style={{ color: "var(--color-muted)" }}>
          Fill out the form below to RSVP for {event.title}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <div>
            <label htmlFor="partySize" className="block text-sm font-semibold mb-2">
              Party Size *
            </label>
            <select
              id="partySize"
              name="partySize"
              required
              value={formData.partySize}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
              <option value="4">4 People</option>
              <option value="5">5 People</option>
              <option value="6">6 People</option>
              <option value="7">7 People</option>
              <option value="8">8 People</option>
              <option value="9">9 People</option>
              <option value="10">10 People</option>
            </select>
          </div>

          {event.showVIP && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="vipInterest"
                name="vipInterest"
                checked={formData.vipInterest}
                onChange={handleChange}
                className="w-5 h-5 cursor-pointer"
                style={{
                  accentColor: "var(--color-primary)",
                }}
              />
              <label htmlFor="vipInterest" className="text-sm font-semibold cursor-pointer">
                I'm interested in VIP section information
              </label>
            </div>
          )}

          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="marketingConsent"
                name="marketingConsent"
                required
                checked={formData.marketingConsent}
                onChange={handleChange}
                className="w-5 h-5 mt-1 cursor-pointer"
                style={{
                  accentColor: "var(--color-primary)",
                }}
              />
              <label htmlFor="marketingConsent" className="text-sm leading-6 cursor-pointer">
                I agree to receive event updates and promotional messages from The Brass
                Elephant Lounge & Grill. Consent is required to complete your RSVP.
              </label>
            </div>
          </div>

          {errorMessage && (
            <div
              className="flex items-start gap-3 rounded-2xl p-4"
              style={{
                backgroundColor: "rgba(139, 0, 0, 0.12)",
                border: "1px solid rgba(139, 0, 0, 0.35)",
                color: "var(--color-text)",
              }}
            >
              <AlertCircle
                size={20}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "var(--color-primary)" }}
              />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? "0.7" : "1",
              cursor: isSubmitting ? "wait" : "pointer",
            }}
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {getSubmitButtonText()}
          </button>

          <p className="text-xs text-center" style={{ color: "var(--color-muted)" }}>
            RSVPs are submitted securely to our event operations system and reviewed by the
            Brass Elephant team.
          </p>
        </form>
      </div>
    </section>
  );
}
