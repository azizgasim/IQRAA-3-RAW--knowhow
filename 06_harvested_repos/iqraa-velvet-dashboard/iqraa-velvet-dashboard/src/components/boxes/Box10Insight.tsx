"use client";

import { BoxFrame } from "../BoxFrame";

type Box10Props = {
  data?: {
    title?: string;
    summary?: string;
    recommendations?: string[];
    tags?: string[];
    [key: string]: any;
  } | null;
};

export default function Box10Insight({ data }: Box10Props) {
  const title = data?.title ?? "Insight مركّب";
  const summary = data?.summary ?? data?.text ?? "";
  const recommendations = data?.recommendations ?? [];
  const tags = data?.tags ?? [];

  return (
    <BoxFrame title="Box 10 – Insight Synthesis">
      <p className="text-[11px] text-muted-foreground mb-4">
        دمج التوسّع الدلالي والتحليل المعرفي والتعليل في مخرجات قابلة
        للاستخدام في القرار والسياسة والخطاب.
      </p>

      {!data && (
        <div className="text-xs text-muted-foreground mt-2">
          لم يتم توليد Insight بعد.
        </div>
      )}

      {summary && (
        <div className="mt-2 text-xs border border-white/10 rounded-xl px-3 py-2 bg-white/5">
          <div className="font-semibold mb-1 text-slate-200">{title}</div>
          <div className="whitespace-pre-wrap text-slate-300">{summary}</div>
        </div>
      )}

      {!!recommendations.length && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold mb-1 text-slate-200">
            توصيات/خطوات مقترحة:
          </div>
          <ul className="list-disc list-inside text-[11px] text-slate-300">
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {!!tags.length && (
        <div className="mt-4 flex flex-wrap gap-1 text-[11px]">
          {tags.map((t, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </BoxFrame>
  );
}
