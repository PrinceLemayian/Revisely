"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Bot, Gauge, Menu, Search, ShieldCheck, X } from "lucide-react";

type MobileNavProps = {
  role?: "student" | "admin" | null;
  isAuthenticated: boolean;
};

const baseLinks = [
  { href: "/search", label: "Search", Icon: Search },
  { href: "/resources", label: "Browse", Icon: BookOpen },
  { href: "/assistant", label: "Assistant", Icon: Bot },
  { href: "/dashboard", label: "Dashboard", Icon: Gauge }
] as const;

export function MobileNav({ role, isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll while the overlay is open.
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  const links = [...baseLinks];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-ink hover:border-spruce"
      >
        <Menu size={20} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            className="absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="flex items-center gap-2 font-bold tracking-tight text-ink">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-spruce text-white">
                  <BookOpen size={18} />
                </span>
                Revisely
              </span>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 text-sm font-medium text-slate-700">
              {links.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={
                      active
                        ? "focus-ring flex items-center gap-3 rounded-lg bg-mint px-3 py-3 text-spruce"
                        : "focus-ring flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-100"
                    }
                  >
                    <Icon size={18} /> {label}
                  </Link>
                );
              })}
              {role === "student" ? (
                <Link
                  href="/submit"
                  className="focus-ring flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-100"
                >
                  <BookOpen size={18} /> Submit paper
                </Link>
              ) : null}
              {role === "admin" ? (
                <Link
                  href="/admin/resources"
                  className="focus-ring flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-100"
                >
                  <ShieldCheck size={18} /> Admin
                </Link>
              ) : null}
            </nav>

            <div className="border-t border-slate-200 p-3">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.assign("/login");
                  }}
                  className="focus-ring flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-spruce hover:text-spruce"
                >
                  Log out
                </button>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    className="focus-ring flex w-full items-center justify-center rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink hover:border-spruce"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="focus-ring flex w-full items-center justify-center rounded-md bg-spruce px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
