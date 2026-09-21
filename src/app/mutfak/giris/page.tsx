import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { KitchenLoginForm } from "@/components/orders/KitchenLoginForm";

export const metadata: Metadata = {
  title: "Mutfak Girişi",
  robots: { index: false, follow: false },
};

export default function MutfakGirisPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-4 py-16">
      <Suspense
        fallback={
          <p className="text-center text-[var(--foreground-muted)]">
            Yükleniyor…
          </p>
        }
      >
        <KitchenLoginForm />
      </Suspense>
      <p className="mt-8 text-center text-sm text-[var(--foreground-muted)]">
        <Link href="/" className="hover:text-[var(--accent-soft)]">
          Ana sayfaya dön
        </Link>
      </p>
    </div>
  );
}
