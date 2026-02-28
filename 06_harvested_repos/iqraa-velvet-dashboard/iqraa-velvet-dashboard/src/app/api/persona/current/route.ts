import { NextResponse } from "next/server";
import { PERSONAS, DEFAULT_PERSONA_ID, getPersonaById } from "@/lib/personas/persona-registry";
import type { PersonaId } from "@/lib/personas/persona-types";
import { MemoryEngine } from "@/lib/memory/memory-engine";
import { getCurrentPersonaIdFromSession } from "@/lib/memory/session-utils";

export async function GET() {
  try {
    // Load current session memory
    const sessionMemory = MemoryEngine.loadSessionMemory();

    // Determine the current persona ID from session, with a fallback
    const personaId = getCurrentPersonaIdFromSession(sessionMemory, DEFAULT_PERSONA_ID);

    // Retrieve the full persona configuration
    const persona = getPersonaById(personaId) ?? getPersonaById(DEFAULT_PERSONA_ID)!;

    return NextResponse.json({
      personaId: persona.id,
      persona,
    });
  } catch (error) {
    console.error("[persona/current]", error);
    return NextResponse.json(
      { error: "Internal error while reading current persona" },
      { status: 500 }
    );
  }
}
