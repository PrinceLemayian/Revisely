import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2 } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-white">
      <div className="grid min-h-[calc(100vh-65px)] lg:grid-cols-2">
        <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">
            <Link href="/" className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-spruce text-white shadow-sm"><BookOpen size={24} /></Link>
            <div className="mt-7 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Welcome back</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Sign in to find your next useful resource.</p>
            </div>
            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-7"><AuthForm mode="login" /></div>
            <p className="mt-5 text-center text-sm text-slate-600">Don't have an account? <Link className="font-semibold text-spruce hover:text-teal-800" href="/register">Sign up <ArrowUpRight className="inline" size={14} /></Link></p>
          </div>
        </section>
        <section className="pattern-grid relative hidden overflow-hidden lg:flex lg:items-center lg:px-16 xl:px-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[36px] border-teal-300/15" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[42px] border-cyan-200/10" aria-hidden="true" />
          <div className="relative max-w-lg text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/30 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-100"><CheckCircle2 size={14} /> Study with context</div>
            <h2 className="mt-6 text-4xl font-bold leading-tight xl:text-5xl">Your course materials, all in one place.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Browse by school and unit, save what matters, and ask an assistant that only points you to real Revisely resources.</p>
            <div className="mt-10 grid gap-3 text-sm text-slate-200">
              {["Search by unit code or natural language", "Keep past papers and notes together", "Get answers grounded in the catalog"].map((item) => <div key={item} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-teal-300/20 text-teal-200"><CheckCircle2 size={14} /></span>{item}</div>)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
