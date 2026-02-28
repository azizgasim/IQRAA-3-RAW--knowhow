import type { PersonaConfig } from "@/lib/personas/persona-types";
import type { SessionMemory, ProjectMemory, ConceptGraphMemory } from "@/lib/memory/memory-types";

export interface PipelineContext {
  input: string;
  persona: PersonaConfig;
  session: SessionMemory;
  project: ProjectMemory;
  conceptGraph: ConceptGraphMemory;
}

/**
 * helper صغير لقص النص إذا طال جداً
 */
function sliceForPrompt(text: string, max = 3500): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n\n[... truncated for prompt ...]";
}

/* Box 2 – Semantic Expansion */
export function buildSemanticExpansionPrompt(ctx: PipelineContext): {
  systemPrompt: string;
  userPrompt: string;
} {
  const { input, persona, project } = ctx;

  const systemPrompt = [
    "أنت محرّك توسّع دلالي يعمل داخل نظام إقرأ 12 الوطني القيمي.",
    "مهمتك استخراج المفاهيم الأساسية، الثيمات، والروابط الدلالية من النص,",
    "مع مراعاة منظور الشخصية التحليلية التالية:",
    "",
    `- Persona: ${persona.name} (${persona.title})`,
    `- Focus: ${JSON.stringify(persona.focus)}`,
    `- Semantic depth: ${persona.semanticExpansionDepth}`,
  ].join("\n");

  const projectContext = project?.currentTopic
    ? `\nالسياق العام للمشروع الحالي: ${project.currentTopic}\n`
    : "";

  const userPrompt = [
    "النص المدخل (من الباحث):",
    "-------------------------",
    sliceForPrompt(input),
    "",
    projectContext,
    "المطلوب منك:",
    "- استخراج قائمة مفاهيم رئيسية (concepts) من النص.",
    "- استخراج ثيمات/محاور عامة (themes).",
    "- تلخيص توسّع دلالي مختصر يربط بين هذه المفاهيم.",
    "",
    "أعد النتائج في JSON بالهيكل التالي فقط:",
    "{",
    '  "concepts": ["...", "..."],
    '  "themes": ["...", "..."],
    '  "summary": "نص عربي يلخص التوسّع الدلالي.",
    "}",
  ].join("\n");

  return { systemPrompt, userPrompt };
}

/* Box 3 – Cognitive Analytics */
export function buildCognitiveAnalyticsPrompt(ctx: PipelineContext, expansionSummary?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const { input, persona } = ctx;

  const systemPrompt = [
    "أنت محرّك تحليل معرفي يعمل داخل نظام إقرأ 12.",
    "مهمتك تقييم النص من حيث:",
    "- الكثافة المعرفية (density)",
    "- تماسك البناء (coherence)",
    "- درجة التعقيد (complexity)",
    "",
    `الشخصية التحليلية النشطة: ${persona.name} – ${persona.title}`,
  ].join("\n");

  const userPrompt = [
    "النص المدخل:",
    "------------",
    sliceForPrompt(input, 2500),
    "",
    expansionSummary
      ? "ملخص توسّع دلالي سابق (للاستئناس فقط):\n" + sliceForPrompt(expansionSummary, 1000)
      : "",
    "",
    "المطلوب:",
    "- أعط قيمًا رقمية تقريبية بين 0 و 1 لكل من: density, coherence, complexity.",
    "- أعط قائمة قصيرة من flags (ملاحظات/تنبيهات).",
    "- ضع ملاحظة نصية عامة عن حالة النص.",
    "",
    "أعد النتائج في JSON بالهيكل:",
    "{",
    '  "density": 0.0-1.0,`,
    '  "coherence": 0.0-1.0,`,
    '  "complexity": 0.0-1.0,`,
    '  "flags": ["...", "..."],
    '  "notes": "نص عربي...",
    "}",
  ].join("\n");

  return { systemPrompt, userPrompt };
}

