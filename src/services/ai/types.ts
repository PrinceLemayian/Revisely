import { ResourceSearchResult } from "@/services/search/types";

export type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type RetrievedResource = ResourceSearchResult & {
  detailUrl: string;
  downloadUrl: string;
};

export type AIResponse = {
  answer: string;
};

export interface AIProvider {
  generateResponse(messages: ProviderMessage[], context: RetrievedResource[]): Promise<AIResponse>;
}

export type AssistantResult = {
  conversationId: string;
  answer: string;
  resources: RetrievedResource[];
  skippedProvider: boolean;
};
