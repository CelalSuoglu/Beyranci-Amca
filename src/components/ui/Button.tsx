import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const base = cn(
  "inline-flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide transition-[transform,box-shadow,background-color,border-color,color,filter] duration-200",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--ring)]",
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
);

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-[var(--accent)] text-[var(--accent-foreground)]",
    "shadow-[0_8px_24px_-6px_rgba(234,88,12,0.45)] hover:brightness-[1.08] hover:shadow-[0_12px_28px_-6px_rgba(234,88,12,0.4)]",
  ),
  outline: cn(
    "border border-[var(--border-strong)] bg-transparent text-[var(--foreground)]",
    "hover:border-[color-mix(in_srgb,var(--gold)_45%,transparent)] hover:text-[var(--accent-soft)]",
  ),
  ghost: cn(
    "text-[var(--foreground-muted)] hover:bg-white/[0.06] hover:text-[var(--foreground)]",
  ),
};

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type AnchorProps = Common &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

type NativeButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

export function Button(props: AnchorProps | NativeButtonProps) {
  const { children, variant = "primary", className = "", ...rest } = props;
  const cls = cn(base, variants[variant], className);

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
