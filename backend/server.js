import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import analysisRouter from "./routes/analysis.js";
import { startMonitor } from "./agent/monitor.js";
import { planAndExecute } from "./agent/runner.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", analysisRouter);

app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err?.message);
  res.status(500).json({ error: "Server error" });
});

app.use("/api/analysis", analysisRouter);

// Kick off the agent
startMonitor();
// Also run a quick plan/execute every 10 minutes (align with monitor) — simple setInterval for demo
setInterval(() => {
  planAndExecute().catch(() => {});
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
