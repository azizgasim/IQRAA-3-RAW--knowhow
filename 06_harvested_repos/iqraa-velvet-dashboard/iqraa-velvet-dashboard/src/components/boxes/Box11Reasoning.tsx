"use client";

import { BoxFrame } from "../BoxFrame";

type Box11Props = {
  data?: {
    reasoningText?: string;
    assumptions?: string[];
    implications?: string[];
    reasoningChain?: any[]; // Added reasoningChain to match engine output
    [key: string]: any;
  } | null;
};

export default function Box11Reasoning({ data }: Box11Props) {
  const reasoningText = data?.reasoningText ?? data?.text ?? "";
  const assumptions = data?.assumptions ?? [];
  const implications = data?.implications ?? [];
  const reasoningChain = data?.reasoningChain ?? [];

  return (
    <BoxFrame title="Box 11 – Reasoning Engine">
      <p className="text-[11px] text-muted-foreground mb-4">
        طبقة التعليل والتحليل الحجّاجي وربط النص بالقيم والخيارات
        الواقعية.
      </p>

      {!data && (
        <div className="text-xs text-muted-foreground mt-2">
          لم يتم تشغيل محرك التعليل بعد.
        </div>
      )}

      {reasoningText && (
        <div className="mt-2 text-xs border border-white/10 rounded-xl px-3 py-2 bg-white/5 whitespace-pre-wrap text-slate-300">
          <div className="font-medium mb-1 text-slate-200">الخلاصة التعليلية:</div>
          {reasoningText}
        </div>
      )}

      {!!reasoningChain.length && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold mb-1 text-slate-200">خطوات التعليل:</div>
          <ul className="list-decimal list-inside text-[11px] text-slate-300 space-y-1">
            {reasoningChain.map((step, i) => (
              <li key={i}>
                <span className="font-medium">{step.type}:</span> {step.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!!assumptions.length && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold mb-1 text-slate-200">الافتراضات:</div>
          <ul className="list-disc list-inside text-[11px] text-slate-300">
            {assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {!!implications.length && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold mb-1 text-slate-200">
            الآثار/النتائج المحتملة:
          </div>
          <ul className="list-disc list-inside text-[11px] text-slate-300">
            {implications.map((imp, i) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>
        </div>
      )}
    </BoxFrame>
  );
}
