import fs from "fs";
import path from "path";

export interface MemoryJournalEvent {
  timestamp?: string;
  eventType?: string;
  // حقل عام لأي بيانات إضافية
  [key: string]: any;
}

export interface MemoryJournalOverview {
  totalEvents: number;
  lastEventAt?: string;
  eventTypeCounts: Record<string, number>;
  lastEvents: MemoryJournalEvent[];
}

const JOURNAL_RELATIVE_PATH = "memory/memory-journal.log";

function getJournalPath(): string {
  // نفترض أن الجذر هو process.cwd()
  return path.join(process.cwd(), JOURNAL_RELATIVE_PATH);
}

export async function readMemoryJournalRaw(): Promise<string[]> {
  const journalPath = getJournalPath();

  if (!fs.existsSync(journalPath)) {
    return [];
  }

  const content = await fs.promises.readFile(journalPath, "utf8");
  // نفترض أن كل سطر يمثل حدثاً واحداً
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function readMemoryJournalEvents(): Promise<MemoryJournalEvent[]> {
  const lines = await readMemoryJournalRaw();
  const events: MemoryJournalEvent[] = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      events.push(parsed);
    } catch {
      // لو في سطر معطوب نتجاهله ولا نكسر القارئ
      continue;
    }
  }

  return events;
}

export async function getMemoryJournalOverview(
  maxLastEvents = 5
): Promise<MemoryJournalOverview> {
  const events = await readMemoryJournalEvents();

  const eventTypeCounts: Record<string, number> = {};
  let lastEventAt: string | undefined;

  for (const ev of events) {
    const type = ev.eventType ?? "unknown";
    eventTypeCounts[type] = (eventTypeCounts[type] ?? 0) + 1;

    if (ev.timestamp) {
      if (!lastEventAt || ev.timestamp > lastEventAt) {
        lastEventAt = ev.timestamp;
      }
    }
  }

  const totalEvents = events.length;

  const lastEvents = [...events]
    .sort((a, b) => {
      const ta = a.timestamp ?? "";
      const tb = b.timestamp ?? "";
      return ta < tb ? 1 : ta > tb ? -1 : 0;
    })
    .slice(0, maxLastEvents);

  return {
    totalEvents,
    lastEventAt,
    eventTypeCounts,
    lastEvents,
  };
}
