"use client";

import { motion } from "framer-motion";
import { VelvetGlow } from "@/components/motion/motion-engine";

export function AuraGlowLayer() {
  return (
    <motion.div
      variants={VelvetGlow}
      initial="initial"
      animate="animate"
      className="absolute inset-0 rounded-2xl bg-white/10 blur-3xl pointer-events-none"
    />
  );
}
