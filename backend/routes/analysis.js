import { Router } from "express";
import { z } from "zod";
import {
  analyzeWithOpenAI,
  simpleHeuristicAnalysis,
} from "../services/openai.service.js";
import { mockFeedback } from "../data/mockFeedback.js";

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

router.get("/mock-feedback", (_req, res) => {
  res.json({ data: mockFeedback });
});

export default router;
