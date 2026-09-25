import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ResourceFilters, ResourceSearchResult, SearchResponse, SearchService } from "@/services/search/types";

function normalizeCourseCode(input: string) {
  return input.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function normalizeSearchTerm(input: string) {
  const term = input.toLowerCase().trim();
  if (term.length > 4 && term.endsWith("ies")) return `${term.slice(0, -3)}y`;
  if (term.length > 4 && term.endsWith("s")) return term.slice(0, -1);
  return term;
}

function searchTermWhere(term: string): Prisma.ResourceWhereInput {
  return {
    OR: [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { unit: { name: { contains: term, mode: "insensitive" } } },
      { unit: { code: { contains: term, mode: "insensitive" } } },
      { unit: { program: { name: { contains: term, mode: "insensitive" } } } },
      { unit: { program: { department: { name: { contains: term, mode: "insensitive" } } } } },
      { unit: { program: { department: { school: { name: { contains: term, mode: "insensitive" } } } } } }
    ]
  };
}

function buildWhere(query: string, filters: ResourceFilters) {
  const and: Prisma.ResourceWhereInput[] = [{ status: "published" }];
  const trimmed = query.trim();
  const normalizedCode = normalizeCourseCode(trimmed);

  if (trimmed) {
    const terms = trimmed
      .split(/[^a-z0-9]+/i)
      .map(normalizeSearchTerm)
      .filter((term) => term.length >= 2);
    const uniqueTerms = [...new Set(terms)];
    if (uniqueTerms.length > 1) {
      and.push(...uniqueTerms.map(searchTermWhere));
    } else {
      and.push(searchTermWhere(normalizedCode || uniqueTerms[0] || trimmed));
    }
  }

  if (filters.unitCode) and.push({ unit: { code: { contains: normalizeCourseCode(filters.unitCode), mode: "insensitive" } } });
  if (filters.unit) and.push({ unit: { name: { contains: filters.unit, mode: "insensitive" } } });
  if (filters.type) and.push({ resourceType: { slug: filters.type } });
  if (filters.year) and.push({ academicYear: { label: filters.year } });
  if (filters.semester) and.push({ semester: { name: filters.semester } });
  if (filters.department) and.push({ unit: { program: { department: { code: filters.department } } } });
  if (filters.school) and.push({ unit: { program: { department: { school: { code: filters.school } } } } });

  return { AND: and };
}

const includeResource = {
  resourceType: true,
  academicYear: true,
  semester: true,
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

function mapResource(resource: Prisma.ResourceGetPayload<{ include: typeof includeResource }>): ResourceSearchResult {
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

export class PostgresSearchService implements SearchService {
  async search(query: string, filters: ResourceFilters = {}): Promise<SearchResponse> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    const where = buildWhere(query, filters);
    const orderBy = this.orderBy(filters.sort ?? "newest");

    const [total, resources] = await prisma.$transaction([
      prisma.resource.count({ where }),
      prisma.resource.findMany({
        where,
        include: includeResource,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ]);

    return {
      total,
      page,
      pageSize,
      results: resources.map(mapResource)
    };
  }

  private orderBy(sort: ResourceFilters["sort"]): Prisma.ResourceOrderByWithRelationInput {
    if (sort === "downloads") return { downloadCount: "desc" };
    if (sort === "alphabetical") return { title: "asc" };
    return { createdAt: "desc" };
  }
}

export function getSearchService(): SearchService {
  return new PostgresSearchService();
}
