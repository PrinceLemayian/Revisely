import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTaxonomy } from "@/repositories/taxonomy";
import { resourceInclude } from "@/repositories/resources";
import { AdminResourceForm } from "@/components/admin-resource-form";
import { ResourceCard } from "@/components/resource-card";
import { toResourceCard } from "@/lib/resource-presenter";

async function getResources() {
  return prisma.resource.findMany({ include: resourceInclude, orderBy: { createdAt: "desc" }, take: 12 });
}

export default async function AdminResourcesPage() {
  await requireAdmin();
  const [taxonomy, resources] = await Promise.all([getTaxonomy(), getResources()]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Resource management</h1>
      <p className="mt-2 text-slate-600">Uploads require a unit, resource type, and academic year before they can be saved.</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-spruce">
        <Link href="/admin/taxonomy">Manage taxonomy</Link>
        <Link href="/admin/review">Open review queue</Link>
        <Link href="/admin/stats">View stats</Link>
      </div>
      <div className="mt-6"><AdminResourceForm taxonomy={taxonomy} /></div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Recently added</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{resources.map((resource) => <ResourceCard key={resource.id} resource={toResourceCard(resource)} />)}</div>
      </section>
    </main>
  );
}
