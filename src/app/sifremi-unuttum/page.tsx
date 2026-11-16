import type { Metadata } from "next";
import { AuthShell } from "@/components/account/ui";
import { ForgotPasswordForm } from "@/components/account/PasswordForms";

export const metadata: Metadata = { title: "Şifremi unuttum", robots: { index: false } };

export default function SifremiUnuttumPage() {
  return (
    <AuthShell title="Şifremi unuttum" subtitle="E-posta adresinize şifre sıfırlama bağlantısı gönderelim.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
