"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with undefined to avoid a flash before we read localStorage.
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  // Read the persisted preference once on mount.
  useEffect(() => {
    const stored = localStorage.getItem("revisely-theme") as Theme | null;
    const preferred = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  function toggle() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("revisely-theme", next);
      applyTheme(next);
      return next;
    });
  }

  // Provide a stable value while the theme is still initialising (SSR / first paint).
  const value: ThemeContextValue = {
    theme: theme ?? "light",
    toggle
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
