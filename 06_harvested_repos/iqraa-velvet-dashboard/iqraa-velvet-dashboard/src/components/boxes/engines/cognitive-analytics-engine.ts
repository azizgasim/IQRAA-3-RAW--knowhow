export function cognitiveAnalyticsEngine(expanded: any) {

  const conceptCount = expanded.concepts.length;
  const themeCount = expanded.themes.length;
  const treeDepth = expanded.semanticTree.layers.length;

  // Density Score
  const density =
    conceptCount > 0
      ? Number((conceptCount / expanded.normalized.length).toFixed(3))
      : 0;

  // Coherence Score
  const coherence =
    themeCount > 0
      ? Number((themeCount / treeDepth).toFixed(2))
      : 0.2;

  // Complexity Score (Academic)
  const complexity = Number(
    ((conceptCount * treeDepth) / 10).toFixed(2)
  );

  // Risk Flags
  const flags = [];
  if (density < 0.01) flags.push("Very Low Density: Text might be shallow.");
  if (coherence < 0.15) flags.push("Low Coherence: Themes need structuring.");
  if (complexity > 8) flags.push("High Cognitive Load.");

  return {
    densityScore: density,
    coherenceScore: coherence,
    complexityScore: complexity,
    flags,
    summary: `
Cognitive analysis shows density=${density},
coherence=${coherence}, complexity=${complexity}.
Flags: ${flags.join(", ")}
    `,
  };
}
