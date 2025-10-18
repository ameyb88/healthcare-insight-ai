// Minimal notifier: console + optional webhook/email stubs
import fetch from "node-fetch"; // If you want webhook; else remove (npm i node-fetch@2 if needed)
export async function sendAlert({
  severity,
  title,
  message,
  channel = "console",
}) {
  const payload = { severity, title, message, at: new Date().toISOString() };

  if (channel === "console") {
    console.log("[ALERT]", JSON.stringify(payload));
    return { ok: true };
  }

  if (channel === "webhook" && process.env.ALERT_WEBHOOK_URL) {
    const r = await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: r.ok };
  }

  // Email path can be added later (e.g., nodemailer + Ethereal)
  return { ok: false, reason: "Unknown channel or not configured" };
}
