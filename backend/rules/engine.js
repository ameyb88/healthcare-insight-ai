export function evaluateRules(analyses, rules) {
  const now = new Date();
  const within = (hrs) => {
    // for demo we consider all items "recent"
    // later: attach timestamps to feedback & filter by hours
    return analyses;
  };
  const result = [];

  for (const rule of rules.filter((r) => r.enabled)) {
    const windowed = within(rule.match.windowHours || 24);
    const highOrCritical = windowed.filter((a) =>
      /^(high|critical)$/i.test(a.riskLevel || "")
    );
    const avg = Math.round(
      windowed.reduce((sum, a) => sum + (a.sentimentScore || 0), 0) /
        Math.max(1, windowed.length)
    );
    const byCategory = (cat) =>
      windowed.filter(
        (a) => (a.category || "").toLowerCase() === (cat || "").toLowerCase()
      );

    let triggered = false;
    let reason = "";

    if (rule.match.minHighOrCritical && rule.match.category) {
      const inCat = byCategory(rule.match.category);
      const hc = inCat.filter((a) =>
        /^(high|critical)$/i.test(a.riskLevel || "")
      ).length;
      if (hc >= rule.match.minHighOrCritical) {
        triggered = true;
        reason = `High/Critical in ${rule.match.category}: ${hc} ≥ ${rule.match.minHighOrCritical}`;
      }
    }

    if (!triggered && typeof rule.match.avgSentimentBelow === "number") {
      if (avg < rule.match.avgSentimentBelow) {
        triggered = true;
        reason = `Avg sentiment ${avg} < ${rule.match.avgSentimentBelow}`;
      }
    }

    if (triggered) {
      result.push({
        rule,
        reason,
        windowCount: windowed.length,
        avgSentiment: avg,
        highOrCritical: highOrCritical.length,
      });
    }
  }

  return result;
}
