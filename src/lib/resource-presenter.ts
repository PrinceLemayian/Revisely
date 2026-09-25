import { resourceCardSelect } from "@/repositories/resources";
import { ResourceSearchResult } from "@/services/search/types";
import { Prisma } from "@prisma/client";

export type IncludedResource = Prisma.ResourceGetPayload<{ select: typeof resourceCardSelect }>;

export function toResourceCard(resource: IncludedResource): ResourceSearchResult {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    fileType: resource.fileType,
    fileSizeBytes: resource.fileSizeBytes,
    downloadCount: resource.downloadCount,
    viewCount: resource.viewCount,
    createdAt: resource.createdAt,
    unit: { id: resource.unit.id, name: resource.unit.name, code: resource.unit.code },
    resourceType: { name: resource.resourceType.name, slug: resource.resourceType.slug },
    academicYear: { label: resource.academicYear.label },
    semester: resource.semester ? { name: resource.semester.name } : null,
    program: { name: resource.unit.program.name },
    department: { name: resource.unit.program.department.name },
    school: { name: resource.unit.program.department.school.name }
  };
}
