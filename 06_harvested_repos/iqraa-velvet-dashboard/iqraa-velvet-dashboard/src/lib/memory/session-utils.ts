import type { PersonaId } from "../personas/persona-types";
import { SessionMemory } from "./memory-types";

export function getCurrentPersonaIdFromSession(
  session: SessionMemory,
  fallback: PersonaId
): PersonaId {
  return (session.currentPersonaId as PersonaId) ?? fallback;
}

export function setCurrentPersonaIdInSession(
  session: SessionMemory,
  personaId: PersonaId
): SessionMemory {
  return {
    ...session,
    currentPersonaId: personaId,
  };
}
