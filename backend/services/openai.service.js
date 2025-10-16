import Sentiment from "sentiment";
let OpenAIClient = null;
try {
  const { OpenAI } = await import("openai");
  OpenAIClient = OpenAI;
} catch {}
const sentiment = new Sentiment();

export async function simpleHeuristicAnalysis(text, context = {}) {
  const s = sentiment.analyze(text || "");
  const score = Math.max(-10, Math.min(10, s.score));
  const sentimentScore = Math.round(((score + 10) / 20) * 100);

  const riskTerms = [
    "fall",
    "medication error",
    "allergic",
    "rash",
    "bleeding",
    "wrong dose",
    "waited",
    "infection",
    "privacy",
    "hipaa",
    "pressure sore",
    "sepsis",
    "stroke",
    "heart attack",
    "delay",
    "harm",
  ];
  const t = (text || "").toLowerCase();
  const hits = riskTerms.filter((k) => t.includes(k));
  const riskLevel =
    hits.length >= 3
      ? "Critical"
      : hits.length === 2 || sentimentScore < 30
      ? "High"
      : hits.length === 1 || sentimentScore < 55
      ? "Medium"
      : "Low";
  const urgency = /critical/i.test(riskLevel)
    ? "Immediate escalation to patient safety leadership required."
    : /high/i.test(riskLevel)
    ? "High priority follow-up within 24 hours."
    : /medium/i.test(riskLevel)
    ? "Review within the next 3–5 days."
    : "Track and monitor; no immediate action required.";
  const category =
    t.includes("nurse") || t.includes("staff")
      ? "Staff Experience"
      : t.includes("doctor") || t.includes("physician")
      ? "Clinician Communication"
      : t.includes("emergency") || t.includes("er")
      ? "Emergency Department"
      : t.includes("billing") || t.includes("charge")
      ? "Billing & Admin"
      : t.includes("privacy") || t.includes("hipaa")
      ? "Privacy & Compliance"
      : t.includes("wait")
      ? "Throughput & Wait Times"
      : "General Experience";

  const keyIssues = [
    ...new Set([
      ...hits.map((h) => `Potential risk: ${h}`),
      ...(sentimentScore < 40 ? ["Low satisfaction"] : []),
      ...(t.includes("wait") ? ["Excessive wait time"] : []),
    ]),
  ].slice(0, 6);

  const snippet = (text || "").slice(0, 160).replace(/\s+/g, " ").trim();
  const summary = `Patient feedback (${category}) suggests ${riskLevel.toLowerCase()} concern. Context: ${
    context?.facility || "N/A"
  } ${
    context?.department ? "• " + context.department : ""
  }. Excerpt: “${snippet}${(text || "").length > 160 ? "…" : ""}”`;

  const actions = [
    /critical/i.test(riskLevel)
      ? "Immediate safety huddle and incident review."
      : null,
    /high/i.test(riskLevel)
      ? "Expedite investigation with unit leadership."
      : null,
    "Acknowledge patient concerns and communicate next steps.",
    "Assign owner and due date; log in quality/safety tracker.",
    keyIssues.join(" ").toLowerCase().includes("wait")
      ? "Optimize triage and staffing during peak hours."
      : null,
    keyIssues.join(" ").toLowerCase().includes("privacy")
      ? "Audit PHI handling and reinforce HIPAA training."
      : null,
  ]
    .filter(Boolean)
    .slice(0, 6);

  return {
    riskLevel,
    urgency,
    sentimentScore,
    category,
    summary,
    keyIssues,
    recommendedActions: actions,
  };
}

export async function analyzeWithOpenAI(text, context = {}) {
  if (!process.env.OPENAI_API_KEY || !OpenAIClient)
    return simpleHeuristicAnalysis(text, context);
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `
You are a hospital patient-experience and safety expert.
Return ONLY JSON with: riskLevel (Low|Medium|High|Critical), urgency,
sentimentScore (0..100), category, summary, keyIssues[3..6], recommendedActions[3..6].
Text: """${text}""" Context: ${JSON.stringify(context)}`.trim();

  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  let parsed;
  try {
    parsed = JSON.parse(r.choices?.[0]?.message?.content?.trim() || "{}");
  } catch {
    return simpleHeuristicAnalysis(text, context);
  }

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  return {
    riskLevel: parsed.riskLevel || "Medium",
    urgency: parsed.urgency || "Review within 3–5 days.",
    sentimentScore: clamp(Number(parsed.sentimentScore) || 55, 0, 100),
    category: parsed.category || "General Experience",
    summary: (parsed.summary || "").slice(0, 500),
    keyIssues: Array.isArray(parsed.keyIssues)
      ? parsed.keyIssues.slice(0, 6)
      : [],
    recommendedActions: Array.isArray(parsed.recommendedActions)
      ? parsed.recommendedActions.slice(0, 6)
      : [],
  };
}
