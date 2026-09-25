import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { resourceInclude } from "@/repositories/resources";
import { enforceSameOrigin } from "@/lib/csrf";

export async function GET(request: NextRequest) {
  const user = await requireApiUser(request);
  if (user instanceof Response) return user;
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: { resource: { include: resourceInclude } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const user = await requireApiUser(request);
  if (user instanceof Response) return user;
  const body = await request.json().catch(() => null);
  const resourceId = typeof body?.resourceId === "string" ? body.resourceId : "";
  if (!resourceId) return NextResponse.json({ error: "Resource is required." }, { status: 400 });
  const bookmark = await prisma.bookmark.upsert({
    where: { userId_resourceId: { userId: user.id, resourceId } },
    update: {},
    create: { userId: user.id, resourceId }
  });
  return NextResponse.json({ bookmark });
}

export async function DELETE(request: NextRequest) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const user = await requireApiUser(request);
  if (user instanceof Response) return user;
  const resourceId = request.nextUrl.searchParams.get("resourceId");
  if (!resourceId) return NextResponse.json({ error: "Resource is required." }, { status: 400 });
  await prisma.bookmark.deleteMany({ where: { userId: user.id, resourceId } });
  return NextResponse.json({ ok: true });
}
