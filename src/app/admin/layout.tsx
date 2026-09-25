import Link from "next/link";
import { Menu } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();
  return (
    <div className="min-h-[calc(100vh-65px)] bg-cloud lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <details>
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden"><span className="flex items-center gap-2"><Menu size={18} /> Admin workspace</span><span className="text-xs text-slate-500">{user.name}</span></summary>
            <nav className="mt-3 grid gap-1 border-t border-slate-100 pt-3 text-sm font-medium text-slate-700">
              <Link href="/admin" className="focus-ring rounded-lg px-3 py-2.5 hover:bg-mint hover:text-spruce">Dashboard</Link>
              <Link href="/admin/review" className="focus-ring rounded-lg px-3 py-2.5 hover:bg-mint hover:text-spruce">Pending review</Link>
              <Link href="/admin/taxonomy" className="focus-ring rounded-lg px-3 py-2.5 hover:bg-mint hover:text-spruce">Units & taxonomy</Link>
              <Link href="/admin/resources" className="focus-ring rounded-lg px-3 py-2.5 hover:bg-mint hover:text-spruce">Resources</Link>
              <Link href="/admin/stats" className="focus-ring rounded-lg px-3 py-2.5 hover:bg-mint hover:text-spruce">Analytics</Link>
              <Link href="/admin/users" className="focus-ring rounded-lg px-3 py-2.5 hover:bg-mint hover:text-spruce">Users</Link>
              <Link href="/" className="focus-ring rounded-lg px-3 py-2.5 text-slate-500 hover:bg-slate-100">Back to Revisely</Link>
            </nav>
          </details>
        </div>
        {children}
      </div>
    </div>
  );
}
