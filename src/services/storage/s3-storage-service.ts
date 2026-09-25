import { StorageService } from "@/services/storage/storage-service";

export class S3StorageService implements StorageService {
  async upload(): Promise<{ key: string }> {
    throw new Error("S3 storage is configured but not implemented. Add an S3 SDK adapter behind StorageService.");
  }

  async getUrl(): Promise<string> {
    throw new Error("S3 storage is configured but not implemented. Add signed URL generation here.");
  }

  async delete(): Promise<void> {
    throw new Error("S3 storage is configured but not implemented.");
  }

  async read(): Promise<{ body: Buffer; mimeType: string }> {
    throw new Error("S3 storage is configured but direct reads should be replaced by signed URLs.");
  }
}
