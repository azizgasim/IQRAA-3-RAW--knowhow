"use client";

import { motion } from "framer-motion";

export default function NodePopover({ data }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="absolute z-50 top-[-70px] left-1/2 -translate-x-1/2 px-4 py-2 
                 bg-black/70 text-white text-xs rounded-xl border border-white/10 backdrop-blur-xl"
    >
      <div className="font-bold">Box {data.id}</div>
      <div>{data.label}</div>
      <div className="text-slate-300 text-[10px]">
        Concepts: {data.concepts}
      </div>
      <div className="text-slate-300 text-[10px]">
        Complexity: {data.complexity}
      </div>
    </motion.div>
  );
}
