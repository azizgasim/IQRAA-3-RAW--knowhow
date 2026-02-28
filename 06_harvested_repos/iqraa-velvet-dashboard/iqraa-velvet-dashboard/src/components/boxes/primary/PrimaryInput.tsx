"use client";

import { useState } from "react";
import { BoxEngine } from "../box-engine";
import { BoxFrame } from "../BoxFrame";

export default function PrimaryInputBox() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);

  const run = () => {
    const output = BoxEngine.runBox(1, { text: input });
    setResult(output);
  };

  return (
    <BoxFrame title="Primary Processing">
      <textarea
        className="w-full h-40 rounded-xl p-4 bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-white/20"
        placeholder="Enter your text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={run}
        className="mt-4 px-6 py-3 bg-white/20 border border-white/30 rounded-xl hover:bg-white/30 transition"
      >
        Run Box 1
      </button>

      {result && (
        <pre className="mt-4 p-4 bg-black/30 rounded-xl text-xs border border-white/10">
{JSON.stringify(result, null, 2)}
</pre>
      )}
    </BoxFrame>
  );
}
