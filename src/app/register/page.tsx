import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-65px)] bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-spruce text-white shadow-sm"><BookOpen size={24} /></Link>
        <div className="mt-7 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Browse, save, and share useful resources with your campus community.</p>
        </div>
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-7"><AuthForm mode="register" /></div>
        <p className="mt-5 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-spruce" href="/login">Sign in</Link></p>
      </div>
    </main>
  );
}
