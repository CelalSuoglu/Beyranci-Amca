import type { Metadata } from "next";
import Link from "next/link";
import { KitchenDashboard } from "@/components/orders/KitchenDashboard";
import { KitchenLogoutButton } from "@/components/orders/KitchenLogoutButton";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mutfak Paneli",
  robots: { index: false, follow: false },
};

export default function MutfakPage() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
            {site.name}
          </p>
          <Link
            href="/"
            className="mt-1 inline-block text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]"
          >
            Ana siteye git
          </Link>
        </div>
        <KitchenLogoutButton />
      </div>
      <KitchenDashboard />
    </div>
  );
}
