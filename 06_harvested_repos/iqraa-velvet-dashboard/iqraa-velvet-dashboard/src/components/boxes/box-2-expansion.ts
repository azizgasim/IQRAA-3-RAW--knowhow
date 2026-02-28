import { MemoryEngine } from "@/lib/memory/memory-engine";

export function semanticExpansionEngine(text: string) {
  const normalized = text
    .replace(/\s+/g, " ")
    .trim();

  // Load concept graph from memory
  const conceptGraph = MemoryEngine.loadConceptGraph() || {};

  // --------------------------
  // 1) Key Concept Extraction
  // --------------------------
  const words = normalized.split(" ");
  const uniqueWords = [...new Set(words.map((w) => w.toLowerCase()))];

  let concepts = uniqueWords.filter(
    (w) =>
      w.length > 4 &&
      !["about", "which", "these", "there", "their", "would"].includes(w)
  );

  // --------------------------
  // 2) Weight concepts by memory usage
  // --------------------------
  const weighted = concepts.map((c) => ({
    concept: c,
    weight: (conceptGraph[c] || 0) + 1,
  }));

  weighted.sort((a, b) => b.weight - a.weight);

  concepts = weighted.map((w) => w.concept);

  // --------------------------
  // 3) Thematic Clustering (memory-aware)
  // --------------------------
  const themes: { theme: string; keywords: string[] }[] = [];

  if (concepts.length > 0) {
    themes.push({
      theme: "Primary Theme (Memory-Weighted)",
      keywords: concepts.slice(0, 3),
    });
  }
  if (concepts.length > 3) {
    themes.push({
      theme: "Secondary Themes",
      keywords: concepts.slice(3, 7),
    });
  }

  // --------------------------
  // 4) Semantic Tree
  // --------------------------
  const semanticTree = {
    root: normalized,
    layers: [
      {
        level: 1,
        concepts: concepts.slice(0, 5),
      },
      {
        level: 2,
        concepts: concepts.slice(5, 10),
      },
      {
        level: 3,
        concepts: concepts.slice(10, 20),
      },
    ],
  };

  // --------------------------
  // 5) Concept Map
  // --------------------------
  const conceptMap = concepts.slice(0, 10).map((c, i) => ({
    concept: c,
    connectsTo: concepts.slice(i + 1, i + 4),
  }));

  // --------------------------
  // 6) Summary Expansion
  // --------------------------
  const expandedSummary = `
This text discusses the following major concepts (memory-weighted first):
${concepts.slice(0, 7).join(", ")}.

The primary themes inferred are:
${themes.map((t) => t.theme + ": " + t.keywords.join(", ")).join("\n")}

The semantic hierarchy suggests a layered meaning structure with
multiple levels of conceptual density influenced by prior usage.
  `;

  return {
    normalized,
    concepts,
    themes,
    semanticTree,
    conceptMap,
    expandedSummary,
    memoryConceptGraph: conceptGraph,
  };
}