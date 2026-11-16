"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AccountNav({ showKitchen, showAdmin }: { showKitchen: boolean; showAdmin: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/hesabim", label: "Siparişlerim", active: pathname === "/hesabim" || pathname.startsWith("/hesabim/siparisler") },
    { href: "/hesabim/profil", label: "Profil", active: pathname.startsWith("/hesabim/profil") },
    { href: "/hesabim/adresler", label: "Adreslerim", active: pathname.startsWith("/hesabim/adresler") },
    ...(showKitchen ? [{ href: "/mutfak", label: "Mutfak paneli", active: false }] : []),
    ...(showAdmin ? [{ href: "/yonetim", label: "Yönetim", active: false }] : []),
  ];
  return (
    <nav aria-label="Hesap menüsü" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex gap-2">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                item.active
                  ? "border-[#d4af37]/55 bg-[#d4af37]/15 text-[#fde68a]"
                  : "border-white/12 text-[var(--foreground-muted)] hover:border-white/25 hover:text-[var(--foreground)]",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await createClient().auth.signOut();
          router.replace("/");
          router.refresh();
        })
      }
      className={cn(
        "inline-flex min-h-10 items-center rounded-full border border-white/12 px-4 text-sm font-medium text-[var(--foreground-muted)] hover:border-white/25 hover:text-[var(--foreground)] disabled:opacity-50",
        className,
      )}
    >
      {pending ? "Çıkış…" : "Çıkış yap"}
    </button>
  );
}
