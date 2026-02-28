"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AnalyticsPage() {
  return (
    <DashboardShell title="Analytics & Telemetry">
      <p className="text-slate-300 mb-2">
        High-level observability and metrics over IQRAA 12 activity.
      </p>
      <p className="text-slate-400 text-sm">
        Future panels here will track usage, model behavior, knowledge flows,
        datasets, and strategic KPIs aligned with the national knowledge
        mission.
      </p>
    </DashboardShell>
  );
}