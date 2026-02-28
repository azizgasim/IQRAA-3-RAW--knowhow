"use client";

import { useState, useEffect } from "react";
import { PERSONAS, DEFAULT_PERSONA_ID } from "@/lib/personas/persona-registry";
import type { PersonaId } from "@/lib/personas/persona-types";
import { MemoryEngine } from "@/lib/memory/memory-engine";
import { getCurrentPersonaIdFromSession, setCurrentPersonaIdInSession } from "@/lib/memory/session-utils";

function PersonasLabPage() {
  const [currentPersonaId, setCurrentPersonaId] = useState<PersonaId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessionMemory = MemoryEngine.loadSessionMemory();
    setCurrentPersonaId(getCurrentPersonaIdFromSession(sessionMemory, DEFAULT_PERSONA_ID));
  }, []);

  const handleSelectPersona = async (personaId: PersonaId) => {
    setIsSaving(true);
    setMessage(null);

    try {
      const sessionMemory = MemoryEngine.loadSessionMemory();
      const updatedSession = setCurrentPersonaIdInSession(sessionMemory, personaId);
      MemoryEngine.saveSessionMemory(updatedSession);
      MemoryEngine.syncAll(); // Sync to local storage and mock cloud

      setCurrentPersonaId(personaId);
      setMessage("تم تحديث الـ persona النشطة بنجاح ✨");
    } catch (error) {
      console.error(error);
      setMessage("حدث خطأ أثناء تحديث الشخصية. جرّب لاحقًا.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-10 pb-20 text-slate-100">
      <header className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Personas Lab</h1>
        <p className="text-sm text-slate-400 mt-1">
          اختر نمط التحليل الذي تريد أن تعمل به لوحة إقرأ 12. يتم حفظ الاختيار في
          الذاكرة ويؤثّر على طريقة عمل صناديق الذكاء.
        </p>
      </header>

      {message && (
        <div className="text-sm border border-white/10 rounded-md px-3 py-2 bg-white/5">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PERSONAS.map((persona) => {
          const isActive = currentPersonaId === persona.id;
          return (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona.id)}
              disabled={isSaving}
              className={`text-left border rounded-2xl p-4 transition 
                ${isActive
                  ? "border-amber-500 shadow-lg bg-amber-500/10 text-amber-100"
                  : "border-white/10 hover:border-white/30 hover:shadow-sm bg-white/5"}
                ${isSaving && isActive ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-base font-semibold uppercase tracking-wide">
                    {persona.name}
                  </div>
                  <div className="text-xs text-slate-300">
                    {persona.title}
                  </div>
                </div>
                {isActive && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-600/30 border border-amber-500 text-amber-100">
                    Active
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-200 mb-3">{persona.description}</p>

              <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                  Tone: {persona.tone}
                </span>
                <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                  Expansion: {persona.semanticExpansionDepth}
                </span>
                <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                  Memory: {persona.memoryMode}
                </span>
                <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                  Length: {persona.preferredLength}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PersonasLabPage;
