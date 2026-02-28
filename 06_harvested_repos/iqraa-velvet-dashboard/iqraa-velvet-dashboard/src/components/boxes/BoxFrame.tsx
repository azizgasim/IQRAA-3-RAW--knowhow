"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { RoyalPageMotion } from "@/components/motion/motion-engine";

export function BoxFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={RoyalPageMotion}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)] backdrop-blur-xl relative overflow-hidden"
    >
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent blur-3xl opacity-10 pointer-events-none" />

      <div className="relative">{children}</div>
    </motion.div>
  );
}
