"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Filter, Plus, Search } from "lucide-react";
import { ResourceCard } from "@/components/resource-card";
import { ButtonLink } from "@/components/ui/button";
import { ResourceSearchResult } from "@/services/search/types";

type Tab = { label: string; value: string; slugs?: string[] };

const tabs: Tab[] = [
  { label: "All resources", value: "all" },
  { label: "Notes", value: "notes", slugs: ["lecture-notes", "revision-materials", "study-guides", "handouts"] },
  { label: "Past papers", value: "past-papers", slugs: ["past-papers", "cats"] },
  { label: "Assignments", value: "assignments", slugs: ["assignments"] },
  { label: "Links", value: "links", slugs: ["other"] }
];

export function ResourceLibrary({ resources, addResourceHref }: { resources: ResourceSearchResult[]; addResourceHref?: string }) {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [school, setSchool] = useState("all");
  const [year, setYear] = useState("all");
  const [unit, setUnit] = useState("all");

  const schools = useMemo(() => [...new Set(resources.map((resource) => resource.school.name))].sort(), [resources]);
  const years = useMemo(() => [...new Set(resources.map((resource) => resource.academicYear.label))].sort().reverse(), [resources]);
  const units = useMemo(() => [...new Map(resources.map((resource) => [resource.unit.code, resource.unit.name])).entries()].sort(), [resources]);
  const filtered = useMemo(() => {
    const tab = tabs.find((item) => item.value === activeTab);
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesTab = !tab?.slugs || tab.slugs.includes(resource.resourceType.slug);
      const matchesSchool = school === "all" || resource.school.name === school;
      const matchesYear = year === "all" || resource.academicYear.label === year;
      const matchesUnit = unit === "all" || resource.unit.code === unit;
      const matchesQuery = !normalizedQuery || `${resource.title} ${resource.description} ${resource.unit.code} ${resource.unit.name}`.toLowerCase().includes(normalizedQuery);
      return matchesTab && matchesSchool && matchesYear && matchesUnit && matchesQuery;
    });
  }, [activeTab, query, resources, school, unit, year]);

  const groups = useMemo(() => {
    const grouped = new Map<string, ResourceSearchResult[]>();
    filtered.forEach((resource) => grouped.set(resource.unit.code, [...(grouped.get(resource.unit.code) ?? []), resource]));
    return [...grouped.entries()];
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-dark-border lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><span>Home</span><span>/</span><span className="font-medium text-ink dark:text-dark-text">Resource library</span></div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink dark:text-dark-text sm:text-4xl">Find your next study win.</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">Browse a reviewed collection of notes, past papers, assignments, and study guides grouped around the units you take.</p>
        </div>
        {addResourceHref ? <ButtonLink href={addResourceHref}><Plus size={17} /> Add resource</ButtonLink> : null}
      </div>

      <div className="mt-6 overflow-x-auto border-b border-slate-200 dark:border-dark-border">
        <div className="flex min-w-max gap-6" role="tablist" aria-label="Resource types">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={
                activeTab === tab.value
                  ? "border-b-2 border-spruce px-1 pb-3 text-sm font-semibold text-spruce"
                  : "border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-dark-text"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-dark-border dark:bg-dark-surface lg:sticky lg:top-[76px] lg:z-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search library</span>
          <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this library"
            className="focus-ring h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text dark:placeholder:text-slate-500"
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Filter by school</span>
          <select value={school} onChange={(event) => setSchool(event.target.value)} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
            <option value="all">All schools</option>{schools.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="relative block">
          <span className="sr-only">Filter by year</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
            <option value="all">All years</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="relative block">
          <span className="sr-only">Filter by unit</span>
          <select value={unit} onChange={(event) => setUnit(event.target.value)} className="focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-text">
            <option value="all">All units</option>{units.map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}
          </select>
        </label>
        <div className="hidden items-center justify-center px-2 text-slate-400 dark:text-slate-500 lg:flex"><Filter size={17} /></div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} resource{filtered.length === 1 ? "" : "s"}</p>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Grouped by unit</span>
      </div>
      <div className="mt-3 grid gap-4">
        {groups.map(([code, items]) => (
          <details key={code} open className="group rounded-lg border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-spruce">{items[0].school.name}</p>
                <h2 className="mt-1 text-lg font-semibold text-ink dark:text-dark-text">{code} · {items[0].unit.name}</h2>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
                <ChevronDown size={18} className="transition group-open:rotate-180" />
              </div>
            </summary>
            <div className="grid gap-3 border-t border-slate-100 p-4 dark:border-dark-border md:grid-cols-2">
              {items.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
            </div>
          </details>
        ))}
        {!groups.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-dark-border dark:bg-dark-surface">
            <h2 className="text-lg font-semibold text-ink dark:text-dark-text">Nothing matches those filters</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Try another subject, school, year, or resource type.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
