"use client";

import { BoxFrame } from "../BoxFrame";

type SearchResult = {
  id?: string;
  snippet?: string;
  relevance?: number; // Changed from 'score' to match engine output
  source?: string;
  [key: string]: any;
};

type Box4Props = {
  data?: {
    query?: string;
    results?: SearchResult[];
  } | null;
};

export default function Box4Search({ data }: Box4Props) {
  const query = data?.query ?? "";
  const results = data?.results ?? []; // Use results

  return (
    <BoxFrame title="Box 4 – Semantic Search">
      <p className="text-[11px] text-muted-foreground mb-4">
        نتائج البحث الدلالي داخل الذاكرة أو المستندات المرتبطة بالنص.
      </p>

      {!data && (
        <div className="text-xs text-muted-foreground mt-2">
          لم يتم تشغيل البحث الدلالي بعد.
        </div>
      )}

      {data && (
        <>
          {query && (
            <div className="mt-2 text-[11px] border border-white/10 rounded-xl px-3 py-2 bg-white/5">
              <span className="font-semibold text-slate-200">الاستعلام:</span> <span className="text-slate-300">{query}</span>
            </div>
          )}

          {!results.length && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              لا توجد نتائج مطابقة حاليًا.
            </div>
          )}

          {!!results.length && (
            <div className="mt-2 space-y-2 text-xs">
              {results.map((r, i) => (
                <div
                  key={r.id ?? i}
                  className="border border-white/10 rounded-xl px-3 py-2 flex flex-col gap-1 bg-white/5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-200">
                      {r.source ?? `Result #${i + 1}`}
                    </span>
                    {typeof r.relevance === "number" && (
                      <span className="text-[10px] text-slate-400">
                        Relevance: {r.relevance.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 whitespace-pre-wrap">
                    {r.snippet ?? ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </BoxFrame>
  );
}
