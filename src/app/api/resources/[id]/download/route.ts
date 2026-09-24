import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { getPublishedResource, logResourceAccess } from "@/repositories/resources";
import { getStorageService } from "@/services/storage";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getRequestUser(request);
  const resource = await getPublishedResource(id);
  if (!resource) return NextResponse.json({ error: "Resource not found." }, { status: 404 });

  const file = await getStorageService().read(resource.storageKey);
  await logResourceAccess(resource.id, user?.id ?? null, "download");

  return new NextResponse(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${resource.fileName.replaceAll('"', "")}"`
    }
  });
}
