import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiAdmin } from "@/lib/auth";
import { resourceInclude } from "@/repositories/resources";

export async function GET(request: NextRequest) {
  const admin = await requireApiAdmin(request);
  if (admin instanceof Response) return admin;
  const [mostDownloaded, recentUploads, zeroDownloads, usage] = await Promise.all([
    prisma.resource.findMany({ include: resourceInclude, orderBy: { downloadCount: "desc" }, take: 8 }),
    prisma.resource.findMany({ include: resourceInclude, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.resource.count({ where: { downloadCount: 0 } }),
    prisma.resourceAccessLog.groupBy({ by: ["action"], _count: true })
  ]);
  return NextResponse.json({ mostDownloaded, recentUploads, zeroDownloads, usage });
}
