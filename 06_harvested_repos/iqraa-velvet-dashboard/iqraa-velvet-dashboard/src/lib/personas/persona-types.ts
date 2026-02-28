export type PersonaId =
  | "academic-researcher"
  | "policy-strategist"
  | "value-philosopher"
  | "media-architect";

export type MemoryMode = "conservative" | "balanced" | "aggressive";

export interface PersonaConfig {
  id: PersonaId;
  name: string;
  title: string;
  description: string;

  /** أسلوب الإخراج */
  tone: "formal" | "analytical" | "narrative" | "executive";

  /** تركيز التحليل */
  focus: {
    policy?: boolean;
    values?: boolean;
    institutions?: boolean;
    publicNarrative?: boolean;
    technicalDetail?: boolean;
  };

  /** عمق التوسّع الدلالي */
  semanticExpansionDepth: "shallow" | "normal" | "deep";

  /** نمط الذاكرة */
  memoryMode: MemoryMode;

  /** تفضيلات التحليل المعرفي */
  cognitiveWeights: {
    density: number;   // 0–1
    coherence: number; // 0–1
    complexity: number; // 0–1
  };

  /** طول المخرجات التقريبي */
  preferredLength: "short" | "medium" | "long";
}
