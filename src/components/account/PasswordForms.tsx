"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Alert, Field } from "./ui";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Geçerli bir e-posta girin.");
    start(async () => {
      try {
        await createClient().auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/sifre-yenile`,
        });
      } catch {
        // Hesap var/yok bilgisini sızdırmamak için her durumda aynı mesaj
      }
      setDone(true);
    });
  }

  if (done) {
    return (
      <Alert tone="success">
        Bu e-postaya kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu
        (ve spam klasörünü) kontrol edin.
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field id="email" label="E-posta" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" className="w-full justify-center" disabled={pending} aria-busy={pending}>
        {pending ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
      </Button>
    </form>
  );
}

export function ChangePasswordForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setOk(false);
    if (password.length < 8) return setError("Şifre en az 8 karakter olmalı.");
    if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(password) || !/\d/.test(password)) {
      return setError("Şifre en az bir harf ve bir rakam içermeli.");
    }
    if (password !== password2) return setError("Şifreler aynı değil.");
    start(async () => {
      const { error: err } = await createClient().auth.updateUser({ password });
      if (err) {
        setError(
          /session/i.test(err.message)
            ? "Oturum bulunamadı. Şifre sıfırlama bağlantısını yeniden isteyin."
            : "Şifre güncellenemedi. Farklı bir şifre deneyin.",
        );
        return;
      }
      setPassword("");
      setPassword2("");
      setOk(true);
      if (redirectTo) {
        router.replace(redirectTo);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field id="newPassword" label="Yeni şifre" type="password" autoComplete="new-password" hint="En az 8 karakter, harf ve rakam içermeli." value={password} onChange={(e) => setPassword(e.target.value)} />
      <Field id="newPassword2" label="Yeni şifre (tekrar)" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
      {error ? <Alert>{error}</Alert> : null}
      {ok ? <Alert tone="success">Şifreniz güncellendi.</Alert> : null}
      <Button type="submit" className="w-full justify-center sm:w-auto" disabled={pending} aria-busy={pending}>
        {pending ? "Kaydediliyor…" : "Şifreyi güncelle"}
      </Button>
    </form>
  );
}
