import { NextResponse } from "next/server";
import { getPersonaById } from "@/lib/personas/persona-registry";
import type { PersonaId } from "@/lib/personas/persona-types";
import { MemoryEngine } from "@/lib/memory/memory-engine";
import { setCurrentPersonaIdInSession } from "@/lib/memory/session-utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const personaId = body.personaId as PersonaId | undefined;

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId is required" },
        { status: 400 }
      );
    }

    const persona = getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json(
        { error: "Unknown personaId" },
        { status: 400 }
      );
    }

    // 1) Load current session memory
    const sessionMemory = MemoryEngine.loadSessionMemory();

    // 2) Update the session
    const updatedSession = setCurrentPersonaIdInSession(sessionMemory, persona.id);

    // 3) Save memory + sync + journaling
    MemoryEngine.saveSessionMemory(updatedSession);
    MemoryEngine.syncAll();

    return NextResponse.json({
      ok: true,
      personaId: persona.id,
    });
  } catch (error) {
    console.error("[persona/select]", error);
    return NextResponse.json(
      { error: "Internal error while selecting persona" },
      { status: 500 }
    );
  }
}
