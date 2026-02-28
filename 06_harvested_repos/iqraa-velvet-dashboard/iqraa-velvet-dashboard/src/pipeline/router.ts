import { BoxEngine } from "@/components/boxes/box-engine";

export function detectPipeline(intent: string) {
  const lowered = intent.toLowerCase();

  if (lowered.includes("analy")) return [1, 2, 3, 10];
  if (lowered.includes("search")) return [1, 4, 2, 3, 10];
  if (lowered.includes("plan") || lowered.includes("project"))
    return [1, 7, 5, 10];
  if (lowered.includes("reason") || lowered.includes("logic"))
    return [1, 11, 2, 3, 10];
  if (lowered.includes("document") || lowered.includes("file"))
    return [9, 2, 3, 10];
  if (lowered.includes("code") || lowered.includes("run"))
    return [1, 8, 10];

  return [1, 2, 3, 10];
}
