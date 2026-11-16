import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountNav, LogoutButton } from "@/components/account/AccountNav";
import { brand } from "@/lib/brand";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Hesabım", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function HesabimLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/hesabim");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role as string | undefined) ?? "customer";

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--surface)]/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={`${site.name} ana sayfa`}>
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1a0f0c] ring-2 ring-[#d4af37]/25">
              <Image src={brand.logoSrc} alt={brand.logoAltNav} width={40} height={40} className="object-contain" />
            </span>
            <span className="truncate font-[family-name:var(--font-display)] font-semibold">{site.name}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/siparis" className="hidden min-h-10 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] sm:inline-flex">
              Sipariş ver
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">Hesabım</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl">
          Merhaba{profile?.full_name ? `, ${String(profile.full_name).split(" ")[0]}` : ""}
        </h1>
        <div className="mt-5">
          <AccountNav showKitchen={role === "staff" || role === "admin"} showAdmin={role === "admin"} />
        </div>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
