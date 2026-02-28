import { generateText } from "@/lib/ai/ai-client";
import {
  buildSemanticExpansionPrompt,
  buildCognitiveAnalyticsPrompt,
  buildTaskPlannerPrompt,
  buildReasoningPrompt,
  buildInsightPrompt,
  type PipelineContext,
} from "@/lib/ai/prompt-templates";

function safeJsonParse<T = any>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/* Box 2 – Semantic Expansion */
export async function semanticExpansionEngine(ctx: PipelineContext) {
  const { systemPrompt, userPrompt } = buildSemanticExpansionPrompt(ctx);
  const res = await generateText({ systemPrompt, userPrompt });

  const parsed = safeJsonParse<{
    concepts?: string[];
    themes?: string[];
    summary?: string;
  }>(res.text);

  if (!parsed) {
    return {
      concepts: [],
      themes: [],
      summary: res.text, // fallback
    };
  }

  return parsed;
}

/* Box 3 – Cognitive Analytics */
export async function cognitiveAnalyticsEngine(ctx: PipelineContext, params: {
  expansionSummary?: string;
}) {
  const { systemPrompt, userPrompt } = buildCognitiveAnalyticsPrompt(
    ctx,
    params.expansionSummary
  );
  const res = await generateText({ systemPrompt, userPrompt });

  const parsed = safeJsonParse<{
    density?: number;
    coherence?: number;
    complexity?: number;
    flags?: string[];
    notes?: string;
  }>(res.text);

  if (!parsed) {
    return {
      density: null,
      coherence: null,
      complexity: null,
      flags: ["تعذر تفسير مخرجات المحرك، راجع البرومبت."],
      notes: res.text,
    };
  }

  return parsed;
}

/* Box 7 – Task Planner */
export async function taskPlannerEngine(ctx: PipelineContext, params: {
  expansionSummary?: string;
}) {
  const { systemPrompt, userPrompt } = buildTaskPlannerPrompt(
    ctx,
    params.expansionSummary
  );
  const res = await generateText({ systemPrompt, userPrompt });

  const parsed = safeJsonParse<{
    summary?: string;
    steps?: {
      id?: string;
      title: string;
      description?: string;
      phase?: string;
      priority?: "low" | "medium" | "high";
    }[];
  }>(res.text);

  if (!parsed) {
    return {
      summary: "تعذر تفسير مخرجات مخطط المهام، راجع البرومبت.",
      steps: [],
    };
  }

  return parsed;
}

/* Box 11 – Reasoning Engine */
export async function reasoningEngine(ctx: PipelineContext, params: {
  expansionSummary?: string;
  analyticsNotes?: string;
}) {
  const { systemPrompt, userPrompt } = buildReasoningPrompt(
    ctx,
    params.expansionSummary,
    params.analyticsNotes
  );
  const res = await generateText({ systemPrompt, userPrompt });

  const parsed = safeJsonParse<{
    reasoningText?: string;
    assumptions?: string[];
    implications?: string[];
  }>(res.text);

  if (!parsed) {
    return {
      reasoningText: res.text,
      assumptions: [],
      implications: [],
    };
  }

  return parsed;
}

/* Box 10 – Insight Synthesis */
export async function insightSynthesisEngine(ctx: PipelineContext, params: {
  expansionSummary?: string;
  analyticsNotes?: string;
  reasoningText?: string;
}) {
  const { systemPrompt, userPrompt } = buildInsightPrompt(ctx, params);
  const res = await generateText({ systemPrompt, userPrompt });

  const parsed = safeJsonParse<{
    title?: string;
    summary?: string;
    recommendations?: string[];
    tags?: string[];
  }>(res.text);

  if (!parsed) {
    return {
      title: "Insight (raw)",
      summary: res.text,
      recommendations: [],
      tags: [],
    };
  }

  return parsed;
}
