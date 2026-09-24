import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const resourceInclude = {
  resourceType: true,
  academicYear: true,
  semester: true,
  uploadedBy: { select: { id: true, name: true } },
  unit: {
    include: {
      program: {
        include: {
          department: {
            include: { school: true }
          }
        }
      }
    }
  }
} satisfies Prisma.ResourceInclude;

export async function getPublishedResource(id: string) {
  return prisma.resource.findFirst({
    where: { id, status: "published" },
    include: resourceInclude
  });
}

export async function getResourceForUser(id: string, isAdmin: boolean) {
  return prisma.resource.findFirst({
    where: { id, ...(isAdmin ? {} : { status: "published" as const }) },
    include: resourceInclude
  });
}

export async function logResourceAccess(resourceId: string, userId: string | null, action: "view" | "download") {
  await prisma.$transaction([
    prisma.resourceAccessLog.create({ data: { resourceId, userId, action } }),
    prisma.resource.update({
      where: { id: resourceId },
      data: action === "view" ? { viewCount: { increment: 1 } } : { downloadCount: { increment: 1 } }
    })
  ]);
}

export async function getRelatedResources(resourceId: string, unitId: string, resourceTypeId: string) {
  return prisma.resource.findMany({
    where: {
      id: { not: resourceId },
      status: "published",
      OR: [{ unitId }, { resourceTypeId }]
    },
    include: resourceInclude,
    take: 4,
    orderBy: [{ unitId: "asc" }, { createdAt: "desc" }]
  });
}
