import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/account/AccountNav";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Yönetim", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function YonetimLayout({ children }: { children: ReactNode }) {
  // Middleware'e ek olarak sunucuda tekrar kontrol
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris?next=/yonetim");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/?error=yetki");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[var(--surface)]/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">{site.name}</p>
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold">Yönetim paneli</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/mutfak" className="inline-flex min-h-10 items-center rounded-full border border-white/12 px-4 text-sm hover:border-white/25">
              Siparişler
            </Link>
            <LogoutButton />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <AdminNav />
        </div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
