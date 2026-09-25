import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resourceInclude } from "@/repositories/resources";
import { ResourceCard } from "@/components/resource-card";
import { toResourceCard } from "@/lib/resource-presenter";

type Props = { params: Promise<{ id: string }> };

async function getUnit(id: string) {
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      program: { include: { department: { include: { school: true } } } },
      resources: {
        where: { status: "published" },
        include: resourceInclude,
        orderBy: [{ resourceType: { name: "asc" } }, { academicYear: { label: "desc" } }]
      }
    }
  });
  if (!unit) notFound();
  return unit;
}

export default async function UnitPage({ params }: Props) {
  const { id } = await params;
  const unit = await getUnit(id);
  const grouped = unit.resources.reduce<Map<string, typeof unit.resources>>((groups, resource) => {
    const key = `${resource.resourceType.name} · ${resource.academicYear.label}`;
    groups.set(key, [...(groups.get(key) ?? []), resource]);
    return groups;
  }, new Map());
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-spruce">{unit.program.department.school.name} / {unit.program.department.name}</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">{unit.code} · {unit.name}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">{unit.description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm"><p className="text-2xl font-bold">{unit.resources.length}</p><p className="text-sm text-slate-600">Published resources</p></div>
        <div className="rounded-lg bg-white p-4 shadow-sm"><p className="text-2xl font-bold">{new Set(unit.resources.map((r) => r.resourceTypeId)).size}</p><p className="text-sm text-slate-600">Resource types</p></div>
        <div className="rounded-lg bg-white p-4 shadow-sm"><p className="text-2xl font-bold">{new Set(unit.resources.map((r) => r.academicYearId)).size}</p><p className="text-sm text-slate-600">Academic years</p></div>
      </div>
      <div className="mt-8 grid gap-6">
        {[...grouped].map(([label, resources]) => (
          <section key={label}>
            <h2 className="mb-3 text-lg font-semibold">{label}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((resource) => <ResourceCard key={resource.id} resource={toResourceCard(resource)} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
