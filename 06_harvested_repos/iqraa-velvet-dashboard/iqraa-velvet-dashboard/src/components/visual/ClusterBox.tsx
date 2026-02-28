"use client";

import { motion } from "framer-motion";

export default function ClusterBox({ label, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      className="p-4 border border-white/10 rounded-2xl bg-white/5
                 shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-xl"
    >
      <div className="text-xs text-slate-300 mb-2">{label}</div>
      <div className="flex items-center gap-6">{children}</div>
    </motion.div>
  );
}
