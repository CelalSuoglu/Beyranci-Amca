import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuestTracker } from "@/components/account/GuestTracker";

export const metadata: Metadata = { title: "Sipariş takibi", robots: { index: false, follow: false } };

export default async function TakipPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 sm:px-6">
      <Link href="/" className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent-soft)]">← Ana sayfa</Link>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl">Sipariş takibi</h1>
      <div className="mt-6">
        <GuestTracker token={token} />
      </div>
    </main>
  );
}
