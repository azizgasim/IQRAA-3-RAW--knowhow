import { getPersonaById, DEFAULT_PERSONA_ID } from "../lib/personas/persona-registry";
import {
  getCurrentPersonaIdFromSession,
  setCurrentPersonaIdInSession,
} from "../lib/memory/session-utils";
import type { PersonaId } from "@/lib/personas/persona-types";
import { BoxEngine } from "@/components/boxes/box-engine";
import { detectPipeline } from "./router";
import {
  semanticExpansionEngine,
  cognitiveAnalyticsEngine,
  reasoningEngine,
  taskPlannerEngine,
  insightSynthesisEngine,
} from "./engines/core-engines";
import { MemoryEngine } from "@/lib/memory/memory-engine";
import { onPipelineExpanded, onPipelineReasoned } from "@/lib/memory/integration-hooks";

interface RunPipelineOptions {
  personaId?: PersonaId;
}

export async function runPipeline(
  input: string,
  options: RunPipelineOptions = {}
) {
  // 1) Load current memory
  const sessionMemory = MemoryEngine.loadSessionMemory();
  const projectMemory = MemoryEngine.loadProjectMemory();
  const conceptGraph = MemoryEngine.loadConceptGraph();

  // 2) Determine the effective persona
  const personaId =
    options.personaId ?? getCurrentPersonaIdFromSession(sessionMemory, DEFAULT_PERSONA_ID);
  const persona = getPersonaById(personaId) ?? getPersonaById(DEFAULT_PERSONA_ID)!;

  // 3) Update memory with the chosen persona
  const updatedSession = setCurrentPersonaIdInSession(sessionMemory, persona.id);
  MemoryEngine.saveSessionMemory(updatedSession);

  const pipelineContext = {
    input,
    session: updatedSession,
    project: projectMemory,
    conceptGraph: conceptGraph,
    persona,
  };

  // Run intelligence boxes with persona awareness
  const primaryOutput = BoxEngine.runBox(1, { text: input });
  const expansion = await semanticExpansionEngine(pipelineContext);
  const analytics = await cognitiveAnalyticsEngine(pipelineContext, {
    expansionSummary: expansion.summary,
  });
  const reasoning = await reasoningEngine(pipelineContext, {
    expansionSummary: expansion.summary,
    analyticsNotes: analytics.notes,
  });
  const insight = await insightSynthesisEngine(pipelineContext, {
    expansionSummary: expansion.summary,
    analyticsNotes: analytics.notes,
    reasoningText: reasoning.reasoningText,
  });
  
  onPipelineExpanded(expansion);
  onPipelineReasoned(reasoning);

  // 5) Update memory + journal as usual
  MemoryEngine.saveSessionMemory({
    lastInput: input,
    lastRunAt: new Date().toISOString(),
    lastPipeline: {
      primaryOutput,
      expansion,
      analytics,
      reasoning,
      insight,
      personaId: persona.id,
    },
  });
  
  MemoryEngine.syncAll();

  return {
    persona,
    primaryOutput,
    expansion,
    analytics,
    reasoning,
    insight,
  };
}
