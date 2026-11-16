import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/ui";
import { LoginForm } from "@/components/account/LoginForm";

export const metadata: Metadata = { title: "Giriş yap", robots: { index: false } };

export default function GirisPage() {
  return (
    <AuthShell title="Giriş yap" subtitle="Siparişlerinizi takip etmek ve bilgilerinizi kaydetmek için.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
