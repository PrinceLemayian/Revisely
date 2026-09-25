import { SearchForm } from "@/components/search-form";
import { ResourceCard } from "@/components/resource-card";
import { getSearchService } from "@/services/search/postgres-search-service";
import { searchQuerySchema } from "@/lib/validation";
import { getTaxonomy } from "@/repositories/taxonomy";
import { ButtonLink } from "@/components/ui/button";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const parsed = searchQuerySchema.parse(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, first(value)])));
  const { q, ...filters } = parsed;
  const [results, taxonomy] = await Promise.all([getSearchService().search(q, filters), getTaxonomy()]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Search resources</h1>
        <p className="mt-2 text-slate-600">Use natural academic terms, unit codes, resource types, and years together.</p>
      </div>
      <SearchForm defaultQuery={q} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Filters</h2>
          <form className="mt-4 grid gap-3" action="/search">
            <input type="hidden" name="q" value={q} />
            <select name="school" defaultValue={filters.school} className="h-10 rounded-md border border-slate-200 px-3 text-sm">
              <option value="">All schools</option>
              {taxonomy.schools.map((school) => <option key={school.id} value={school.code}>{school.name}</option>)}
            </select>
            <select name="type" defaultValue={filters.type} className="h-10 rounded-md border border-slate-200 px-3 text-sm">
              <option value="">All types</option>
              {taxonomy.resourceTypes.map((type) => <option key={type.id} value={type.slug}>{type.name}</option>)}
            </select>
            <select name="year" defaultValue={filters.year} className="h-10 rounded-md border border-slate-200 px-3 text-sm">
              <option value="">All years</option>
              {taxonomy.academicYears.map((year) => <option key={year.id} value={year.label}>{year.label}</option>)}
            </select>
            <select name="sort" defaultValue={filters.sort} className="h-10 rounded-md border border-slate-200 px-3 text-sm">
              <option value="newest">Newest</option>
              <option value="downloads">Most downloaded</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            <button className="h-10 rounded-md bg-spruce px-4 text-sm font-semibold text-white">Apply</button>
          </form>
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{results.total} result{results.total === 1 ? "" : "s"} found</p>
            <ButtonLink href="/assistant" variant="secondary">Ask the AI</ButtonLink>
          </div>
          {results.results.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {results.results.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <h2 className="text-xl font-semibold">No matching resources yet</h2>
              <p className="mt-2 text-slate-600">Try broadening the filters, searching with a unit code, or asking the assistant to check the catalog.</p>
              <div className="mt-4"><ButtonLink href="/assistant">Ask assistant</ButtonLink></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
