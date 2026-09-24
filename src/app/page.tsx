import Link from "next/link";
import { ArrowRight, BookOpen, Bot, CheckCircle2, FileSearch, GraduationCap, Search, ShieldCheck, Sparkles } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { ButtonLink } from "@/components/ui/button";
import { getTaxonomy } from "@/repositories/taxonomy";

export default async function HomePage() {
  const taxonomy = await getTaxonomy();
  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-slate-200 bg-white">
        <div className="soft-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:pt-20 lg:pb-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-teal-100 bg-mint px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-spruce">
            <Sparkles size={14} /> Built for campus life
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">Your campus library, upgraded.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Find the right notes, past papers, CATs, and assignments for your unit in seconds, then ask a grounded AI assistant for a hand.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/register" className="h-12 px-6"><ArrowRight size={18} /> Get started</ButtonLink>
            <ButtonLink href="/resources" variant="secondary" className="h-12 px-6"><BookOpen size={18} /> Browse resources</ButtonLink>
          </div>
          <div className="mx-auto mt-10 max-w-2xl text-left"><SearchForm /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            [BookOpen, "All your notes", "A single home for the materials your course actually uses."],
            [FileSearch, "Past papers", "Search by unit, year, semester, or the words students naturally use."],
            [GraduationCap, "Unit resources", "Browse a clear school-to-unit hierarchy without digging through chats."],
            [ShieldCheck, "Trusted access", "Admin-reviewed resources and grounded AI answers you can rely on."]
          ].map(([Icon, title, body]) => (
            <div key={title as string} className="group border-t border-slate-200 pt-5 transition hover:-translate-y-1">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-spruce transition group-hover:bg-spruce group-hover:text-white"><Icon size={19} /></div>
              <h2 className="mt-4 font-semibold text-ink">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <div className="grid overflow-hidden rounded-lg bg-navy text-white lg:grid-cols-[0.85fr_1.15fr]">
          <div className="p-7 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-200">A calmer way to study</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Less hunting. More learning.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Revisely keeps academic context attached to every resource, from the school it belongs to down to the semester it was used.</p>
            <ButtonLink href="/assistant" variant="secondary" className="mt-7"><Bot size={17} /> Ask the AI</ButtonLink>
          </div>
          <div className="pattern-grid p-5 sm:p-8">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-teal-100"><span>CSC220 · Database Systems</span><span>Semester 2</span></div>
              <div className="mt-4 grid gap-2">
                {["Database Systems 2024 Past Paper", "Database Systems CAT 1 Revision Pack", "Database Systems Lecture Notes Week 1-6"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-md bg-white/10 p-3 text-sm"><span className="grid h-8 w-8 place-items-center rounded-md bg-teal-300/20 text-teal-100"><CheckCircle2 size={16} /></span><span className="flex-1">{item}</span><span className="text-xs text-slate-300">{index + 1} match</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
