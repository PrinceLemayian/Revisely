import { ResourceReviewStatus, ResourceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth";
import { resourceReviewSchema } from "@/lib/validation";
import { resourceInclude } from "@/repositories/resources";
import { enforceSameOrigin } from "@/lib/csrf";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const csrf = enforceSameOrigin(request);
  if (csrf) return csrf;
  const admin = await requireApiAdmin(request);
  if (admin instanceof Response) return admin;

  const body = await request.json().catch(() => null);
  const parsed = resourceReviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid review action." }, { status: 400 });

  const { id } = await params;
  const current = await prisma.resource.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Resource not found." }, { status: 404 });

  const reviewStatus = {
    approve: ResourceReviewStatus.approved,
    reject: ResourceReviewStatus.rejected,
    flag: ResourceReviewStatus.flagged
  }[parsed.data.action];

  const resource = await prisma.resource.update({
    where: { id },
    data: {
      reviewStatus,
      reviewReason: parsed.data.reason || null,
      reviewedAt: new Date(),
      status: parsed.data.action === "approve" ? ResourceStatus.published : ResourceStatus.draft
    },
    include: resourceInclude
  });

  return NextResponse.json({ resource });
}
