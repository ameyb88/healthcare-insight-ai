import { Router } from "express";
import { z } from "zod";
import {
  analyzeWithOpenAI,
  simpleHeuristicAnalysis,
} from "../services/openai.service.js";
import { mockFeedback } from "../data/mockFeedback.js";
import { getRules, saveRules, getState, saveState } from "../agent/store.js";
import { runOnce } from "../agent/monitor.js";
import { planAndExecute } from "../agent/runner.js";

const router = Router();

const AnalyzeSchema = z.object({
  text: z.string().min(5, "Feedback is too short"),
  context: z
    .object({
      facility: z.string().optional(),
      department: z.string().optional(),
    })
    .optional(),
});

router.post("/analyze", async (req, res, next) => {
  try {
    const { text, context } = AnalyzeSchema.parse(req.body);
    const hasKey = !!process.env.OPENAI_API_KEY;
    const result = hasKey
      ? await analyzeWithOpenAI(text, context)
      : await simpleHeuristicAnalysis(text, context);
    res.json({ data: { analysis: result } });
  } catch (err) {
    if (err?.issues)
      return res
        .status(400)
        .json({ error: err.issues[0]?.message || "Bad request" });
    next(err);
  }
});

// Batch schema
const BatchSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1, "text required"),
      })
    )
    .min(1),
});

router.post("/insights", async (req, res, next) => {
  try {
    // Accept either { items } or { feedbackList }
    const incoming = Array.isArray(req.body?.items)
      ? req.body.items
      : Array.isArray(req.body?.feedbackList)
      ? req.body.feedbackList
      : [];
    const normalized = incoming.map((f) => ({
      id: String(f.id ?? ""),
      text: f.text,
    }));
    const { items } = BatchSchema.parse({ items: normalized });

    const hasKey = !!process.env.OPENAI_API_KEY;
    const analyses = await Promise.all(
      items.map(async (it) => {
        const r = hasKey
          ? await analyzeWithOpenAI(it.text)
          : await simpleHeuristicAnalysis(it.text);
        return { id: it.id, ...r };
      })
    );

    // Simple summary
    const avgSentiment = Math.round(
      analyses.reduce((a, b) => a + (b.sentimentScore || 0), 0) /
        analyses.length
    );
    const highRiskCount = analyses.filter((a) =>
      /^(high|critical)$/i.test(a.riskLevel || "")
    ).length;

    // Light insights
    const issueCounts = analyses
      .flatMap((a) => a.keyIssues || [])
      .reduce((acc, i) => ((acc[i] = (acc[i] || 0) + 1), acc), {});
    const topIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([i]) => i);

    const insights = {
      trends: [
        `Average sentiment ${avgSentiment}/100 across ${analyses.length} items`,
        `${highRiskCount} High/Critical risk reports`,
      ],
      priorities: topIssues.map((i) => ({
        issue: i,
        impact: /privacy|hipaa/i.test(i)
          ? "High (Compliance)"
          : /wait|throughput/i.test(i)
          ? "Medium (Operational)"
          : "Medium",
        action: /wait|throughput/i.test(i)
          ? "Optimize triage/staffing in peak hours"
          : /privacy|hipaa/i.test(i)
          ? "Audit PHI handling & reinforce HIPAA training"
          : "Targeted coaching & follow-up",
      })),
      highlights: analyses.slice(0, 3).map((a) => a.summary),
      riskSummary: `${highRiskCount} of ${analyses.length} flagged High/Critical`,
      actionPlan: [
        "Acknowledge patient concerns and communicate next steps",
        "Assign owners and due dates; log in quality/safety tracker",
        "Review wait-time bottlenecks and staffing",
      ],
    };

    res.json({
      data: {
        summary: { count: analyses.length, avgSentiment, highRiskCount },
        insights,
        analyses,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/mock-feedback", (_req, res) => {
  res.json({ data: mockFeedback });
});

router.get("/agent/status", (_req, res) => {
  const state = getState();
  res.json({ data: { alerts: state.alerts.slice(-50) } });
});

// Manually trigger agent pass (useful to demo)
router.post("/agent/run", async (_req, res, next) => {
  try {
    await runOnce();
    await planAndExecute();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Read/update rules
router.get("/agent/rules", (_req, res) => res.json({ data: getRules() }));
router.post("/agent/rules", (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : [];
  saveRules(incoming);
  res.json({ ok: true });
});

export default router;
