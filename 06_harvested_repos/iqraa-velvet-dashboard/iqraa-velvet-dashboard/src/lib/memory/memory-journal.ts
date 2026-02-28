import fs from "fs";
import path from "path";

const JOURNAL_PATH = path.join(process.cwd(), "memory", "memory-journal.log");

export type MemoryEventScope =
  | "session"
  | "project"
  | "conceptGraph"
  | "sync"
  | "system";

export type MemoryEventActor = "system" | "user" | "pipeline" | "admin";

export type MemoryEventType =
  | "session:update"
  | "project:update"
  | "conceptGraph:update"
  | "memory:sync:start"
  | "memory:sync:complete"
  | "memory:reset"
  | "memory:error";

export interface MemoryChangeSummary {
  /** المفاتيح التي تغيّرت قيمتها */
  changedKeys?: string[];
  /** مفاتيح أضيفت */
  addedKeys?: string[];
  /** مفاتيح حُذفت */
  removedKeys?: string[];
}

export interface MemoryJournalEntry<TBefore = any, TAfter = any> {
  /** وقت الحدث بصيغة ISO */
  timestamp: string;
  /** نوع الحدث الدقيق (session:update, …) */
  eventType: MemoryEventType;
  /** نطاق التغيير (جلسة، مشروع، جراف، مزامنة..) */
  scope: MemoryEventScope;
  /** من الذي قام بالفعل (النظام/المستخدم/الأنابيب..) */
  actor: MemoryEventActor;

  /** تعليق بشري قصير يشرح ما حدث */
  note?: string;

  /** لقطة قبل التغيير (إن لزم) */
  before?: TBefore;
  /** لقطة بعد التغيير (غالبًا مختصرة وليس كل الشيء الضخم) */
  after?: TAfter;

  /** ملخص الفروقات على مستوى المفاتيح */
  diff?: MemoryChangeSummary;

  /** للمفاهيم: ما المفاهيم التي تأثرت؟ */
  changedConcepts?: string[];

  /** ميتاداتا حرة لأي معلومات إضافية (حجم الجراف، عدد العقد، …) */
  meta?: Record<string, unknown>;
}

// Keep the logMemoryEvent function for now, it will be updated later if needed
// For now, it will just use the previous simple interface until explicitly changed.
// The previous implementation used a simpler interface: interface MemoryEvent { timestamp: string; eventType: string; details: any; }
// The logMemoryEvent function will need to be updated to match the new MemoryJournalEntry interface in a subsequent step.
export function logMemoryEvent(eventType: string, details: any) {
  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    details,
  };

  const logEntry = JSON.stringify(event) + "\n";

  // For now, just append to a local file. This could be a proper logging service.
  fs.appendFileSync(JOURNAL_PATH, logEntry, "utf-8");
  console.log(`[Memory Journal] ${eventType}:`, details);
}