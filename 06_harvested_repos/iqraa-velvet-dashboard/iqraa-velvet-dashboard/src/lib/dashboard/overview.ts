import { MemoryEngine } from "@/lib/memory/memory-engine";
import { getPersonaById, DEFAULT_PERSONA_ID } from "@/lib/personas/persona-registry";
import type { PersonaId } from "@/lib/personas/persona-types";
import { SessionMemory } from "@/lib/memory/memory-types"; // Import SessionMemory interface

export interface DashboardOverview {
  persona: {
    id: PersonaId;
    name: string;
    title: string;
    memoryMode: string;
  };
  lastRunAt?: string;
  lastInputSnippet?: string;
  lastInsightSnippet?: string;
  runsCount?: number;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const session = MemoryEngine.loadSessionMemory(); // Corrected: Use loadSessionMemory()
  const project = MemoryEngine.loadProjectMemory(); // Corrected: Use loadProjectMemory()

  const personaId =
    (session.currentPersonaId as PersonaId | undefined) ?? DEFAULT_PERSONA_ID;

  const personaConfig =
    getPersonaById(personaId) ?? getPersonaById(DEFAULT_PERSONA_ID)!;

  const lastRunAt = session.lastRunAt as string | undefined;
  const lastInput = session.lastInput as string | undefined;

  // Assuming session.lastPipeline stores the full output of runPipeline
  const lastPipeline = session.lastPipeline as any | undefined;
  const lastInsightText: string | undefined =
    lastPipeline?.insight?.text ??
    lastPipeline?.insight?.summary ??
    undefined;

  const runsCount =
    (project.runsCount as number | undefined) ??
    (session.runsCount as number | undefined) ?? // Consider if session.runsCount is still relevant
    undefined;

  return {
    persona: {
      id: personaConfig.id,
      name: personaConfig.name,
      title: personaConfig.title,
      memoryMode: personaConfig.memoryMode,
    },
    lastRunAt,
    lastInputSnippet: lastInput ? sliceSnippet(lastInput) : undefined,
    lastInsightSnippet: lastInsightText
      ? sliceSnippet(lastInsightText) 
      : undefined,
    runsCount,
  };
}

function sliceSnippet(text: string, max = 220): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}
