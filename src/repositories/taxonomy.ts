import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Deduplicate taxonomy reads shared by multiple server components in one request.
export const getTaxonomy = cache(async function getTaxonomy() {
  const [schools, resourceTypes, academicYears, semesters] = await Promise.all([
    prisma.school.findMany({
      include: {
        departments: {
          include: {
            programs: {
              include: {
                units: { orderBy: { name: "asc" } }
              },
              orderBy: { name: "asc" }
            }
          },
          orderBy: { name: "asc" }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.resourceType.findMany({ orderBy: { name: "asc" } }),
    prisma.academicYear.findMany({ orderBy: { label: "desc" } }),
    prisma.semester.findMany({ orderBy: { name: "asc" } })
  ]);
  return { schools, resourceTypes, academicYears, semesters };
});
