import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const fieldClass = cn(
  "mt-1.5 w-full min-w-0 rounded-xl border border-white/12 bg-black/25 px-3 py-3 text-base text-[var(--foreground)] sm:text-sm",
  "placeholder:text-[var(--foreground-muted)]/70",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
  "disabled:opacity-60",
);

export function Field({
  label,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input id={id} {...props} className={fieldClass} />
      {hint ? <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">{hint}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <textarea id={id} {...props} className={cn(fieldClass, "resize-y")} />
    </div>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm leading-relaxed",
        tone === "error" && "border-red-500/30 bg-red-950/40 text-[#fecaca]",
        tone === "success" && "border-emerald-500/30 bg-emerald-950/40 text-emerald-100",
        tone === "info" && "border-[#d4af37]/35 bg-[#d4af37]/10 text-[#fde68a]",
      )}
    >
      {children}
    </p>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-5 sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Giriş / kayıt sayfaları için ortalanmış kabuk */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
      <Link href="/" className="mb-8 flex items-center gap-3" aria-label={`${site.name} ana sayfa`}>
        <span className="relative flex h-12 w-12 overflow-hidden rounded-full bg-[#1a0f0c] ring-2 ring-[#d4af37]/25">
          <Image src={brand.logoSrc} alt={brand.logoAltNav} width={48} height={48} className="object-contain" />
        </span>
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold">{site.name}</span>
      </Link>
      <Card className="w-full max-w-md">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-[var(--foreground-muted)]">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </Card>
    </div>
  );
}

export function safeNext(raw: string | null | undefined, fallback = "/hesabim"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
