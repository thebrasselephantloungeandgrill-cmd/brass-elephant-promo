const REQUIRED_FIELDS = ["eventTitle", "eventSlug", "firstName", "lastName", "email", "phone", "partySize", "submittedAt"];

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

export default async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const webhookUrl = process.env.RSVP_WEBHOOK_URL;
  if (!webhookUrl) {
    return json(500, { error: "RSVP webhook is not configured" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  if (typeof payload.company === "string" && payload.company.trim()) {
    return json(400, { error: "Spam submission rejected" });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      return json(400, { error: `Missing required field: ${field}` });
    }
  }

  const webhookPayload = new URLSearchParams({
    eventTitle: String(payload.eventTitle),
    eventSlug: String(payload.eventSlug),
    firstName: String(payload.firstName),
    lastName: String(payload.lastName),
    email: String(payload.email),
    phone: String(payload.phone),
    partySize: String(payload.partySize),
    vipInterest: String(payload.vipInterest ?? false),
    marketingConsent: String(payload.marketingConsent ?? false),
    submittedAt: String(payload.submittedAt),
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: webhookPayload.toString(),
    });

    if (!response.ok) {
      return json(502, { error: "Webhook request failed" });
    }

    return json(200, { ok: true });
  } catch {
    return json(502, { error: "Unable to reach RSVP webhook" });
  }
}
