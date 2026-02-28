"use client";

import { useEffect, useState } from "react";

interface DashboardOverview {
  persona: {
    id: string;
    name: string;
    title: string;
    memoryMode: string;
  };
  lastRunAt?: string;
  lastInputSnippet?: string;
  lastInsightSnippet?: string;
  runsCount?: number;
}

export default function ControlCenterPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/dashboard/overview");
        if (!res.ok) throw new Error("Failed to load overview");
        const data = await res.json();
        setOverview(data);
      } catch (error) {
        console.error(error);
        setErrorMsg("تعذر تحميل بيانات غرفة التحكم.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-10 pb-20 text-slate-100">
      <header className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Global Control Center</h1>
        <p className="text-sm text-slate-400 mt-1">
          غرفة القيادة المخملية لإقرأ 12 — نظرة سريعة على حالة العقل، الذاكرة،
          وآخر تشغيل للأنابيب.
        </p>
      </header>

      {isLoading && (
        <div className="text-sm text-slate-400">
          جاري تحميل البيانات…
        </div>
      )}

      {errorMsg && (
        <div className="text-sm border border-red-500 rounded-md px-3 py-2 bg-red-900/20 text-red-300">{errorMsg}</div>
      )}

      {overview && (
        <>
          {/* First Row: Mind State */}
          <section className="grid gap-4 md:grid-cols-3">
            <div className="border border-white/10 rounded-2xl p-4 flex flex-col justify-between bg-white/5">
              <div>
                <h2 className="text-sm font-semibold mb-1">
                  Persona النشطة الآن
                </h2>
                <p className="text-base font-semibold">
                  {overview.persona.name}
                </p>
                <p className="text-xs text-slate-400">
                  {overview.persona.title}
                </p>
              </div>
              <div className="mt-3 text-[11px] text-slate-500">
                ID: {overview.persona.id}
              </div>
            </div>

            <div className="border border-white/10 rounded-2xl p-4 flex flex-col justify-between bg-white/5">
              <div>
                <h2 className="text-sm font-semibold mb-1">وضع الذاكرة</h2>
                <p className="text-base font-semibold">
                  {overview.persona.memoryMode}
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                يتم ضبط نمط الذاكرة حاليًا من خلال إعدادات الـ persona.
              </p>
            </div>

            <div className="border border-white/10 rounded-2xl p-4 flex flex-col justify-between bg-white/5">
              <div>
                <h2 className="text-sm font-semibold mb-1">
                  عدد تشغيلات الأنابيب (تقريبي)
                </h2>
                <p className="text-3xl font-semibold">
                  {overview.runsCount ?? "—"}
                </p>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">
                يمكن زيادة دقة هذا العدّاد لاحقًا بربطه بسجل المفكرة الذكية بالكامل.
              </p>
            </div>
          </section>

          {/* Second Row: Last Run */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="border border-white/10 rounded-2xl p-4 flex flex-col bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">آخر إدخال للنظام</h2>
                {overview.lastRunAt && (
                  <span className="text-[11px] text-slate-500">
                    آخر تشغيل: {new Date(overview.lastRunAt).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap text-slate-300">
                {overview.lastInputSnippet ?? "لا يوجد إدخال مسجّل بعد."}
              </div>
            </div>

            <div className="border border-white/10 rounded-2xl p-4 flex flex-col bg-white/5">
              <h2 className="text-sm font-semibold mb-2">
                آخر Insight مُنتج
              </h2>
              <div className="text-sm whitespace-pre-wrap text-slate-300">
                {overview.lastInsightSnippet ?? "لا يوجد Insight مسجّل بعد."}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
