import { useState } from "react";
import type { EventConfig } from "../types/event";

interface EventRSVPFormProps {
  event: EventConfig;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  partySize: string;
  vipInterest: boolean;
  marketingConsent: boolean;
  company: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

const RSVP_ENDPOINT = "/.netlify/functions/rsvp";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#0C0B0A",
  border: "1px solid #302C24",
  borderRadius: 4,
  color: "#F2E8D0",
  padding: "0.875rem 1rem",
  fontSize: "1rem",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid #CC4444",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#7A7060",
  fontSize: "0.7rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "0.4rem",
};

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "Required";
  if (!form.lastName.trim()) errors.lastName = "Required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Valid email required";
  }
  if (!/^\+?[\d\s\-(). ]{10,}$/.test(form.phone.trim())) {
    errors.phone = "Valid phone required";
  }

  return errors;
}

export default function EventRSVPForm({ event }: EventRSVPFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    partySize: "1",
    vipInterest: false,
    marketingConsent: false,
    company: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Simple honeypot to discourage automated submissions.
    if (formData.company.trim()) {
      setSubmitError("We couldn't submit your RSVP right now. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    const payload = {
      eventTitle: event.title,
      eventSlug: event.slug,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      partySize: formData.partySize,
      vipInterest: event.showVIP ? formData.vipInterest : false,
      marketingConsent: formData.marketingConsent,
      company: formData.company,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(RSVP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("RSVP submission failed");
      }

      setGuestFirstName(formData.firstName.trim());
      setSubmitted(true);
    } catch {
      setSubmitError(
        "We couldn't submit your RSVP right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section
        id="rsvp"
        className="py-16 md:py-24 px-4"
        style={{ backgroundColor: "#181614" }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid #C9A44A",
              background: "rgba(201,164,74,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: 26,
              color: "#C9A44A",
            }}
          >
            ✓
          </div>

          <p
            style={{
              color: "#C9A44A",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: "0 0 0.5rem",
            }}
          >
            RSVP Submitted
          </p>

          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#F2E8D0", margin: "0 0 1rem" }}
          >
            Thanks, {guestFirstName}
          </h2>

          <div
            style={{
              border: "1px solid #302C24",
              borderRadius: 8,
              background: "#0C0B0A",
              padding: "1.5rem",
              textAlign: "left",
            }}
          >
            <p style={{ color: "#F2E8D0", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 }}>
              Your RSVP request for <strong>{event.title}</strong> has been sent to the
              Brass Elephant team. Keep an eye on your email and phone for event updates
              and follow-up details.
            </p>
            <p style={{ color: "#7A7060", fontSize: "0.85rem", margin: "1rem 0 0" }}>
              Event date: {event.date} · Doors open: {event.doorsOpen}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="rsvp"
      className="py-16 md:py-24 px-4"
      style={{ backgroundColor: "#181614" }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p
            style={{
              color: "#C9A44A",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              margin: "0 0 0.75rem",
            }}
          >
            Limited RSVP Availability
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "#F2E8D0", margin: "0 0 1rem" }}
          >
            Reserve Your Spot
          </h2>
          <p
            style={{
              color: "#7A7060",
              fontSize: "0.95rem",
              lineHeight: 1.65,
              maxWidth: 440,
              margin: "0 auto 1.5rem",
            }}
          >
            Send your RSVP for {event.title}. We will use the information below for event
            updates and follow-up from the Brass Elephant team.
          </p>

          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: "0.4rem",
              textAlign: "left",
              background: "rgba(201,164,74,0.05)",
              border: "1px solid rgba(201,164,74,0.18)",
              borderRadius: 6,
              padding: "0.875rem 1.25rem",
              marginBottom: "0.75rem",
            }}
          >
            {[
              "Fast RSVP for this event",
              "VIP follow-up available on request",
              "30+ Only · ID Required",
            ].map((benefit) => (
              <div
                key={benefit}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ color: "#C9A44A", fontSize: 10 }}>✦</span>
                <span style={{ color: "#F2E8D0", fontSize: "0.85rem" }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#0C0B0A",
            border: "1px solid #302C24",
            borderRadius: 8,
            padding: "2rem 1.75rem",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              style={{ display: "none" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label style={labelStyle}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={errors.firstName ? errorInputStyle : inputStyle}
                />
                {errors.firstName && (
                  <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={errors.lastName ? errorInputStyle : inputStyle}
                />
                {errors.lastName && (
                  <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                style={errors.email ? errorInputStyle : inputStyle}
              />
              {errors.email && (
                <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="(803) 555-0100"
                value={formData.phone}
                onChange={handleChange}
                style={errors.phone ? errorInputStyle : inputStyle}
              />
              {errors.phone && (
                <p style={{ color: "#CC4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Party Size *</label>
              <select
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((count) => (
                  <option key={count} value={count}>
                    {count} {count === "1" ? "Person" : "People"}
                  </option>
                ))}
              </select>
            </div>

            {event.showVIP && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <input
                  type="checkbox"
                  id="vipInterest"
                  name="vipInterest"
                  checked={formData.vipInterest}
                  onChange={handleChange}
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: "#C9A44A",
                    marginTop: 2,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor="vipInterest"
                  style={{
                    color: "#F2E8D0",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    lineHeight: 1.5,
                  }}
                >
                  I'm interested in VIP or bottle service
                </label>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <input
                type="checkbox"
                id="marketingConsent"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleChange}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: "#C9A44A",
                  marginTop: 2,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="marketingConsent"
                style={{
                  color: "#7A7060",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  lineHeight: 1.5,
                }}
              >
                Keep me updated on future events and special announcements
              </label>
            </div>

            {submitError && (
              <p style={{ color: "#CC4444", fontSize: "0.88rem", textAlign: "center" }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                background: loading ? "#211E1A" : "#C9A44A",
                color: loading ? "#7A7060" : "#0C0B0A",
                border: "none",
                borderRadius: 4,
                fontWeight: 700,
                fontSize: "0.88rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: loading ? "default" : "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {loading ? "Sending RSVP..." : "Submit RSVP"}
            </button>

            <p style={{ color: "#7A7060", fontSize: "0.75rem", textAlign: "center", margin: 0 }}>
              RSVP submissions are routed to the Brass Elephant event team for follow-up.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
