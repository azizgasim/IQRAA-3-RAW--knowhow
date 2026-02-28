export interface BoxSpec {
  id: number;
  name: string;
  purpose: string;
  description: string;
  inputs: string[];
  outputs: string[];
  triggers: string[];
  depends_on: number[];
  feeds_into: number[];
}

export const BoxesMetadata: BoxSpec[] = [
  {
    id: 1,
    name: "Primary Processing Engine",
    purpose: "Normalize and structure raw input into a machine-ready form.",
    description:
      "The official entry-point of IQRAA 12. Handles intake, normalization, intent detection, text cleaning, metadata extraction, and preparation for semantic expansion.",
    inputs: ["raw_text", "user_instruction", "document_blob"],
    outputs: ["clean_text", "intent", "task_type", "primary_context"],
    triggers: ["on_user_submit", "on_document_upload"],
    depends_on: [6], 
    feeds_into: [2],
  },
  {
    id: 2,
    name: "Interpretation & Expansion Layer",
    purpose: "Expand meaning, build semantic trees, create conceptual frames.",
    description:
      "Transforms normalized input into structured understanding. Generates semantic expansions, builds a concept map, and prepares content for analytics.",
    inputs: ["primary_context", "session_memory"],
    outputs: ["semantic_tree", "expanded_context", "concept_map"],
    triggers: ["after_box_1"],
    depends_on: [1, 6],
    feeds_into: [3],
  },
  {
    id: 3,
    name: "Cognitive Analytics & Telemetry",
    purpose: "Evaluate quality, generate KPIs, score coherence, detect anomalies.",
    description:
      "Produces system-level metrics: semantic density, reasoning depth, coherence scoring, topic KPIs, and cognitive telemetry.",
    inputs: ["semantic_tree", "concept_map"],
    outputs: ["kpi_report", "flags", "telemetry"],
    triggers: ["after_box_2"],
    depends_on: [2],
    feeds_into: [12, 10],
  },
  {
    id: 4,
    name: "Advanced Search & Retrieval",
    purpose: "Retrieve context, memories, documents relevant to the task.",
    description:
      "Semantic retrieval engine linked with memory, documents, and multi-source embeddings.",
    inputs: ["query", "search_context"],
    outputs: ["retrieved_items", "ranked_results"],
    triggers: ["on_search", "pipeline_needs_context"],
    depends_on: [6],
    feeds_into: [2, 3, 11],
  },
  {
    id: 5,
    name: "Multi-Agent Workspace Engine",
    purpose: "Coordinate and manage multiple cooperating agents.",
    description:
      "Handles agent roles, task passing, conversation routing, and cooperative reasoning.",
    inputs: ["task_graph", "agent_instruction"],
    outputs: ["agent_updates", "collaborative_results"],
    triggers: ["complex_task_detected"],
    depends_on: [1, 7, 11],
    feeds_into: [2, 10],
  },
  {
    id: 6,
    name: "Context Memory Store",
    purpose: "Store and retrieve short-term and long-term memory.",
    description:
      "Maintains embeddings, contextual traces, project memory, and retrieval hooks.",
    inputs: ["memory_write_request"],
    outputs: ["memory_block", "retrieved_memory"],
    triggers: ["on_input", "on_query", "pipeline_requires_memory"],
    depends_on: [],
    feeds_into: [1, 2, 4],
  },
  {
    id: 7,
    name: "Task Planning & Decomposition",
    purpose: "Break down complex tasks and generate a task graph.",
    description:
      "Planner engine producing structured workflows, sub-tasks, and sequencing graphs.",
    inputs: ["task_type", "intent"],
    outputs: ["task_graph", "task_breakdown"],
    triggers: ["complex_task_identified"],
    depends_on: [1, 11],
    feeds_into: [5, 12],
  },
  {
    id: 8,
    name: "Execution & Tools Runtime",
    purpose: "Execute code, run tools, and operate system actions.",
    description:
      "Handles tool calls, code execution, environment operations, and structured outputs.",
    inputs: ["execution_request"],
    outputs: ["execution_output"],
    triggers: ["runtime_needed"],
    depends_on: [12],
    feeds_into: [10],
  },
  {
    id: 9,
    name: "Document Intelligence Layer",
    purpose: "Extract and structure insights from documents.",
    description:
      "Document parser with multi-level extraction, structuring, segmentation, and insight mining.",
    inputs: ["document_blob"],
    outputs: ["structured_doc", "doc_insights"],
    triggers: ["document_uploaded"],
    depends_on: [1, 6],
    feeds_into: [10, 2],
  },
  {
    id: 10,
    name: "Insight Synthesis Engine",
    purpose: "Combine signals into coherent insights.",
    description:
      "Synthesizes knowledge blocks, KPIs, expansions, and reasoning into high-level insights.",
    inputs: ["semantic_tree", "kpi_report", "doc_insights"],
    outputs: ["synthesized_insights", "final_summary"],
    triggers: ["after_analysis_complete"],
    depends_on: [2, 3, 9],
    feeds_into: [12],
  },
  {
    id: 11,
    name: "Reasoning Engine",
    purpose: "Perform logical reasoning, modeling, and chain-of-thought orchestration.",
    description:
      "Handles logical reasoning, symbolic modeling, scenario simulation, contradiction checks, and deeper analytical inference.",
    inputs: ["primary_context", "retrieved_items"],
    outputs: ["reasoned_block", "logic_map"],
    triggers: ["reasoning_required"],
    depends_on: [1, 4],
    feeds_into: [2, 7, 10],
  },
  {
    id: 12,
    name: "Command Center Orchestration",
    purpose: "Central routing and pipeline orchestration.",
    description:
      "Controls flow between boxes, handles errors, manages priorities, and supervises the lifecycle of each pipeline run.",
    inputs: ["pipeline_request"],
    outputs: ["orchestration_decision"],
    triggers: ["on_pipeline_start"],
    depends_on: [3, 7, 10],
    feeds_into: [8],
  }
];
