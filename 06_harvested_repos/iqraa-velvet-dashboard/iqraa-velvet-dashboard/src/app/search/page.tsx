"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AdvancedSearchPage() {
  return (
    <DashboardShell title="Advanced Search">
      <p className="text-slate-300 mb-2">
        Unified search surface across documents, agents, and knowledge spaces.
      </p>
      <p className="text-slate-400 text-sm">
        This layer will later integrate semantic, symbolic, and structured
        search capabilities over the IQRAA 12 corpus and connected systems.
      </p>
    </DashboardShell>
  );
}