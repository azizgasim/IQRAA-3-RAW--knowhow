"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/components/motion/variants";

interface DashboardShellProps {
  title: string;
  children: ReactNode;
}

export function DashboardShell({ title, children }: DashboardShellProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className="p-10 pb-20 text-slate-100"
    >
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-slate-400">
          IQRAA 12 • Velvet Command Surface
        </p>
      </header>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-[0_0_25px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {children}
      </div>
    </motion.div>
  );
}