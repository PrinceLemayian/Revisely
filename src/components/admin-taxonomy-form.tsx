"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";

type Taxonomy = {
  schools: Array<{ id: string; name: string; departments: Array<{ id: string; name: string; programs: Array<{ id: string; name: string }> }> }>;
};

export function AdminTaxonomyForm({ taxonomy }: { taxonomy: Taxonomy }) {
  const [entity, setEntity] = useState("school");
  const [message, setMessage] = useState("");
  const departments = taxonomy.schools.flatMap((school) => school.departments);
  const programs = departments.flatMap((department) => department.programs);
  const parents = entity === "department" ? taxonomy.schools : entity === "program" ? departments : entity === "unit" ? programs : [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/taxonomy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json().catch(() => null);
    setMessage(response.ok ? "Taxonomy item created." : json?.error ?? "Could not create item.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <label className="grid gap-2 text-sm font-medium">Entity<Select name="entity" value={entity} onChange={(event) => setEntity(event.target.value)}>
        <option value="school">School</option><option value="department">Department</option><option value="program">Program</option><option value="unit">Unit</option><option value="year">Academic year</option>
      </Select></label>
      {parents.length ? (
        <label className="grid gap-2 text-sm font-medium">Parent<Select name="parentId" required><option value="">Choose parent</option>{parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.name}</option>)}</Select></label>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">Name<Input name="name" required /></label>
      {entity !== "year" ? <label className="grid gap-2 text-sm font-medium">Code<Input name="code" /></label> : null}
      {entity === "unit" ? <label className="grid gap-2 text-sm font-medium">Description<Textarea name="description" /></label> : null}
      {message ? <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{message}</p> : null}
      <Button type="submit"><Plus size={17} /> Add item</Button>
    </form>
  );
}
