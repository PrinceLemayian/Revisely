"use client";

import { FormEvent, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";

type Taxonomy = {
  schools: Array<{ id: string; departments: Array<{ programs: Array<{ units: Array<{ id: string; code: string; name: string }> }> }> }>;
  resourceTypes: Array<{ id: string; name: string }>;
  academicYears: Array<{ id: string; label: string }>;
  semesters: Array<{ id: string; name: string }>;
};

export function StudentResourceForm({ taxonomy, schoolId }: { taxonomy: Taxonomy; schoolId?: string | null }) {
  const [message, setMessage] = useState("");
  const schools = schoolId ? taxonomy.schools.filter((school) => school.id === schoolId) : taxonomy.schools;
  const units = schools.flatMap((school) => school.departments.flatMap((department) => department.programs.flatMap((program) => program.units)));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Submitting for review...");
    const response = await fetch("/api/resources", { method: "POST", body: new FormData(event.currentTarget) });
    const json = await response.json().catch(() => null);
    setMessage(response.ok ? "Paper submitted. An admin must approve it before it appears in the school catalog." : json?.error ?? "Submission failed.");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Title<Input name="title" required minLength={3} /></label>
        <label className="grid gap-2 text-sm font-medium">Unit<Select name="unitId" required><option value="">Choose unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.code} · {unit.name}</option>)}</Select></label>
        <label className="grid gap-2 text-sm font-medium">Type<Select name="resourceTypeId" required><option value="">Choose type</option>{taxonomy.resourceTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</Select></label>
        <label className="grid gap-2 text-sm font-medium">Academic year<Select name="academicYearId" required><option value="">Choose year</option>{taxonomy.academicYears.map((year) => <option key={year.id} value={year.id}>{year.label}</option>)}</Select></label>
        <label className="grid gap-2 text-sm font-medium">Semester<Select name="semesterId"><option value="">Not specified</option>{taxonomy.semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}</Select></label>
      </div>
      <label className="grid gap-2 text-sm font-medium">Description<Textarea name="description" required minLength={10} /></label>
      <label className="grid gap-2 text-sm font-medium">File<Input name="file" type="file" required accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.webp" /></label>
      <p className="text-sm text-slate-600">Your submission will remain private until an admin confirms that it is eligible for the selected school and unit.</p>
      {message ? <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{message}</p> : null}
      <Button type="submit"><Upload size={17} /> Submit for review</Button>
    </form>
  );
}
