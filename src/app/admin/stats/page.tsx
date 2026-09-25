import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resourceInclude } from "@/repositories/resources";
import { ResourceCard } from "@/components/resource-card";
import { toResourceCard } from "@/lib/resource-presenter";

async function getStats() {
  const [mostDownloaded, recentUploads, zeroDownloads, logCount] = await Promise.all([
    prisma.resource.findMany({ include: resourceInclude, orderBy: { downloadCount: "desc" }, take: 6 }),
    prisma.resource.findMany({ include: resourceInclude, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.resource.count({ where: { downloadCount: 0 } }),
    prisma.resourceAccessLog.count()
  ]);
  return { mostDownloaded, recentUploads, zeroDownloads, logCount };
}

export default async function AdminStatsPage() {
  await requireAdmin();
  const stats = await getStats();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Admin stats</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-3xl font-bold">{stats.logCount}</p><p className="text-sm text-slate-600">Access events</p></div>
        <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-3xl font-bold">{stats.zeroDownloads}</p><p className="text-sm text-slate-600">Resources with zero downloads</p></div>
        <div className="rounded-lg bg-white p-5 shadow-sm"><p className="text-3xl font-bold">{stats.recentUploads.length}</p><p className="text-sm text-slate-600">Recent uploads shown</p></div>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Most downloaded</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{stats.mostDownloaded.map((resource) => <ResourceCard key={resource.id} resource={toResourceCard(resource)} />)}</div>
      </section>
    </main>
  );
}
