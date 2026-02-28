import { runtimeMemory } from "./runtime-memory";
import { readLocal, writeLocal } from "./local-storage";
import { b2Client } from "../cloud/b2-client";
import { FullMemory, SessionMemory, ProjectMemory, ConceptGraphMemory } from "./memory-types";
import { saveConceptGraphToFiles, computeChangedConcepts } from "./concept-graph-utils";
import {
  logSessionUpdate,
  logProjectUpdate,
  logConceptGraphUpdate,
  logMemorySyncStart,
  logMemorySyncComplete,
  logMemoryEvent // Still needed for generic FULL_SYNC if it remains, but syncAll will be updated.
} from "./memory-journal";

const MAIN_BUCKET = "iqraa-dashboard-memory";
const CONCEPT_BUCKET = "concept-graph-memory";

// This function is no longer needed after refactoring saveConceptGraph
// function diffConceptGraph(before: Record<string, number>, after: Record<string, number>) {
//   const changes: { concept: string; from: number; to: number }[] = [];
//
//   const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
//
//   for (const key of allKeys) {
//     const from = before?.[key] || 0;
//     const to = after?.[key] || 0;
//     if (from !== to) {
//       changes.push({ concept: key, from, to });
//     }
//   }
//
//   return changes;
// }

export const MemoryEngine = {
  // --------------------------
  // SESSION MEMORY
  // --------------------------
  saveSessionMemory(data: SessionMemory) { // Changed type to SessionMemory
    const before = { ...(runtimeMemory.session || {}) };

    runtimeMemory.updateSession(data);
    writeLocal("session", runtimeMemory.session);

    logSessionUpdate({
      before,
      after: {
        lastInput: runtimeMemory.session.lastInput,
        lastRunAt: runtimeMemory.session.lastRunAt,
        lastPipeline: runtimeMemory.session.lastPipeline ? { personaId: (runtimeMemory.session.lastPipeline as any).personaId } : undefined,
        currentPersonaId: runtimeMemory.session.currentPersonaId,
      },
      note: "Session updated after pipeline run or user selection.",
    });

    // Mock "cloud" upload
    b2Client.uploadFile(MAIN_BUCKET, "session", runtimeMemory.session);
  },

  loadSessionMemory(): SessionMemory { // Changed return type
    const local = readLocal("session") as SessionMemory; // Cast to SessionMemory
    if (local) runtimeMemory.session = local;
    return runtimeMemory.session;
  },

  // --------------------------
  // PROJECT MEMORY
  // --------------------------
  saveProjectMemory(data: ProjectMemory) { // Changed type to ProjectMemory
    const before = { ...(runtimeMemory.project || {}) };

    runtimeMemory.updateProject(data);
    writeLocal("project", runtimeMemory.project);

    logProjectUpdate({
      before,
      after: { ...runtimeMemory.project },
      note: "Project memory updated.",
      diff: {
        addedKeys: Object.keys(runtimeMemory.project).filter((k) => !(k in before)),
        updatedKeys: Object.keys(runtimeMemory.project).filter((k) => k in before && (before as any)[k] !== (runtimeMemory.project as any)[k]),
        removedKeys: Object.keys(before).filter((k) => !(k in runtimeMemory.project)),
      },
    });

    // Mock "cloud" upload
    b2Client.uploadFile(MAIN_BUCKET, "project", runtimeMemory.project);
  },

  loadProjectMemory(): ProjectMemory { // Changed return type
    const local = readLocal("project") as ProjectMemory; // Cast to ProjectMemory
    if (local) runtimeMemory.project = local;
    return runtimeMemory.project;
  },

  // --------------------------
  // CONCEPT GRAPH MEMORY
  // --------------------------
  async saveConceptGraph(graph: ConceptGraphMemory) { // Changed type to ConceptGraphMemory, made async
    const before = { ...(runtimeMemory.conceptGraph || {}) };

    runtimeMemory.updateConceptGraph(graph);
    await saveConceptGraphToFiles(graph); // Use new utility

    const changedConcepts = computeChangedConcepts(before, graph); // Use new utility

    await logConceptGraphUpdate({
      before: { nodesCount: Object.keys(before.nodes ?? {}).length, edgesCount: before.edges?.length ?? 0 }, // Updated meta
      after: { nodesCount: Object.keys(graph.nodes ?? {}).length, edgesCount: graph.edges?.length ?? 0 }, // Updated meta
      changedConcepts,
      note: "Concept graph updated based on latest semantic expansion",
      meta: {
        edgesBefore: before.edges?.length ?? 0,
        edgesAfter: graph.edges?.length ?? 0,
      },
    });
  },

  loadConceptGraph(): ConceptGraphMemory { // Changed return type
    const local = readLocal("concept-graph") as ConceptGraphMemory; // Cast to ConceptGraphMemory
    if (local) runtimeMemory.conceptGraph = local;
    return runtimeMemory.conceptGraph;
  },

  // --------------------------
  // FULL MEMORY LOAD/SAVE
  // --------------------------
  async load(): Promise<FullMemory> {
    const session = this.loadSessionMemory();
    const project = this.loadProjectMemory();
    const conceptGraph = this.loadConceptGraph();

    return { session, project, conceptGraph };
  },

  async save(memory: FullMemory) {
    if (memory.session) {
      this.saveSessionMemory(memory.session); // Await removed, as saveSessionMemory is not async
    }
    if (memory.project) {
      this.saveProjectMemory(memory.project); // Await removed
    }
    if (memory.conceptGraph) {
      await this.saveConceptGraph(memory.conceptGraph); // This is async
    }
  },

  // --------------------------
  // FULL MEMORY SYNC
  // --------------------------
  async syncAll() { // Made async
    logMemorySyncStart("Initiating full memory synchronization.");

    this.saveSessionMemory(runtimeMemory.session);
    this.saveProjectMemory(runtimeMemory.project);
    await this.saveConceptGraph(runtimeMemory.conceptGraph); // Pass runtimeMemory.conceptGraph directly

    logMemorySyncComplete({
      syncedAt: new Date().toISOString(),
    });
  },
};
