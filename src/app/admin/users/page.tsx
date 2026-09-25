import { Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function AdminUsersPage() {
  await requireAdmin();
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-spruce"><Users size={20} /></span>
        <h1 className="mt-5 text-2xl font-bold text-ink">User management</h1>
        <p className="mt-2 max-w-xl text-slate-600">User search, role changes, suspension, and account removal are ready for the next admin workspace phase.</p>
      </div>
    </main>
  );
}
