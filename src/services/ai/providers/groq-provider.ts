import { env } from "@/config/env";
import { AIProvider, ProviderMessage, RetrievedResource } from "@/services/ai/types";

type GroqRequestBody = {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  stream: boolean;
  messages: ProviderMessage[];
  reasoning_effort?: "low" | "medium" | "high";
};

const FALLBACK_ANSWER = "I found matching resources, but could not generate a summary.";

export class GroqProvider implements AIProvider {
  async generateResponse(messages: ProviderMessage[], context: RetrievedResource[]) {
    if (!env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured.");

    const contextMessage: ProviderMessage = {
      role: "system",
      content: `Retrieved resources:\n${context
        .map((resource, index) =>
          `${index + 1}. ${resource.title} | ${resource.unit.code} ${resource.unit.name} | ${resource.resourceType.name} | ${resource.academicYear.label} | ${resource.semester?.name ?? "No semester"} | ${resource.description}`
        )
        .join("\n")}`
    };

    const body: GroqRequestBody = {
      model: env.GROQ_MODEL,
      temperature: env.GROQ_TEMPERATURE,
      max_tokens: env.GROQ_MAX_TOKENS,
      top_p: env.GROQ_TOP_P,
      stream: env.GROQ_STREAM,
      messages: [...messages, contextMessage]
    };

    if (env.GROQ_REASONING_EFFORT) {
      body.reasoning_effort = env.GROQ_REASONING_EFFORT;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Groq provider failed with status ${response.status}.`);

    const answer = env.GROQ_STREAM
      ? await readStreamedAnswer(response)
      : await readJsonAnswer(response);

    return { answer: answer || FALLBACK_ANSWER };
  }
}

async function readJsonAnswer(response: Response): Promise<string> {
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

// Consumes Groq's SSE stream and concatenates the delta chunks into the full
// answer. The provider contract returns a complete string, so streaming here is
// an implementation detail (lower time-to-first-byte upstream) and does not
// change the response shape seen by the assistant service.
async function readStreamedAnswer(response: Response): Promise<string> {
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "" || payload === "[DONE]") continue;

      try {
        const chunk = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        answer += chunk.choices?.[0]?.delta?.content ?? "";
      } catch {
        // Ignore keep-alive or partial lines; the next read completes them.
      }
    }
  }

  return answer.trim();
}
