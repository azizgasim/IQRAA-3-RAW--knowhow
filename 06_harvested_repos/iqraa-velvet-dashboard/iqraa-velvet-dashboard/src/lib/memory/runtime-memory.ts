import { SessionMemory } from "./memory-types";

export const runtimeMemory = {
  session: {} as SessionMemory,
  project: {} as Record<string, any>, // Project memory can store various data
  conceptGraph: {} as any, // Will now store the full graph object

  updateSession(data: any) {
    this.session = { ...this.session, ...data };
  },

  updateProject(data: any) {
    this.project = { ...this.project, ...data };
  },

  // New method to update the full concept graph object
  updateConceptGraph(graph: any) {
    this.conceptGraph = { ...graph };
  }
};
