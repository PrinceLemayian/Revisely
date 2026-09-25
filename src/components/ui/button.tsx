import Link from "next/link";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-spruce text-white hover:bg-teal-800",
  secondary: "bg-white text-ink border border-slate-200 hover:border-spruce",
  ghost: "bg-transparent text-ink hover:bg-slate-100",
  danger: "bg-coral text-white hover:bg-red-700"
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children
}: PropsWithChildren<{ href: string; variant?: Variant; className?: string }>) {
  return (
    <Link
      href={href}
      className={clsx(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition",
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
}
}
