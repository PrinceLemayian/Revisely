import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2, Clock3, Files, GraduationCap, LucideIcon, Plus, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resourceInclude } from "@/repositories/resources";

async function getOverview() {
  const [resources, pending, users, schools, units, recent] = await Promise.all([
    prisma.resource.count({ where: { status: "published" } }),
    prisma.resource.count({ where: { reviewStatus: "pending" } }),
    prisma.user.count(),
    prisma.school.count(),
    prisma.unit.count(),
    prisma.resource.findMany({ include: resourceInclude, orderBy: { createdAt: "desc" }, take: 6 })
  ]);
  return { resources, pending, users, schools, units, recent };
}

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const overview = await getOverview();
  const stats: { icon: LucideIcon; label: string; value: number }[] = [
    { icon: Files, label: "Published resources", value: overview.resources },
    { icon: Clock3, label: "Pending verification", value: overview.pending },
    { icon: Users, label: "Registered users", value: overview.users },
    { icon: GraduationCap, label: "Schools", value: overview.schools },
    { icon: BookOpen, label: "Units", value: overview.units }
  ];
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-spruce">Admin workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Good to see you, {user.name.split(" ")[0]}.</h1><p className="mt-2 text-slate-600">Keep Revisely accurate, useful, and ready for the next student.</p></div>
        <Link href="/admin/resources" className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-spruce px-4 text-sm font-semibold text-white hover:bg-teal-800"><Plus size={17} /> Add resource</Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ icon: Icon, label, value }) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-mint text-spruce"><Icon size={18} /></span>{label === "Pending verification" && value > 0 ? <span className="h-2.5 w-2.5 rounded-full bg-coral" /> : null}</div><p className="mt-5 text-3xl font-bold text-ink">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-ink">Recent activity</h2><p className="mt-1 text-sm text-slate-500">The latest resources entering your catalog.</p></div><Link href="/admin/resources" className="text-sm font-semibold text-spruce">View all <ArrowUpRight className="inline" size={14} /></Link></div>
          <div className="mt-5 divide-y divide-slate-100">
            {overview.recent.map((resource) => <div key={resource.id} className="flex items-start gap-3 py-4 first:pt-0"><span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-spruce"><Files size={16} /></span><div className="min-w-0 flex-1"><p className="text-sm text-ink"><span className="font-semibold">{resource.uploadedBy.name}</span> uploaded <span className="font-semibold">{resource.fileName}</span></p><p className="mt-1 text-xs text-slate-500">{resource.unit.code} · {resource.unit.name} · {resource.reviewStatus === "pending" ? "Awaiting review" : resource.reviewStatus === "rejected" ? "Rejected" : "Published"}</p></div><span className="shrink-0 text-xs text-slate-400">{new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short" }).format(new Date(resource.createdAt))}</span></div>)}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold text-ink">Quick actions</h2><div className="mt-4 grid gap-2"><Link href="/admin/taxonomy" className="focus-ring flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-semibold text-ink hover:border-teal-200 hover:bg-mint"><span className="flex items-center gap-3"><Plus size={17} className="text-spruce" /> Add unit</span><ArrowUpRight size={15} className="text-slate-400" /></Link><Link href="/admin/review" className="focus-ring flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-semibold text-ink hover:border-teal-200 hover:bg-mint"><span className="flex items-center gap-3"><CheckCircle2 size={17} className="text-spruce" /> Review pending</span><span className="rounded-full bg-coral/10 px-2 py-0.5 text-xs text-coral">{overview.pending}</span></Link><Link href="/admin/users" className="focus-ring flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-semibold text-ink hover:border-teal-200 hover:bg-mint"><span className="flex items-center gap-3"><Users size={17} className="text-spruce" /> Manage users</span><ArrowUpRight size={15} className="text-slate-400" /></Link></div></section>
      </div>
    </main>
  );
}
