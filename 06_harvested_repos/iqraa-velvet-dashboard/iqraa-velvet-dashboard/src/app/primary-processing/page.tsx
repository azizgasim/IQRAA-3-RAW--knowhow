"use client";

import { useState } from "react";
import Box2Expansion from "@/components/boxes/box-2-expansion";
import Box3Analytics from "@/components/boxes/box-3-analytics";
import Box4Search from "@/components/boxes/box-4-search";
import Box7Planner from "@/components/boxes/box-7-planner";
import Box10Insight from "@/components/boxes/box-10-insight";
import Box11Reasoning from "@/components/boxes/box-11-reasoning";
import PersonaBadge from "@/components/system/PersonaBadge";

type PipelineResult = {
  persona?: any;
  expansion?: any;
  analytics?: any;
  semanticSearch?: any;
  planner?: any;
  reasoning?: any;
  insight?: any;
};

export default function PrimaryProcessingPage() {
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!input.trim()) return;

    setIsRunning(true);
    setError(null);

    try {
      const res = await fetch("/api/run-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) {
        throw new Error("Pipeline request failed");
      }

      const data = await res.json();

      setResult({
        persona: data.persona,
        expansion: data.expansion,
        analytics: data.analytics,
        semanticSearch: data.semanticSearch,
        planner: data.planner,
        reasoning: data.reasoning,
        insight: data.insight,
      });
    } catch (e: any) {
      console.error(e);
      setError("حدث خطأ أثناء تشغيل خط الأنابيب.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* رأس الصفحة */}
      <header className="flex items-start justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Primary Processing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            نقطة الدخول الرئيسة لنصوص مشروع &quot;إقرأ 12&quot;. من هنا ينطلق
            خط الأنابيب القيمي–المعرفي ويفعِّل صناديق الذكاء المرتبطة
            بالذاكرة والشخصيات التحليلية.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <PersonaBadge />
          <button
            onClick={() =>
              (window.location.href = "/intelligence/visualization")
            }
            className="text-xs underline underline-offset-4"
          >
            View Intelligence Visualization →
          </button>
        </div>
      </header>

      {/* الإدخال ولوحة التحكم السريعة */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        <div className="border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">نص الإدخال</h2>
            <span className="text-[11px] text-muted-foreground">
              سيتم حفظ آخر إدخال في الذاكرة تلقائيًا بعد التشغيل.
            </span>
          </div>
          <textarea
            className="min-h-[200px] w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="ضع هنا النص الذي تريد تحليله (خطاب ملكي، فقرة من وثيقة سياسات، مسودة ورقة قيمية، إلخ)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-muted-foreground">
              طول النص: {input.length} حرف
            </span>
            <button
              onClick={handleRun}
              disabled={isRunning || !input.trim()}
              className="px-4 py-1.5 text-xs rounded-full border bg-primary text-primary-foreground disabled:opacity-60"
            >
              {isRunning ? "جاري التشغيل…" : "تشغيل خط الأنابيب"}
            </button>
          </div>
          {error && (
            <div className="text-xs text-red-500 mt-1">
              {error}
            </div>
          )}
        </div>

        <div className="border rounded-2xl p-4 flex flex-col gap-2 text-xs">
          <h2 className="text-sm font-semibold mb-1">
            لمحة سريعة عن آخر تشغيل
          </h2>
          <p className="text-muted-foreground">
            بعد كل تشغيل، يتم تحديث الذاكرة (Session / Project / Concept Graph)
            وتسجيل الحدث في المفكرة الذكية. هذه اللوحة تعطي ملخصًا سريعًا عن
            حالة الصناديق.
          </p>
          <div className="mt-2 space-y-1">
            <div>
              <span className="font-medium">Persona:</span>{" "}
              {result?.persona?.name ?? "—"}
            </div>
            <div>
              <span className="font-medium">Expansion:</span>{" "}
              {result?.expansion ? "جاهز" : "—"}
            </div>
            <div>
              <span className="font-medium">Analytics:</span>{" "}
              {result?.analytics ? "جاهز" : "—"}
            </div>
            <div>
              <span className="font-medium">Planner:</span>{" "}
              {result?.planner ? "جاهز" : "—"}
            </div>
            <div>
              <span className="font-medium">Reasoning:</span>{" "}
              {result?.reasoning ? "جاهز" : "—"}
            </div>
            <div>
              <span className="font-medium">Insight:</span>{" "}
              {result?.insight ? "جاهز" : "—"}
            </div>
          </div>
        </div>
      </section>

      {/* شبكة صناديق الذكاء */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Box2Expansion data={result?.expansion} />
        <Box3Analytics data={result?.analytics} />
        <Box4Search data={result?.semanticSearch} />
        <Box7Planner data={result?.planner} />
        <Box11Reasoning data={result?.reasoning} />
        <Box10Insight data={result?.insight} />
      </section>
    </div>
  );
}