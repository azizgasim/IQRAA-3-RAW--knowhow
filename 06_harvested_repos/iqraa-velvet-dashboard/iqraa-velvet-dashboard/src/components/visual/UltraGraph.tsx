"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NodePopover from "./NodePopover";
import WeightedEdge from "./WeightedEdge";
import InsightBadge from "./InsightBadge";
import FlowReplay from "./FlowReplay";
import ClusterBox from "./ClusterBox";

export default function UltraGraph({
  pipeline,
  steps,
  onNodeSelect
}) {
  const [hoverNode, setHoverNode] = useState(null);
  const [activeNode, setActiveNode] = useState(null);

  function getNodeData(id) {
    const step = steps.find((s) => s?.metadata?.id === id) || {};
    return {
      id,
      label: step?.metadata?.name || "Unknown",
      concepts: step?.concepts?.length || 0,
      complexity: step?.complexityScore || 0,
    };
  }

  return (
    <div className="relative p-6 overflow-x-auto rounded-2xl
                    bg-white/5 border border-white/10">

      <FlowReplay
        pipeline={pipeline}
        onStep={(id) => setActiveNode(id)}
      />

      <div className="flex items-center gap-10 mt-4">
        {pipeline.map((id, index) => {
          const nodeData = getNodeData(id);
          const isActive = activeNode === id;
          const weight = Math.random();

          return (
            <div
              key={id}
              className="relative flex flex-col items-center"
            >
              <motion.div
                onMouseEnter={() => setHoverNode(nodeData)}
                onMouseLeave={() => setHoverNode(null)}
                onClick={() => onNodeSelect(id)}
                className="w-28 h-28 rounded-2xl bg-white/10 border border-white/20
                           flex items-center justify-center text-sm font-bold cursor-pointer
                           shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                animate={{
                  scale: isActive ? 1.15 : 1.0,
                  boxShadow: isActive
                    ? "0 0 25px rgba(255,255,255,0.3)"
                    : "0 0 10px rgba(255,255,255,0.1)"
                }}
                transition={{ duration: 0.4 }}
              >
                Box {id}
                <InsightBadge value={nodeData.concepts} />
              </motion.div>

              {hoverNode?.id === id && (
                <NodePopover data={nodeData} />
              )}

              {index < pipeline.length - 1 && (
                <WeightedEdge weight={weight} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
