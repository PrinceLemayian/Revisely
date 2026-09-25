import { env } from "@/config/env";
import { LocalStorageService } from "@/services/storage/local-storage-service";
import { S3StorageService } from "@/services/storage/s3-storage-service";
import { SupabaseStorageService } from "@/services/storage/supabase-storage-service";
import { StorageService } from "@/services/storage/storage-service";

export function getStorageService(): StorageService {
  if (env.STORAGE_PROVIDER === "s3") return new S3StorageService();
  if (env.STORAGE_PROVIDER === "supabase") return new SupabaseStorageService();
  return new LocalStorageService(env.LOCAL_UPLOAD_DIR);
}
