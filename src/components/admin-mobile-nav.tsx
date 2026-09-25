"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, BookOpenCheck, FileCheck2, Files, LayoutDashboard, Menu, Settings2, Users, X } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  ["/admin", "Dashboard", LayoutDashboard],
  ["/admin/review", "Pending review", FileCheck2],
  ["/admin/taxonomy", "Units & taxonomy", Settings2],
  ["/admin/resources", "Resources", Files],
  ["/admin/stats", "Analytics", BarChart3],
  ["/admin/users", "Users", Users]
] as const;

export function AdminMobileNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer after navigation and prevent the page from scrolling behind it.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-spruce text-white"><BookOpenCheck size={19} /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">Admin workspace</p>
            <p className="truncate text-xs text-slate-500">{links.find(([href]) => href === pathname)?.[1] ?? "Navigation"}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={open ? "Close admin navigation" : "Open admin navigation"}
          aria-expanded={open}
          aria-controls="admin-mobile-navigation"
          onClick={() => setOpen((current) => !current)}
          className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-ink hover:border-spruce hover:text-spruce"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div id="admin-mobile-navigation" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button type="button" aria-label="Close admin navigation" className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(21rem,88vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-spruce text-white"><BookOpenCheck size={19} /></span>
                <div><p className="text-sm font-bold text-ink">Admin workspace</p><p className="text-xs text-slate-500">Manage Revisely</p></div>
              </div>
              <button type="button" aria-label="Close admin navigation" onClick={() => setOpen(false)} className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-ink"><X size={20} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4" aria-label="Admin sections">
              <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
              <div className="mt-3 grid gap-1">
                {links.map(([href, label, Icon]) => {
                  const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
                  return (
                    <Link key={href} href={href} className={active ? "focus-ring flex items-center gap-3 rounded-lg bg-mint px-3 py-3 text-sm font-semibold text-spruce" : "focus-ring flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"}>
                      <Icon size={18} />
                      <span className="flex-1">{label}</span>
                      {href === "/admin/review" && pendingCount > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1.5 text-[11px] font-bold text-white">{pendingCount}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="border-t border-slate-200 p-4">
              <Link href="/" className="focus-ring flex items-center justify-center rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-spruce hover:text-spruce">Back to Revisely</Link>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
