"use client";

export default function OutputPanel({ box, data }) {
  if (!box) return (
    <div className="p-6 text-slate-400 text-center">
      Select a box node to view output.
    </div>
  );

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mt-6">
      <h2 className="text-xl font-bold mb-4">
        Box {box} — Intelligent Output
      </h2>
      <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify(data, null, 2)}
</pre>
    </div>
  );
}
