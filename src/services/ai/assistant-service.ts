import { ChatRole } from "@prisma/client";
import { assistantSystemPrompt } from "@/services/ai/prompt";
import { extractIntent } from "@/services/ai/intent";
import { AssistantResult, ProviderMessage, RetrievedResource } from "@/services/ai/types";
import { getAIProvider } from "@/services/ai";
import { getSearchService } from "@/services/search/postgres-search-service";
import { prisma } from "@/lib/prisma";

function withUrls(resource: Omit<RetrievedResource, "detailUrl" | "downloadUrl">): RetrievedResource {
  return {
    ...resource,
    detailUrl: `/resources/${resource.id}`,
    downloadUrl: `/api/resources/${resource.id}/download`
  };
}

function providerErrorMessage() {
  return "I found matching Revisely resources, but the AI provider did not respond in time. I still included the matching resource cards below.";
}

function isCustomerCareMessage(message: string) {
  return /^(hi|hello|hey|habari|mambo|niaje)\b/i.test(message.trim()) ||
    /\b(revisely|platform|account|login|log in|sign in|password|bookmark|download|search|browse|support|help|where can i find|ninapata wapi|siwezi ku-login)\b/i.test(message);
}

export async function askAssistant(userId: string, message: string, conversationId?: string): Promise<AssistantResult> {
  const conversation =
    conversationId
      ? await prisma.chatConversation.findFirst({ where: { id: conversationId, userId } })
      : await prisma.chatConversation.create({ data: { userId } });

  if (!conversation) throw new Error("Conversation not found.");

  const { query, filters } = extractIntent(message);
  const search = getSearchService();
  const { results } = await search.search(query, { ...filters, page: 1, pageSize: 5 });
  const resources = results.map(withUrls);
  const resourceIds = resources.map((resource) => resource.id);

  await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      role: ChatRole.user,
      content: message,
      retrievedResourceIds: resourceIds
    }
  });

  if (resources.length === 0 && !isCustomerCareMessage(message)) {
    const answer =
      "I couldn't find a matching resource in Revisely. Try searching by unit code, a broader unit name, or a different academic year.";
    await prisma.chatMessage.create({
      data: { conversationId: conversation.id, role: ChatRole.assistant, content: answer, retrievedResourceIds: [] }
    });
    return { conversationId: conversation.id, answer, resources, skippedProvider: true };
  }

  const history = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  const messages: ProviderMessage[] = [
    { role: "system", content: assistantSystemPrompt },
    ...history.reverse().map((entry) => ({
      role: entry.role === ChatRole.assistant ? "assistant" : "user",
      content: entry.content
    }) satisfies ProviderMessage)
  ];

  let answer: string;
  try {
    const provider = getAIProvider();
    answer = (await provider.generateResponse(messages, resources)).answer;
  } catch {
    answer = providerErrorMessage();
  }

  await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      role: ChatRole.assistant,
      content: answer,
      retrievedResourceIds: resourceIds
    }
  });

  return { conversationId: conversation.id, answer, resources, skippedProvider: false };
}
