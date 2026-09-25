import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth";
import { getStorageService } from "@/services/storage";

type Params = { params: Promise<{ key: string[] }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { key } = await params;
  const storageKey = decodeURIComponent(key.join("/"));
  const user = await getRequestUser(request);
  const resource = await prisma.resource.findFirst({
    where: { storageKey, ...(user?.role === "admin" ? {} : { status: "published" as const }) }
  });
  if (!resource) return NextResponse.json({ error: "File not found." }, { status: 404 });
  const file = await getStorageService().read(storageKey);
  return new NextResponse(new Uint8Array(file.body), { headers: { "Content-Type": file.mimeType } });
}
