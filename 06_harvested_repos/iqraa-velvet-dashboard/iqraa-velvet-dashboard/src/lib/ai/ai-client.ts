/**
 * طبقة تجريدية للذكاء الاصطناعي.
 * يمكنك لاحقًا تنفيذ الاتصال الفعلي بـ OpenAI / Gemini / أي مزود آخر
 * داخل الدالة الداخلية `callProvider`.
 */

export type AIProvider = "openai" | "gemini" | "other";

export interface AIModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface AIGenerateParams {
  systemPrompt?: string;
  userPrompt: string;
  options?: AIModelOptions;
}

export interface AIGenerateResult {
  text: string;
  raw?: any;
}

function getProviderFromEnv(): AIProvider {
  const provider = process.env.IQRAA_AI_PROVIDER ?? "openai";
  if (provider === "gemini") return "gemini";
  if (provider === "other") return "other";
  return "openai";
}

async function callProvider(params: AIGenerateParams): Promise<AIGenerateResult> {
  const provider = getProviderFromEnv();

  // ⚠️ هنا تضع أنت الاندماج الفعلي مع المزود الذي تفضله.
  // حاليًا سنعيد نصًا وهميًا لكي لا ينكسر المشروع أثناء التطوير.
  // استبدله لاحقًا بـ call حقيقي على API.

  const { systemPrompt, userPrompt } = params;

  const mockText = [
    "⚠️ AI MOCK RESPONSE",
    "",
    "System prompt:",
    systemPrompt ?? "(none)",
    "",
    "User prompt:",
    userPrompt.slice(0, 800),
  ].join("\n");

  return {
    text: mockText,
    raw: { provider, mock: true },
  };
}

export async function generateText(params: AIGenerateParams): Promise<AIGenerateResult> {
  return callProvider(params);
}
