import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SearchForm } from "@/components/search-form";
import { ResourceCard } from "@/components/resource-card";
import { resourceCardSelect } from "@/repositories/resources";
import { toResourceCard } from "@/lib/resource-presenter";

async function getDashboardData(userId: string) {
  const [recentLogs, bookmarks] = await Promise.all([
    prisma.resourceAccessLog.findMany({
      where: { userId },
      include: { resource: { select: resourceCardSelect } },
      orderBy: { accessedAt: "desc" },
      take: 6
    }),
    prisma.bookmark.findMany({
      where: { userId },
      include: { resource: { select: resourceCardSelect } },
      orderBy: { createdAt: "desc" },
      take: 4
    })
  ]);
  const recent = [...new Map(recentLogs.map((log) => [log.resource.id, log.resource])).values()];
  return { recent, bookmarks: bookmarks.map((bookmark) => bookmark.resource) };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
      <div className="mt-6"><SearchForm compact /></div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Recently accessed</h2>
        {data.recent.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.recent.map((resource) => <ResourceCard key={resource.id} resource={toResourceCard(resource)} />)}</div> : <p className="rounded-lg bg-white p-6 text-slate-600">Open a resource to see it here.</p>}
      </section>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Bookmarks</h2>
        {data.bookmarks.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.bookmarks.map((resource) => <ResourceCard key={resource.id} resource={toResourceCard(resource)} />)}</div> : <p className="rounded-lg bg-white p-6 text-slate-600">Saved resources will appear here.</p>}
      </section>
    </main>
  );
}
