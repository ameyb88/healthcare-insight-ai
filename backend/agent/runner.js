import { sendAlert } from "../actions/notifier.js";
import { getRules, getState, saveState } from "./store.js";
import {
  analyzeWithOpenAI,
  simpleHeuristicAnalysis,
} from "../services/openai.service.js";

// Uses your existing logic to analyze a batch—reusing / mirroring backend route
export async function batchAnalyze(items) {
  const hasKey = !!process.env.OPENAI_API_KEY;
  return Promise.all(
    items.map(async (it) => {
      const res = hasKey
        ? await analyzeWithOpenAI(it.text)
        : await simpleHeuristicAnalysis(it.text);
      return { id: it.id, ...res };
    })
  );
}

// Plan & execute based on latest alerts and rules
export async function planAndExecute() {
  const rules = getRules();
  const state = getState();

  const pending = state.alerts.filter((a) => !a.executedAt);
  for (const alert of pending) {
    const rule = rules.find((r) => r.id === alert.ruleId);
    if (!rule) continue;

    const title = `🚨 ${rule.name}`;
    const message = `${alert.reason} • WindowCount=${alert.meta.windowCount} • AvgSent=${alert.meta.avgSentiment}`;

    if (rule.requireApproval) {
      // For demo: mark as “awaiting approval” (front-end could approve)
      alert.status = "awaiting-approval";
    } else {
      // Execute actions
      for (const act of rule.actions || []) {
        await sendAlert({
          severity: act.severity || "info",
          title,
          message,
          channel: act.channel || "console",
        });
      }
      alert.status = "executed";
      alert.executedAt = new Date().toISOString();
    }
  }

  saveState(state);
}
