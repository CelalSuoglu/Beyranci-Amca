import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/ui";
import { RegisterForm } from "@/components/account/RegisterForm";

export const metadata: Metadata = { title: "Üye ol", robots: { index: false } };

export default function KayitPage() {
  return (
    <AuthShell title="Üye ol" subtitle="Adreslerinizi kaydedin, siparişlerinizi canlı takip edin.">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
