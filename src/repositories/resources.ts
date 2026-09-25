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

// Keep card/list payloads limited to fields rendered by ResourceCard.
export const resourceCardSelect = {
  id: true,
  resourceTypeId: true,
  academicYearId: true,
  title: true,
  description: true,
  fileType: true,
  fileSizeBytes: true,
  downloadCount: true,
  viewCount: true,
  createdAt: true,
  resourceType: { select: { name: true, slug: true } },
  academicYear: { select: { label: true } },
  semester: { select: { name: true } },
  unit: {
    select: {
      id: true,
      name: true,
      code: true,
      program: {
        select: {
          name: true,
          department: {
            select: {
              name: true,
              school: { select: { name: true } }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.ResourceSelect;

// Limit review queue hydration to the fields displayed by the review screen.
export const resourceReviewSelect = {
  id: true,
  title: true,
  description: true,
  fileName: true,
  fileType: true,
  storageKey: true,
  createdAt: true,
  reviewStatus: true,
  reviewReason: true,
  reviewedAt: true,
  uploadedBy: { select: { name: true } },
  unit: {
    select: {
      code: true,
      name: true,
      program: { select: { department: { select: { school: { select: { name: true } } } } } }
    }
  },
  resourceType: { select: { name: true } }
} satisfies Prisma.ResourceSelect;

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
    select: resourceCardSelect,
    take: 4,
    orderBy: [{ unitId: "asc" }, { createdAt: "desc" }]
  });
}
