"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/yonetim", label: "Ürünler" },
  { href: "/yonetim/kategoriler", label: "Kategoriler" },
  { href: "/yonetim/kullanicilar", label: "Kullanıcılar ve yetkiler" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Yönetim menüsü" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex gap-2">
        {ITEMS.map((item) => {
          const active = item.href === "/yonetim" ? pathname === "/yonetim" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium",
                  active ? "border-[#d4af37]/55 bg-[#d4af37]/15 text-[#fde68a]" : "border-white/12 text-[var(--foreground-muted)] hover:border-white/25",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
