import { describe, expect, it } from "vitest";
import { extractIntent } from "@/services/ai/intent";

describe("extractIntent", () => {
  it("extracts unit code, year, semester, and resource type", () => {
    const intent = extractIntent("Do you have a 2024 CSC 220 past paper for semester 2?");
    expect(intent.filters.unitCode).toBe("CSC220");
    expect(intent.filters.year).toBe("2024/2025");
    expect(intent.filters.semester).toBe("Semester 2");
    expect(intent.filters.type).toBe("past-papers");
  });

  it("does not invent filters when phrasing is general", () => {
    const intent = extractIntent("database systems materials");
    expect(intent.filters.unitCode).toBeUndefined();
    expect(intent.query.toLowerCase()).toContain("database systems");
  });

  it("treats a broad paper request as a subject search", () => {
    const intent = extractIntent("I want to find a finance paper");
    expect(intent.filters.type).toBeUndefined();
    expect(intent.query).toBe("finance");
  });
});
