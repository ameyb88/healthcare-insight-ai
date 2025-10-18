import cron from "node-cron";
import { getRules, getState, saveState } from "./store.js";
import { evaluateRules } from "../rules/engine.js";
import { batchAnalyze } from "./runner.js";

export function startMonitor() {
  // Run every 10 minutes (for demo). Cron format: m h dom mon dow
  cron.schedule("*/10 * * * *", async () => {
    try {
      await runOnce();
    } catch (e) {
      console.error("[Agent] run error", e?.message);
    }
  });

  console.log("[Agent] monitor scheduled: every 10 minutes");
}

export async function runOnce() {
  // 1) Fetch recent feedback items (for demo: pull from mock endpoint)
  const items = await getDemoItems();

  // 2) Analyze
  const analyses = await batchAnalyze(items);

  // 3) Evaluate
  const rules = getRules();
  const hits = evaluateRules(analyses, rules);

  // 4) Record & execute
  if (hits.length) {
    const state = getState();
    for (const h of hits) {
      state.alerts.push({
        id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: new Date().toISOString(),
        ruleId: h.rule.id,
        ruleName: h.rule.name,
        reason: h.reason,
        meta: {
          windowCount: h.windowCount,
          avgSentiment: h.avgSentiment,
          highOrCritical: h.highOrCritical,
        },
      });
    }
    saveState(state);
    // Execution happens in runner.js after planning
  }
}

async function getDemoItems() {
  // For demo, pull mock feedback from local module so no HTTP needed
  const { mockFeedback } = await import("../data/mockFeedback.js");
  return mockFeedback.map((m) => ({ id: m.id, text: m.text }));
}
