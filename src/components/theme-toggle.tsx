"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/**
 * A compact icon button that toggles between light and dark mode.
 * Renders nothing until the theme is resolved on the client to avoid
 * a hydration mismatch (the server always renders with no .dark class).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={[
        "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border transition",
        "border-slate-200 bg-white text-slate-600 hover:border-spruce hover:text-spruce",
        "dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-spruce dark:hover:text-teal-400",
        className ?? ""
      ].join(" ")}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
