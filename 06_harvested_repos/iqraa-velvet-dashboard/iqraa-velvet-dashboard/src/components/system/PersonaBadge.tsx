"use client";

import { useEffect, useState } from "react";
import type { PersonaConfig } from "@/lib/personas/persona-types";

type PersonaResponse = {
  personaId: string;
  persona: PersonaConfig;
};

function PersonaBadge() {
  const [persona, setPersona] = useState<PersonaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        const res = await fetch("/api/persona/current");
        if (!res.ok) throw new Error("Failed to load persona");
        const data: PersonaResponse = await res.json();
        setPersona(data.persona);
      } catch (error) {
        console.error("[PersonaBadge]", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersona();
  }, []);

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground animate-pulse">
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        <span>Loading persona…</span>
      </div>
    );
  }

  if (hasError || !persona) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        <span>Persona: default</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-background">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <div className="flex flex-col leading-tight">
        <span className="font-medium">
          {persona.name}
        </span>
        <span className="text-[10px] text-muted-foreground">
          يعمل الآن بنمط: {persona.title}
        </span>
      </div>
    </div>
  );
}

export default PersonaBadge;
