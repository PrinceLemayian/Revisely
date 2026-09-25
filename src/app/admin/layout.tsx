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
            <nav className="mt-3 grid gap-1 border-t border-slate-100 pt-3 text-sm"><Link href="/admin">Dashboard</Link><Link href="/admin/review">Pending review</Link><Link href="/admin/taxonomy">Units & taxonomy</Link><Link href="/admin/resources">Resources</Link><Link href="/admin/stats">Analytics</Link><Link href="/">Back to Revisely</Link></nav>
          </details>
        </div>
        {children}
      </div>
    </div>
  );
}
