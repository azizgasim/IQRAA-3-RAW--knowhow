"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import UltraGraph from "@/components/visual/UltraGraph";
import OutputPanel from "@/components/graph/OutputPanel";
import { runPipeline } from "@/pipeline/orchestrator";

export default function VisualizationPage() {
  const [input, setInput] = useState("");
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const execute = async () => {
    const result = await runPipeline(input);
    setPipelineData(result);
  };

  return (
    <DashboardShell title="Intelligence Visualization Lab">
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-lg">
        <textarea
          className="w-full h-32 rounded-xl p-4 bg-white/10 border border-white/20
                     text-white placeholder-slate-400 focus:ring-2 focus:ring-white/20"
          placeholder="Enter text to visualize the intelligence pipeline..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={execute}
          className="mt-4 px-6 py-3 bg-white/20 border border-white/30 rounded-xl hover:bg-white/30 transition"
        >
          Run Visualization
        </button>
      </div>

      {pipelineData && (
        <div>
          <UltraGraph
            pipeline={pipelineData.pipeline}
            steps={pipelineData.steps}
            onNodeSelect={(id) => setSelectedNode(id)}
          />

          <OutputPanel
            box={selectedNode}
            data={
              selectedNode
                ? pipelineData.steps.find((s: any) =>
                    s?.metadata?.id === selectedNode
                  ) || null
                : null
            }
          />
        </div>
      )}
    </DashboardShell>
  );
}
