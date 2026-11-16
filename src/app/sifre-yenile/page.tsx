import type { Metadata } from "next";
import { AuthShell } from "@/components/account/ui";
import { ChangePasswordForm } from "@/components/account/PasswordForms";

export const metadata: Metadata = { title: "Yeni şifre", robots: { index: false } };

export default function SifreYenilePage() {
  return (
    <AuthShell title="Yeni şifre belirleyin">
      <ChangePasswordForm redirectTo="/hesabim" />
    </AuthShell>
  );
}
