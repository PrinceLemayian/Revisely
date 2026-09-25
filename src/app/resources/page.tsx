import { getSessionUser } from "@/lib/auth";
import { getSearchService } from "@/services/search/postgres-search-service";
import { ResourceLibrary } from "@/components/resource-library";

export default async function ResourcesPage() {
  const user = await getSessionUser();
  const results = await getSearchService().search("", { page: 1, pageSize: 50 });
  const addResourceHref = user?.role === "admin" ? "/admin/resources" : user?.role === "student" ? "/submit" : "/login";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
      <ResourceLibrary resources={results.results} addResourceHref={addResourceHref} />
    </main>
  );
}
