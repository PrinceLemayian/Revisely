import { NextRequest, NextResponse } from "next/server";
import { ResourceReviewStatus, ResourceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequestUser, requireApiAdmin } from "@/lib/auth";
import { resourceUpdateSchema } from "@/lib/validation";
import { getResourceForUser, resourceInclude } from "@/repositories/resources";
import { getStorageService } from "@/services/storage";
import { enforceSameOrigin } from "@/lib/csrf";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getRequestUser(request);
  const resource = await getResourceForUser(id, user?.role === "admin");
  if (!resource) return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  return NextResponse.json({ resource });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const admin = await requireApiAdmin(request);
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = resourceUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid resource details.", details: parsed.error.flatten() }, { status: 400 });

  const resource = await prisma.resource.update({
    where: { id },
    data: {
      ...parsed.data,
      status: parsed.data.status as ResourceStatus | undefined,
      ...(parsed.data.status === "published" ? { reviewStatus: ResourceReviewStatus.approved, reviewedAt: new Date() } : {})
    },
    include: resourceInclude
  });
  return NextResponse.json({ resource });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const admin = await requireApiAdmin(request);
  if (admin instanceof Response) return admin;
  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return NextResponse.json({ ok: true });
  await prisma.resource.delete({ where: { id } });
  await getStorageService().delete(resource.storageKey).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
