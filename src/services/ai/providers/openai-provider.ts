import { env } from "@/config/env";
import { AIProvider, ProviderMessage, RetrievedResource } from "@/services/ai/types";

export class OpenAIProvider implements AIProvider {
  async generateResponse(messages: ProviderMessage[], context: RetrievedResource[]) {
    if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          ...messages,
          {
            role: "system",
            content: `Retrieved resources:\n${context
              .map((resource, index) => {
                return `${index + 1}. ${resource.title} | ${resource.unit.code} ${resource.unit.name} | ${resource.resourceType.name} | ${resource.academicYear.label} | ${resource.semester?.name ?? "No semester"} | ${resource.description}`;
              })
              .join("\n")}`
          }
        ]
      })
    });

    if (!response.ok) throw new Error(`AI provider failed with status ${response.status}.`);
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return { answer: json.choices?.[0]?.message?.content?.trim() || "I found matching resources, but could not generate a summary." };
  }
}