/* Box 7 – Task Planner */
export function buildTaskPlannerPrompt(ctx: PipelineContext, expansionSummary?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const { input, persona } = ctx;

  const systemPrompt = [
    "أنت مخطِّط مهام (Task Planner) يعمل داخل لوحة إقرأ 12.",
    "مهمتك تحويل النص إلى خطة عمل عملية بخطوات واضحة,",
    "مع مراعاة البعد القيمي والوطني والاستقرار السياسي.",
    "",
    `الشخصية: ${persona.name} – ${persona.title}`,
  ].join("\n");

  const userPrompt = [
    "النص المدخل:",
    "------------",
    sliceForPrompt(input, 2500),
    "",
    expansionSummary
      ? "ملخص توسّع دلالي (للاستئناس):\n" + sliceForPrompt(expansionSummary, 1200)
      : "",
    "",
    "المطلوب:",
    "- بناء قائمة steps، كل step تحتوي:",
    '  - "title": عنوان قصير`,
    '  - "description": شرح تنفيذ مختصر`,
    '  - "phase": إن أمكن (مثل: تحليل، تصميم، تنفيذ، متابعة)`,
    '  - "priority": "low" | "medium" | "high"`,
    "- وضع ملخص عام للخطة (summary).",
    "",
    "أعد النتائج في JSON بالهيكل:",
    "{",
    '  "summary": "ملخص الخطة...",`,
    '  "steps": [`,
    "     {",
    '       "title": "...",`,
    '       "description": "...",`,
    '       "phase": "...",`,
    '       "priority": "low|medium|high"`,
    "     }",
    "  ]",
    "}",
  ].join("\n");

  return { systemPrompt, userPrompt };
}

/* Box 11 – Reasoning Engine */
export function buildReasoningPrompt(ctx: PipelineContext, expansionSummary?: string, analyticsNotes?: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const { input, persona } = ctx;

  const systemPrompt = [
    "أنت محرّك تعليل (Reasoning Engine) داخل نظام إقرأ 12.",
    "مهمتك بناء تحليل حجّاجي للنص يربطه بالقيم، المخاطر، والفرص,",
    "مع مراعاة منظور الشخصية التحليلية النشطة.",
    "",
    `Persona: ${persona.name} – ${persona.title}`,
    `Tone: ${persona.tone}`,
  ].join("\n");

  const userPrompt = [
    "النص المدخل:",
    "------------",
    sliceForPrompt(input, 2500),
    "",
    expansionSummary
      ? "ملخص توسّع دلالي:\n" + sliceForPrompt(expansionSummary, 800)
      : "",
    "",
    analyticsNotes
      ? "ملاحظات التحليل المعرفي:\n" + analyticsNotes
      : "",
    "",
    "المطلوب:",
    "- كتابة نص تعليل (reasoningText) يشرح:",
    "  * أهم الفرضيات الضمنية في النص.",
    "  * نقاط القوة والضعف في البناء.",
    "  * كيف يمكن استثمار النص في مشروع وطني/قيمي.",
    "- استخراج قائمة assumptions (افتراضات).",
    "- استخراج قائمة implications (آثار/نتائج محتملة).",
    "",
    "أعد النتائج في JSON بالهيكل:",
    "{",
    '  "reasoningText": "نص عربي...",`,
    '  "assumptions": ["...", "..."],
    '  "implications": ["...", "..."]`,
    "}",
  ].join("\n");

  return { systemPrompt, userPrompt };
}

/* Box 10 – Insight Synthesis */
export function buildInsightPrompt(ctx: PipelineContext, parts: {
  expansionSummary?: string;
  analyticsNotes?: string;
  reasoningText?: string;
}): {
  systemPrompt: string;
  userPrompt: string;
} {
  const { persona } = ctx;

  const systemPrompt = [
    "أنت محرّك تركيب Insights داخل نظام إقرأ 12.",
    "مهمتك دمج نتائج التوسّع الدلالي، التحليل المعرفي، والتعليل,",
    "في Insight واحد قابل للاستخدام من قبل صانع القرار أو الباحث.",
    "",
    `Persona: ${persona.name} – ${persona.title}`,
    `Preferred length: ${persona.preferredLength}`,
  ].join("\n");

  const userPrompt = [
    "مواد خام للتحليل:",
    "------------------",
    parts.expansionSummary
      ? "1) ملخص توسّع دلالي:\n" + sliceForPrompt(parts.expansionSummary, 800)
      : "",
    parts.analyticsNotes ? "\n2) ملاحظات التحليل المعرفي:\n" + parts.analyticsNotes : "",
    parts.reasoningText ? "\n3) نص التعليل:\n" + sliceForPrompt(parts.reasoningText, 1200) : "",
    "",
    "المطلوب:",
    "- صياغة Insight مركّب بعنوان قصير (title).",
    "- كتابة summary يركّز على ما يجب أن يفهمه صانع القرار.",
    "- اقتراح قائمة recommendations (توصيات عملية).",
    "- اقتراح قائمة tags (وسوم/محاور رئيسة) من 3–7 عناصر.",
    "",
    "أعد النتائج في JSON بالهيكل:",
    "{",
    '  "title": "عنوان مختصر...",`,
    '  "summary": "نص عربي يلخّص الفهم المركّب...",`,
    '  "recommendations": ["...", "..."],
    '  "tags": ["...", "..."]`,
    "}",
  ].join("\n");

  return { systemPrompt, userPrompt };
}
