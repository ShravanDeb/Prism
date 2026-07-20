export type LLMProvider =
  | "openai"
  | "anthropic"
  | "gemini"
  | "deepseek"
  | "groq"
  | "ollama"
  | "openrouter"
  | "openai-compatible";

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  apiBaseUrl?: string;
  reasoningEffort?: string;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionOpts {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export async function complete(config: LLMConfig, opts: LLMCompletionOpts): Promise<string> {
  const { provider, model, apiKey, apiBaseUrl } = config;
  const { messages, temperature = 0.7, maxTokens = 4096 } = opts;

  if (!apiKey && provider !== "ollama" && provider !== "openai-compatible") {
    throw new Error(`API key required for provider: ${provider}`);
  }

  switch (provider) {
    case "openai":
    case "openai-compatible":
    case "openrouter":
    case "deepseek":
    case "groq": {
      const baseUrl = apiBaseUrl || getDefaultBaseUrl(provider);
      const isFreeEndpoint = baseUrl.includes("opencode.ai");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (!isFreeEndpoint && apiKey && apiKey !== "free") headers.Authorization = `Bearer ${apiKey}`;
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (!res.ok) throw new Error(`LLM error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.choices[0].message.content;
    }

    case "anthropic": {
      const systemMsg = messages.find((m) => m.role === "system");
      const userMsgs = messages.filter((m) => m.role !== "system");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system: systemMsg?.content,
          messages: userMsgs,
          max_tokens: maxTokens,
          temperature,
        }),
      });
      if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.content[0].text;
    }

    case "gemini": {
      const baseUrl = apiBaseUrl || "https://generativelanguage.googleapis.com/v1beta";
      const contents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const res = await fetch(`${baseUrl}/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, generationConfig: { temperature, maxOutputTokens: maxTokens } }),
      });
      if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.candidates[0].content.parts[0].text;
    }

    case "ollama": {
      const baseUrl = apiBaseUrl || "http://localhost:11434";
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          options: { temperature, num_predict: maxTokens },
        }),
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
      const data = await res.json();
      return data.message.content;
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function getDefaultBaseUrl(provider: LLMProvider): string {
  switch (provider) {
    case "openai": return "https://api.openai.com/v1";
    case "openrouter": return "https://openrouter.ai/api/v1";
    case "deepseek": return "https://api.deepseek.com/v1";
    case "groq": return "https://api.groq.com/openai/v1";
    default: return "https://api.openai.com/v1";
  }
}
