import Link from "next/link";
import { BarChart3, BookOpenCheck, Building2, FileCheck2, Files, LayoutDashboard, Settings2, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

const links = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/review", "Pending review", FileCheck2],
  ["/admin/taxonomy", "Units & taxonomy", Settings2],
  ["/admin/resources", "Resources", Files],
  ["/admin/stats", "Analytics", BarChart3]
] as const;

export async function AdminSidebar() {
  const pendingCount = await prisma.resource.count({ where: { reviewStatus: "pending" } });

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-5">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-spruce text-white"><BookOpenCheck size={20} /></span>
          Revisely <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Admin</span>
        </Link>
        <p className="mt-10 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <nav className="mt-3 grid gap-1">
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-mint hover:text-spruce">
              <Icon size={18} /> <span className="flex-1">{label}</span>{href === "/admin/review" && pendingCount > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1.5 text-[11px] font-bold text-white">{pendingCount}</span> : null}
            </Link>
          ))}
        </nav>
        <p className="mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Manage</p>
        <nav className="mt-3 grid gap-1">
          <Link href="/admin/taxonomy" className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-mint hover:text-spruce"><Building2 size={18} /> Schools & units</Link>
          <Link href="/admin/users" className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-mint hover:text-spruce"><Users size={18} /> Users</Link>
        </nav>
        <div className="mt-auto rounded-lg bg-navy p-4 text-white">
          <p className="text-sm font-semibold">Keep the catalog trusted.</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Review student uploads before they reach the campus library.</p>
          <Link href="/admin/review" className="mt-3 inline-flex text-xs font-bold text-teal-200 hover:text-white">Open review queue →</Link>
        </div>
      </div>
    </aside>
  );
}
