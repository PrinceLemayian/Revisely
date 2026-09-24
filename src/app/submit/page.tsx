import { requireUser } from "@/lib/auth";
import { getTaxonomy } from "@/repositories/taxonomy";
import { StudentResourceForm } from "@/components/student-resource-form";

export default async function SubmitResourcePage() {
  const user = await requireUser();
  const taxonomy = await getTaxonomy();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">Submit a paper</h1>
      <p className="mt-2 text-slate-600">Share a useful academic resource with your school. An admin will check it before publication.</p>
      <div className="mt-6"><StudentResourceForm taxonomy={taxonomy} schoolId={user.schoolId} /></div>
    </main>
  );
}
