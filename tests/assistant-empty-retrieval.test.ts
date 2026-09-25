import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    chatConversation: {
      create: vi.fn(async () => ({ id: "conversation-1" })),
      findFirst: vi.fn()
    },
    chatMessage: {
      create: vi.fn(async () => ({})),
      findMany: vi.fn(async () => [])
    }
  }
}));

vi.mock("@/services/search/postgres-search-service", () => ({
  getSearchService: () => ({
    search: vi.fn(async () => ({ total: 0, page: 1, pageSize: 5, results: [] }))
  })
}));

vi.mock("@/services/ai", () => ({
  getAIProvider: () => ({
    generateResponse: vi.fn(async () => {
      throw new Error("should not be called");
    })
  })
}));

describe("askAssistant", () => {
  it("skips the provider when retrieval is empty", async () => {
    const { askAssistant } = await import("@/services/ai/assistant-service");
    const result = await askAssistant("user-1", "Do you have compiler design 2026?");
    expect(result.skippedProvider).toBe(true);
    expect(result.resources).toEqual([]);
    expect(result.answer).toContain("couldn't find");
  });
});
