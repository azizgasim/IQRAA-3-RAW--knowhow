"use client";

export default function InsightBadge({ value }) {
  return (
    <div
      className="absolute -top-3 -right-3 text-[10px] 
                 bg-white/20 text-white px-2 py-1 rounded-full shadow 
                 border border-white/10 backdrop-blur-lg"
    >
      {value}
    </div>
  );
}
