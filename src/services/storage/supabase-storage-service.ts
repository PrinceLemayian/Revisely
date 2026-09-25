import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import { StorageService } from "@/services/storage/storage-service";

// Supabase Storage adapter. Uses the service-role key, so this must only ever
// run server-side. Files are streamed back through the app's own /api routes
// (see getUrl), so no public bucket access or signed URLs are required.
export class SupabaseStorageService implements StorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "Supabase storage is selected but SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured."
      );
    }
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    this.bucket = env.SUPABASE_STORAGE_BUCKET;
  }

  async upload(file: Buffer, key: string, mimeType: string) {
    const { error } = await this.client.storage.from(this.bucket).upload(key, file, {
      contentType: mimeType,
      upsert: true
    });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    return { key };
  }

  async getUrl(key: string) {
    // Keep downloads flowing through the guarded API route, matching the
    // local adapter, rather than exposing bucket URLs directly.
    return `/api/files/${encodeURIComponent(key)}`;
  }

  async delete(key: string) {
    const { error } = await this.client.storage.from(this.bucket).remove([key]);
    if (error) throw new Error(`Supabase delete failed: ${error.message}`);
  }

  async read(key: string) {
    const { data, error } = await this.client.storage.from(this.bucket).download(key);
    if (error || !data) throw new Error(`Supabase read failed: ${error?.message ?? "not found"}`);
    const body = Buffer.from(await data.arrayBuffer());
    const mimeType = data.type || "application/octet-stream";
    return { body, mimeType };
  }
}
