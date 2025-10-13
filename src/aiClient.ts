// OpenRouter client using Deepseek (deepseek/deepseek-chat-v3.1:free)

const env = (import.meta as any).env ?? {};
const OPENROUTER_BASE_URL: string = env.VITE_OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OPENROUTER_API_KEY: string | undefined = env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL: string = env.VITE_OPENROUTER_MODEL || "deepseek/deepseek-chat-v3.1:free";

export async function generateAdvice(
  prompt: string,
  options?: { system?: string; locale?: string }
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return "AI is not configured yet. Set VITE_OPENROUTER_API_KEY in a .env file.";
  }

  const url = `${OPENROUTER_BASE_URL}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        // Optional: identify your app per OpenRouter best practices
        "HTTP-Referer": env.VITE_APP_URL || window.location.origin,
        "X-Title": env.VITE_APP_NAME || "Smart Agricultural Advisory"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              options?.system ||
              "You are an AI Agricultural Advisor. Only answer agriculture-related questions (crops, soil, irrigation, pests, markets, weather, tools). If asked anything outside agriculture, politely decline and steer back to farming. Be concise, actionable, and locally practical. Avoid medical/legal/financial advice beyond general farming economics."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      const isDev = Boolean(env?.DEV);
      if (response.status === 401) return "Invalid OpenRouter API key (401).";
      if (response.status === 403) return "OpenRouter access denied (403). Check key permissions.";
      if (response.status === 404) return "Model not found on OpenRouter (404). Check model id and availability.";
      if (response.status === 429) return "OpenRouter rate limit reached (429). Try again shortly.";
      if (isDev && text) return `Dev: ${text}`;
      return "There was an error contacting the AI service. Please try again.";
    }

    const data: any = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    return content.trim();
  } catch (error: any) {
    const message: string = typeof error?.message === "string" ? error.message : "";
    const isDev = Boolean(env?.DEV);
    if (isDev && message) return `Dev: ${message}`;
    return "There was an error contacting the AI service. Please try again.";
  }
}


