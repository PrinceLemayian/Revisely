import { describe, expect, it } from "vitest";
import { validateUpload } from "@/services/storage/storage-service";

describe("validateUpload", () => {
  it("accepts a real PDF signature", () => {
    const mime = validateUpload(Buffer.from("%PDF-1.4 demo"), "application/pdf", 1024);
    expect(mime).toBe("application/pdf");
  });

  it("rejects unsupported files", () => {
    expect(() => validateUpload(Buffer.from("plain"), "text/plain", 1024)).toThrow(/allowed/);
  });
});
