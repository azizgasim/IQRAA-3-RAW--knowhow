"use client";

import { motion } from "framer-motion";
import { glowPulse } from "@/components/motion/variants";
import { Settings, Sun, User } from "lucide-react";
import PersonaBadge from "@/components/system/PersonaBadge";

export function AppHeader() {
  return (
    <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between">
      {/* Left Title Section */}
      <div className="px-6 flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-wide uppercase text-slate-400">
          Iqraa 12
        </span>
        <span className="text-lg font-semibold text-white">
          Velvet Intelligence Dashboard
        </span>
      </div>

      {/* Right Utility Zone */}
      <div className="flex items-center gap-4 pr-6">
        {/* Controls from HeaderControls */}
        <motion.button
          type="button"
          className="p-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5 text-slate-100" />
        </motion.button>

        <motion.button
          type="button"
          className="p-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sun className="w-5 h-5 text-slate-100" />
        </motion.button>

        <motion.div
          className="p-2 rounded-full bg-white/10 border border-white/20 w-9 h-9 flex items-center justify-center backdrop-blur-md"
          variants={glowPulse}
          initial="initial"
          animate="animate"
        >
          <User className="w-5 h-5 text-slate-100" />
        </motion.div>

        {/* PersonaBadge Integration */}
        <PersonaBadge />
      </div>
    </header>
  );
}
