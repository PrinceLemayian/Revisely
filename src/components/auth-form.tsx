"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [audience, setAudience] = useState<"student" | "admin">("student");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      setError(json?.error ?? "Something went wrong.");
      return;
    }
    const json = await response.json().catch(() => null);
    const role = json?.user?.role;
    if (role !== "admin" && role !== "student") {
      setError("Login succeeded, but the account role could not be determined.");
      return;
    }
    // Reload after the cookie is set so the destination reads the fresh session on the server.
    window.location.assign(role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {mode === "login" ? (
        <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1" role="tablist" aria-label="Login type">
          {([
            ["student", "Student login", UserRound],
            ["admin", "Admin login", ShieldCheck]
          ] as const).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={audience === value}
              onClick={() => setAudience(value)}
              className={audience === value ? "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-spruce shadow-sm" : "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium text-slate-500 hover:text-ink"}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      ) : null}
      {mode === "register" ? (
        <>
          <label className="grid gap-2 text-sm font-medium">Name<Input name="name" required minLength={2} /></label>
        </>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">Email<Input name="email" type="email" required /></label>
      <label className="grid gap-2 text-sm font-medium">Password<Input name="password" type="password" required minLength={8} /></label>
      {mode === "login" ? <div className="flex justify-end"><Link href="mailto:support@revisely.test?subject=Password%20reset%20request" className="text-sm font-semibold text-spruce hover:text-teal-800">Forgot password?</Link></div> : null}
      {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={loading} className="h-12">{loading ? "Please wait..." : mode === "login" ? <>Log in <ArrowRight size={17} /></> : "Create account"}</Button>
    </form>
  );
}
