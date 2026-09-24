import { notFound } from "next/navigation";
import { Download, Eye } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getRelatedResources, getResourceForUser, logResourceAccess } from "@/repositories/resources";
import { ButtonLink } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource-card";
import { formatBytes } from "@/lib/format";
import { toResourceCard } from "@/lib/resource-presenter";
import { BookmarkButton } from "@/components/bookmark-button";

type Props = { params: Promise<{ id: string }> };

export default async function ResourceDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();
  const resource = await getResourceForUser(id, user?.role === "admin");
  if (!resource) notFound();
  await logResourceAccess(resource.id, user?.id ?? null, "view");
  const related = await getRelatedResources(resource.id, resource.unitId, resource.resourceTypeId);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-spruce">{resource.unit.code} · {resource.resourceType.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{resource.title}</h1>
          <p className="mt-4 text-slate-600">{resource.description}</p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["School", resource.unit.program.department.school.name],
              ["Department", resource.unit.program.department.name],
              ["Program", resource.unit.program.name],
              ["Academic year", resource.academicYear.label],
              ["Semester", resource.semester?.name ?? "Not specified"],
              ["File", `${resource.fileName} · ${formatBytes(resource.fileSizeBytes)}`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={`/api/resources/${resource.id}/download`}><Download size={18} /> Download</ButtonLink>
            <BookmarkButton resourceId={resource.id} />
          </div>
        </section>
        <aside className="grid content-start gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Usage</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-slate-50 p-3"><Download className="text-spruce" /><p className="mt-2 text-2xl font-bold">{resource.downloadCount}</p><p className="text-xs text-slate-500">downloads</p></div>
              <div className="rounded-md bg-slate-50 p-3"><Eye className="text-spruce" /><p className="mt-2 text-2xl font-bold">{resource.viewCount}</p><p className="text-xs text-slate-500">views</p></div>
            </div>
          </div>
          <ButtonLink href={`/assistant?question=${encodeURIComponent(`Find resources like ${resource.title}`)}`} variant="secondary">Ask assistant</ButtonLink>
        </aside>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Related resources</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => <ResourceCard key={item.id} resource={toResourceCard(item)} />)}
        </div>
      </section>
    </main>
  );
}
