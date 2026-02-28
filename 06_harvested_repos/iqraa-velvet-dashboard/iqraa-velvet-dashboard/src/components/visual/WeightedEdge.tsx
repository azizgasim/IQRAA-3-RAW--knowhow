"use client";

import { motion } from "framer-motion";

export default function WeightedEdge({ weight }) {
  const thickness = 2 + weight * 8;

  return (
    <motion.div
      className="rounded-full bg-gradient-to-r from-white/30 to-white/5"
      style={{ height: thickness, width: 80 }}
      animate={{
        opacity: [0.5, 1, 0.7],
        boxShadow: [
          "0 0 4px rgba(255,255,255,0.1)",
          "0 0 8px rgba(255,255,255,0.2)",
          "0 0 4px rgba(255,255,255,0.1)"
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}
