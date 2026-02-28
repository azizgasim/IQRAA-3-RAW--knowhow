import { MemoryEngine } from "@/lib/memory/memory-engine";

export function reasoningEngine(expanded: any) {
  const { concepts, themes } = expanded;

  const projectMemory = MemoryEngine.loadProjectMemory() || {};
  const previousConcepts = projectMemory.lastConcepts || [];
  const previousThemes = projectMemory.lastThemes || [];
  const previousReasoning = projectMemory.lastReasoning || [];

  const steps: any[] = [];

  // Observation
  if (concepts.length > 0) {
    steps.push({
      type: "Observation",
      message: `Key concept detected: ${concepts[0]}`,
    });
  }

  // Memory-based comparison
  if (previousConcepts.length > 0) {
    const overlap = concepts.filter((c: string) =>
      previousConcepts.includes(c)
    );

    if (overlap.length > 0) {
      steps.push({
        type: "Memory-Link",
        message: `Overlap with prior concepts: ${overlap.join(", ")}`,
      });
    }
  }

  if (themes.length > 0) {
    steps.push({
      type: "Theme Analysis",
      message: `Primary theme: ${themes[0].keywords.join(", ")}`,
    });
  }

  if (previousThemes.length > 0) {
    steps.push({
      type: "Theme History",
      message: `Previous themes included: ${JSON.stringify(
        previousThemes.slice(0, 2)
      )}`,
    });
  }

  if (concepts.length > 5) {
    steps.push({
      type: "Inference",
      message: `Content suggests multi-dimensional structure.`,
    });
  }

  if (previousReasoning.length > 0) {
    steps.push({
      type: "Meta-Reasoning",
      message: `Building on prior reasoning chain of length ${previousReasoning.length}.`,
    });
  }

  const reasoningChain = steps.map((s, i) => ({
    step: i + 1,
    ...s,
  }));

  const conclusion = `
Based on current and previous conceptual and thematic analysis,
the text demonstrates structured meaning with ${concepts.length}
core concepts and ${themes.length} thematic clusters.

There is ${
    previousConcepts.length > 0 ? "an existing memory context" : "no prior memory context"
  }, and the system is adapting its reasoning accordingly.
  `;

  return {
    reasoningText: conclusion, // Changed conclusion to reasoningText to match UI expectation
    assumptions: [
      "Input text is representative of a single domain.",
      "Prior memory is relevant to current task.",
    ],
    implications: [
      "Deeper analysis may reveal new conceptual links.",
      "Persona context will refine thematic focus.",
    ],
    reasoningChain,
  };
}
