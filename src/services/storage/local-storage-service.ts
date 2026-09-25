import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { StorageService } from "@/services/storage/storage-service";

export class LocalStorageService implements StorageService {
  constructor(private readonly rootDir: string) {}

  async upload(file: Buffer, key: string, mimeType: string) {
    const filePath = this.resolve(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, file);
    await writeFile(`${filePath}.type`, mimeType);
    return { key };
  }

  async getUrl(key: string) {
    return `/api/files/${encodeURIComponent(key)}`;
  }

  async delete(key: string) {
    await rm(this.resolve(key), { force: true });
    await rm(`${this.resolve(key)}.type`, { force: true });
  }

  async read(key: string) {
    const filePath = this.resolve(key);
    const [body, mimeType] = await Promise.all([
      readFile(filePath),
      readFile(`${filePath}.type`, "utf8").catch(() => "application/octet-stream")
    ]);
    return { body, mimeType };
  }

  private resolve(key: string) {
    const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");
    const resolved = path.resolve(this.rootDir, normalized);
    const root = path.resolve(this.rootDir);
    if (!resolved.startsWith(root)) throw new Error("Invalid storage key.");
    return resolved;
  }
}
