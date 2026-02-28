import { MemoryEngine } from "./memory-engine";

export function onPipelineExpanded(expanded: any) {
  MemoryEngine.saveProjectMemory({
    lastConcepts: expanded.concepts,
    lastThemes: expanded.themes,
  });

  MemoryEngine.saveConceptGraph(expanded.concepts);
}

export function onPipelineReasoned(reason: any) {
  MemoryEngine.saveProjectMemory({
    lastReasoning: reason.reasoningChain,
  });
}
