import { requireAdmin } from "@/lib/auth";
import { getTaxonomy } from "@/repositories/taxonomy";
import { AdminTaxonomyForm } from "@/components/admin-taxonomy-form";
import { Card } from "@/components/ui/card";

export default async function AdminTaxonomyPage() {
  await requireAdmin();
  const taxonomy = await getTaxonomy();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Taxonomy management</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <AdminTaxonomyForm taxonomy={taxonomy} />
        <Card>
          <h2 className="text-xl font-semibold">Current hierarchy</h2>
          <div className="mt-4 grid gap-4">
            {taxonomy.schools.map((school) => (
              <div key={school.id} className="rounded-md bg-slate-50 p-4">
                <h3 className="font-semibold">{school.name}</h3>
                {school.departments.map((department) => (
                  <div key={department.id} className="mt-3 border-l-2 border-slate-200 pl-3">
                    <p className="text-sm font-medium">{department.name}</p>
                    {department.programs.map((program) => (
                      <p key={program.id} className="mt-1 text-sm text-slate-600">{program.name}: {program.units.map((unit) => unit.code).join(", ")}</p>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
