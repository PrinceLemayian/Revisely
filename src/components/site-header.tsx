import Link from "next/link";
import { BookOpen, Bot, Gauge, Search, ShieldCheck, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { MobileNav } from "@/components/mobile-nav";

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="group flex items-center gap-2 font-bold tracking-tight text-ink">
          <span className="grid h-9 w-9 rounded-lg bg-spruce text-white shadow-sm transition group-hover:-rotate-3 group-hover:bg-teal-700 place-items-center">
            <BookOpen size={20} />
          </span>
          Revisely
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 lg:flex">
          <Link className="focus-ring flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="/search"><Search size={16} /> Search</Link>
          <Link className="focus-ring flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="/resources"><BookOpen size={16} /> Browse</Link>
          <Link className="focus-ring flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="/assistant"><Bot size={16} /> Assistant</Link>
          <Link className="focus-ring flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard"><Gauge size={16} /> Dashboard</Link>
          {user?.role === "student" ? (
            <Link className="focus-ring flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="/submit"><BookOpen size={16} /> Submit paper</Link>
          ) : null}
          {user?.role === "admin" ? (
            <Link className="focus-ring flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100" href="/admin/resources"><ShieldCheck size={16} /> Admin</Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink href="/dashboard" variant="secondary" className="hidden sm:inline-flex"><Sparkles size={15} /> {user.name.split(" ")[0]}</ButtonLink>
              <div className="hidden lg:block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">Sign in</ButtonLink>
              <ButtonLink href="/register" className="hidden sm:inline-flex">Get started</ButtonLink>
            </>
          )}
          <MobileNav role={user?.role ?? null} isAuthenticated={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
