"use client";

import { BoxFrame } from "../BoxFrame";

type AnalyticsData = {
  densityScore?: number; // Renamed to match engine output
  coherenceScore?: number; // Renamed to match engine output
  complexityScore?: number; // Renamed to match engine output
  flags?: string[];
  summary?: string; // Using summary from engine output
  [key: string]: any;
};

type Box3Props = {
  data?: AnalyticsData | null;
};

export default function Box3Analytics({ data }: Box3Props) {
  const density = data?.densityScore ?? null; // Use densityScore
  const coherence = data?.coherenceScore ?? null; // Use coherenceScore
  const complexity = data?.complexityScore ?? null; // Use complexityScore
  const flags = data?.flags ?? [];
  const summary = data?.summary ?? "";

  return (
    <BoxFrame title="Box 3 – Cognitive Analytics">
      <p className="text-[11px] text-muted-foreground mb-4">
        تحليل كثافة النص وتماسكه وتعقيده، مع علامات تحذيرية إن وجدت.
      </p>

      {!data && (
        <div className="text-xs text-muted-foreground mt-2">
          لم يتم تشغيل الصندوق بعد.
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
            <MetricCard label="Density" value={density} />
            <MetricCard label="Coherence" value={coherence} />
            <MetricCard label="Complexity" value={complexity} />
          </div>

          {!!flags.length && (
            <div className="mt-4">
              <div className="text-[11px] font-semibold mb-1 text-amber-300">
                ملاحظات/تنبيهات:
              </div>
              <ul className="list-disc list-inside text-[11px] text-red-300">
                {flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {summary && (
            <div className="mt-4 text-[11px] text-slate-300 border border-white/10 rounded-xl px-3 py-2 bg-white/5">
              <div className="font-medium mb-1">ملخص التحليل:</div>
              <div className="whitespace-pre-wrap">{summary}</div>
            </div>
          )}
        </>
      )}
    </BoxFrame>
  );
}

function MetricCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border border-white/10 rounded-xl px-2 py-2 flex flex-col items-center bg-white/5">
      <div className="text-[11px] text-slate-400 mb-1">{label}</div>
      <div className="text-base font-semibold text-slate-200">
        {value === null ? "—" : Math.round(value * 100)}
      </div>
    </div>
  );
}