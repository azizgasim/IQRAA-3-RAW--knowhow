import { readLocal, writeLocal } from "./local-storage";
import { b2Client } from "../cloud/b2-client";

const CONCEPT_BUCKET = "concept-graph-memory";

export async function saveConceptGraphToFiles(graph: any) {
  writeLocal("concept-graph", graph);
  await b2Client.uploadFile(CONCEPT_BUCKET, "concept-graph", graph);
}

export function computeChangedConcepts(before: any, after: any): string[] {
  const beforeNodes = new Set(Object.keys(before?.nodes || {}));
  const afterNodes = new Set(Object.keys(after?.nodes || {}));

  const changed = new Set<string>();

  for (const node of beforeNodes) {
    if (!afterNodes.has(node)) {
      changed.add(node);
    }
  }

  for (const node of afterNodes) {
    if (!beforeNodes.has(node)) {
      changed.add(node);
    }
  }

  return Array.from(changed);
}
