export interface StorageService {
  upload(file: Buffer, key: string, mimeType: string): Promise<{ key: string }>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
  read(key: string): Promise<{ body: Buffer; mimeType: string }>;
}

export const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

export function sniffMimeType(buffer: Buffer, declaredType: string) {
  const header = buffer.subarray(0, 12);
  if (header.subarray(0, 4).toString() === "%PDF") return "application/pdf";
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return "image/jpeg";
  if (header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (header.subarray(0, 4).toString() === "RIFF" && header.subarray(8, 12).toString() === "WEBP") {
    return "image/webp";
  }
  if (header[0] === 0x50 && header[1] === 0x4b) return declaredType;
  return declaredType;
}

export function validateUpload(file: Buffer, declaredType: string, maxBytes: number) {
  const mimeType = sniffMimeType(file, declaredType);
  if (file.length === 0) throw new Error("The uploaded file is empty.");
  if (file.length > maxBytes) throw new Error("The uploaded file is too large.");
  if (!allowedMimeTypes.has(mimeType)) throw new Error("Only PDF, DOCX, PPTX, XLSX, PNG, JPEG, and WebP files are allowed.");
  return mimeType;
}
