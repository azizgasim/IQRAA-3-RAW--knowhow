"use client";

import { BoxFrame } from "../BoxFrame";

type Box2Props = {
  data?: {
    concepts?: string[];
    themes?: string[];
    expandedSummary?: string; // Corrected from 'summary'
    [key: string]: any;
  } | null;
};

export default function Box2Expansion({ data }: Box2Props) {
  const concepts = data?.concepts ?? [];
  const themes = data?.themes ?? [];
  const summary = data?.expandedSummary ?? data?.text ?? ""; // Use expandedSummary

  return (
    <BoxFrame title="Box 2 – Semantic Expansion">
      <p className="text-[11px] text-muted-foreground mb-4">
        توسّع دلالي في المفاهيم والثيمات المستخرجة من النص.
      </p>

      {(!data || (!concepts.length && !themes.length && !summary)) && (
        <div className="text-xs text-muted-foreground mt-2">
          لم يتم تشغيل الصندوق بعد. شغّل خط الأنابيب من أعلى الصفحة.
        </div>
      )}

      {summary && (
        <div className="mt-2 text-xs border border-white/10 rounded-xl px-3 py-2 bg-white/5">
          <div className="font-medium mb-1">ملخص التوسّع:</div>
          <div className="whitespace-pre-wrap text-slate-300">{summary}</div>
        </div>
      )}

      {!!concepts.length && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold mb-1">
            المفاهيم الرئيسة:
          </div>
          <div className="flex flex-wrap gap-1 text-[11px]">
            {concepts.map((c, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-200"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {!!themes.length && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold mb-1">
            الثيمات/المحاور:
          </div>
          <div className="flex flex-wrap gap-1 text-[11px]">
            {themes.map((t: any, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full border border-dashed border-white/20 bg-white/10 text-slate-200"
              >
                {t.theme}: {t.keywords.join(", ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </BoxFrame>
  );
}