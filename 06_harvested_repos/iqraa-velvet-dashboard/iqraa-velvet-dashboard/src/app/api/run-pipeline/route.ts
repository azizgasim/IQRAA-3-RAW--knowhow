import { NextResponse } from "next/server";
import { runPipeline } from "@/pipeline/orchestrator"; // Corrected import path
import type { PersonaId } from "@/lib/personas/persona-types";

type RunPipelineRequest = {
  input: string;
  personaId?: PersonaId;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RunPipelineRequest;

    if (!body.input || typeof body.input !== "string") {
      return NextResponse.json(
        { error: "Field 'input' (string) is required." },
        { status: 400 }
      );
    }

    const personaId = body.personaId;

    const result = await runPipeline(body.input, {
      personaId,
    });

    return NextResponse.json(
      {
        ok: true,
        input: body.input,
        personaId: result.persona?.id ?? personaId,
        persona: result.persona ?? null,
        expansion: result.expansion ?? null,
        analytics: result.analytics ?? null,
        semanticSearch: result.semanticSearch ?? null,
        planner: result.planner ?? null,
        reasoning: result.reasoning ?? null,
        insight: result.insight ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[run-pipeline] error", error);
    return NextResponse.json(
      { error: "Internal error while running pipeline." },
      { status: 500 }
    );
  }
}
