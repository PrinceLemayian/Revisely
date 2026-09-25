import { env } from "@/config/env";
import { AIProvider } from "@/services/ai/types";
import { DemoProvider } from "@/services/ai/providers/demo-provider";
import { OpenAIProvider } from "@/services/ai/providers/openai-provider";
import { GroqProvider } from "@/services/ai/providers/groq-provider";

export function getAIProvider(): AIProvider {
  if (env.AI_PROVIDER === "openai") return new OpenAIProvider();
  if (env.AI_PROVIDER === "groq") return new GroqProvider();
  return new DemoProvider();
}
