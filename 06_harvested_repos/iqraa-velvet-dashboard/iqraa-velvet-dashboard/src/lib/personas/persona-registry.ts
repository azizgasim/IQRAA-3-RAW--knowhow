import type { PersonaConfig, PersonaId } from "./persona-types";

export const PERSONAS: PersonaConfig[] = [
  {
    id: "academic-researcher",
    name: "الباحث الأكاديمي",
    title: "تحليل نظري عميق",
    description:
      "يركّز على الإطار النظري، المفاهيم، المراجع الضمنية، والربط بين الحقول المعرفية.",
    tone: "analytical",
    focus: {
      values: true,
      institutions: true,
      technicalDetail: true,
    },
    semanticExpansionDepth: "deep",
    memoryMode: "aggressive",
    cognitiveWeights: {
      density: 0.9,
      coherence: 0.9,
      complexity: 0.8,
    },
    preferredLength: "long",
  },
  {
    id: "policy-strategist",
    name: "مخطِّط السياسات",
    title: "مخرجات تنفيذية منظّمة",
    description:
      "يحوّل المدخل إلى خيارات سياسات، أدوات تدخل، وآثار متوقعة، مع مراعاة الاستقرار والتنمية.",
    tone: "executive",
    focus: {
      policy: true,
      institutions: true,
      values: true,
    },
    semanticExpansionDepth: "normal",
    memoryMode: "balanced",
    cognitiveWeights: {
      density: 0.7,
      coherence: 0.95,
      complexity: 0.6,
    },
    preferredLength: "medium",
  },
  {
    id: "value-philosopher",
    name: "فيلسوف القيم",
    title: "تفكيك قيمي–وجودي",
    description:
      "يستخرج البنية القيمية والوجودية للنص، ويربطها بمشروع الهوية الوطنية والأخلاقية.",
    tone: "analytical",
    focus: {
      values: true,
    },
    semanticExpansionDepth: "deep",
    memoryMode: "aggressive",
    cognitiveWeights: {
      density: 0.8,
      coherence: 0.85,
      complexity: 0.9,
    },
    preferredLength: "long",
  },
  {
    id: "media-architect",
    name: "مهندس الخطاب الإعلامي",
    title: "تحويل إلى رسائل إعلامية",
    description:
      "يصيغ المخرجات على شكل زوايا إعلامية، رسائل مفتاحية، وسرديات قابلة للنشر.",
    tone: "narrative",
    focus: {
      publicNarrative: true,
      values: true,
    },
    semanticExpansionDepth: "normal",
    memoryMode: "balanced",
    cognitiveWeights: {
      density: 0.6,
      coherence: 0.9,
      complexity: 0.5,
    },
    preferredLength: "medium",
  },
];

export function getPersonaById(id: PersonaId): PersonaConfig | undefined {
  return PERSONAS.find((p) => p.id === id);
}

// يمكن استخدام هذه كقيمة افتراضية
export const DEFAULT_PERSONA_ID: PersonaId = "academic-researcher";
