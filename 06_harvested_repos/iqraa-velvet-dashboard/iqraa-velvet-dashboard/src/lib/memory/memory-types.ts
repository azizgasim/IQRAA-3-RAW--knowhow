export interface SessionMemory {
  lastInput?: string;
  lastRunAt?: string;
  lastPipeline?: any;
  currentPersonaId?: string;
  [key: string]: any;
}

export interface ProjectMemory {
  currentTopic?: string;
  runsCount?: number;
  [key: string]: any;
}

export interface ConceptGraphMemory {
  nodes?: Record<string, any>;
  edges?: any[];
  [key: string]: any;
}

export interface FullMemory {
  session: SessionMemory;
  project: ProjectMemory;
  conceptGraph: ConceptGraphMemory;
}