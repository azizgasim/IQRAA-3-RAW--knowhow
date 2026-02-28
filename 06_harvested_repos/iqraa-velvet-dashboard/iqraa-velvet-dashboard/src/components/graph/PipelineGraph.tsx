"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function PipelineGraph({ steps, pipeline, onSelect }) {
  return (
    <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl w-full overflow-x-auto">
      <div className="flex items-center gap-10">

        {pipeline.map((id, idx) => (
          <div key={idx} className="flex items-center gap-10">
            <motion.div
              onClick={() => onSelect(id)}
              className="cursor-pointer flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(255,255,255,0.1)",
                    "0 0 25px rgba(255,255,255,0.25)",
                    "0 0 15px rgba(255,255,255,0.1)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Box {id}
              </motion.div>
            </motion.div>

            {idx < pipeline.length - 1 && (
              <motion.div
                className="h-1 w-24 bg-gradient-to-r from-white/20 to-white/5 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        ))}

      </div>
    </div>
  );
}
