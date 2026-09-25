import { AIProvider, ProviderMessage, RetrievedResource } from "@/services/ai/types";

export class DemoProvider implements AIProvider {
  async generateResponse(messages: ProviderMessage[], context: RetrievedResource[]) {
    const latest = [...messages].reverse().find((message) => message.role === "user")?.content ?? "that";
    if (/^(hi|hello|hey|habari|mambo|niaje)\b/i.test(latest.trim())) {
      return { answer: "Hi! Karibu Revisely. I can help you find notes, past papers, assignments, or show you how the platform works." };
    }
    if (context.length === 0) {
      return { answer: "I couldn't find a matching resource yet. Try searching with a unit code or broader unit name, and contact Revisely support if you need help with your account." };
    }
    const resources = context.slice(0, 3);
    const intro =
      resources.length === 1
        ? "I found one matching resource in Revisely."
        : `I found ${resources.length} matching resources in Revisely.`;
    const details = resources
      .map((resource) => `${resource.title} (${resource.unit.code}, ${resource.resourceType.name}, ${resource.academicYear.label})`)
      .join("; ");
    return {
      answer: `${intro} For "${latest}", the strongest match${resources.length > 1 ? "es are" : " is"}: ${details}.`
    };
  }
}
