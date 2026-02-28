"use client";

import { useState, useEffect } from "react";

export default function FlowReplay({ pipeline, onStep }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!pipeline || pipeline.length === 0) return;

    setIndex(0);

    let i = 0;
    const interval = setInterval(() => {
      onStep(pipeline[i]);
      setIndex(i);
      i++;

      if (i >= pipeline.length) {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [pipeline]);

  return (
    <div className="text-xs text-slate-300 mt-2">
      Flow Replay: Step {index + 1} / {pipeline.length}
    </div>
  );
}
