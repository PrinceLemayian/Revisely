import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { getTaxonomy } from "@/repositories/taxonomy";

type Props = {
  defaultQuery?: string;
  compact?: boolean;
};

export async function SearchForm({ defaultQuery = "", compact = false }: Props) {
  const taxonomy = compact ? null : await getTaxonomy();
  return (
    <form action="/search" className={compact ? "grid gap-3 md:grid-cols-[1fr_auto]" : "grid gap-3 rounded-lg bg-white p-4 shadow-soft md:grid-cols-[1.5fr_1fr_1fr_auto]"}>
      <label className="sr-only" htmlFor="q">Search resources</label>
      <Input id="q" name="q" defaultValue={defaultQuery} placeholder="Search by unit, code, year, or resource type" />
      {!compact ? (
        <>
          <Select name="type" aria-label="Resource type">
            <option value="">Any type</option>
            {taxonomy?.resourceTypes.map((type) => <option key={type.id} value={type.slug}>{type.name}</option>)}
          </Select>
          <Select name="year" aria-label="Academic year">
            <option value="">Any year</option>
            {taxonomy?.academicYears.map((year) => <option key={year.id} value={year.label}>{year.label}</option>)}
          </Select>
        </>
      ) : null}
      <Button type="submit"><Search size={17} /> Search</Button>
    </form>
  );
}
