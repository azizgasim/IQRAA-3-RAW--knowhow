"use client";

import { BoxFrame } from "../BoxFrame";

type PlanStep = {
  id?: string;
  title: string;
  description?: string;
  phase?: string;
  priority?: "low" | "medium" | "high";
};

type Box7Props = {
  data?: {
    steps?: PlanStep[];
    summary?: string;
  } | null;
};

export default function Box7Planner({ data }: Box7Props) {
  const steps = data?.steps ?? [];
  const summary = data?.summary ?? "";

  return (
    <BoxFrame title="Box 7 – Task Planner">
      <p className="text-[11px] text-muted-foreground mb-4">
        تحويل النص إلى خريطة مهام وخطوات عمل تنفيذية.
      </p>

      {!data && (
        <div className="text-xs text-muted-foreground mt-2">
          لم يتم توليد خطة المهام بعد.
        </div>
      )}

      {summary && (
        <div className="mt-2 text-[11px] border border-white/10 rounded-xl px-3 py-2 bg-white/5">
          <div className="font-medium mb-1 text-slate-200">ملخص الخطة:</div>
          <div className="whitespace-pre-wrap text-slate-300">{summary}</div>
        </div>
      )}

      {!!steps.length && (
        <div className="mt-2 space-y-2 text-xs">
          {steps.map((step, i) => (
            <div
              key={step.id ?? i}
              className="border border-white/10 rounded-xl px-3 py-2 flex flex-col gap-1 bg-white/5"
            >
              <div className="flex justify-between items-center">
                <div className="font-semibold text-slate-200">{step.title}</div>
                {step.priority && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border
                    ${step.priority === "high" ? "bg-red-900/30 border-red-500 text-red-100" :
                      step.priority === "medium" ? "bg-amber-900/30 border-amber-500 text-amber-100" :
                      "bg-green-900/30 border-green-500 text-green-100"}`}
                  >
                    {step.priority.toUpperCase()}
                  </span>
                )}
              </div>
              {step.phase && (
                <div className="text-[10px] text-slate-400">
                  المرحلة: {step.phase}
                </div>
              )}
              {step.description && (
                <div className="text-[11px] text-slate-300 whitespace-pre-wrap">
                  {step.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </BoxFrame>
  );
}
