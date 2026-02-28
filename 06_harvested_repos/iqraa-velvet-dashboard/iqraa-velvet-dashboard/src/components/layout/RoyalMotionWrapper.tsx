"use client";

import { motion } from "framer-motion";
import { RoyalPageMotion } from "@/components/motion/motion-engine";

export function RoyalMotionWrapper({ children }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={RoyalPageMotion}
      className="relative"
    >
      {children}
    </motion.div>
  );
}
