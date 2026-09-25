import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResourceCard } from "@/components/resource-card";
import { resourceInclude } from "@/repositories/resources";
import { toResourceCard } from "@/lib/resource-presenter";

async function getBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    include: { resource: { include: resourceInclude } },
    orderBy: { createdAt: "desc" }
  });
}

export default async function BookmarksPage() {
  const user = await requireUser();
  const bookmarks = await getBookmarks(user.id);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Bookmarks</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => <ResourceCard key={bookmark.id} resource={toResourceCard(bookmark.resource)} />)}
      </div>
      {!bookmarks.length ? <p className="mt-6 rounded-lg bg-white p-8 text-center text-slate-600">No saved resources yet.</p> : null}
    </main>
  );
}
