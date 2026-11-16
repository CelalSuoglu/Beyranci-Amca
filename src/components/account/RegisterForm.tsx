"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { normalizeTurkishPhone } from "@/lib/orders/format";
import { Alert, Field, safeNext } from "./ui";

export function RegisterForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    const name = fullName.trim();
    const normalizedPhone = normalizeTurkishPhone(phone);
    if (name.length < 3) return setError("Ad soyad en az 3 karakter olmalı.");
    if (!normalizedPhone) return setError("Geçerli bir cep telefonu girin (05XX XXX XX XX).");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Geçerli bir e-posta girin.");
    if (password.length < 8) return setError("Şifre en az 8 karakter olmalı.");
    if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(password) || !/\d/.test(password)) {
      return setError("Şifre en az bir harf ve bir rakam içermeli.");
    }
    if (password !== password2) return setError("Şifreler aynı değil.");
    if (!consent) return setError("Devam etmek için Kullanım Koşulları'nı kabul edin.");

    start(async () => {
      try {
        const { data, error: err } = await createClient().auth.signUp({
          email: email.trim(),
          password,
          options: {
            // Rol bilgisi asla buradan gönderilmez; sunucu her yeni hesabı müşteri yapar
            data: { full_name: name, phone: normalizedPhone },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (err) {
          if (/registered|exists/i.test(err.message)) {
            setError("Bu e-posta ile kayıtlı bir hesap var. Giriş yapmayı veya şifre sıfırlamayı deneyin.");
          } else if (/signups not allowed/i.test(err.message)) {
            setError("Üyelik şu anda kapalı. Lütfen daha sonra tekrar deneyin.");
          } else {
            setError("Kayıt oluşturulamadı. Bilgileri kontrol edip tekrar deneyin.");
          }
          return;
        }
        if (data.session) {
          window.location.replace(next);
          return;
        }
        setSentTo(email.trim());
      } catch {
        setError("Bağlantı kurulamadı. Tekrar deneyin.");
      }
    });
  }

  if (sentTo) {
    return (
      <div className="space-y-4">
        <Alert tone="success">
          <strong>{sentTo}</strong> adresine doğrulama bağlantısı gönderdik. Bağlantıya tıklayınca
          hesabınız açılacak. Gelen kutusunda yoksa gereksiz/spam klasörüne bakın.
        </Alert>
        <Button href="/giris" variant="outline" className="w-full justify-center">
          Giriş sayfasına dön
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field id="fullName" label="Ad soyad" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Field id="phone" label="Cep telefonu" type="tel" inputMode="tel" autoComplete="tel" placeholder="05XX XXX XX XX" required value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Field id="email" label="E-posta" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field id="password" label="Şifre" type="password" autoComplete="new-password" hint="En az 8 karakter, harf ve rakam içermeli." required value={password} onChange={(e) => setPassword(e.target.value)} />
      <Field id="password2" label="Şifre (tekrar)" type="password" autoComplete="new-password" required value={password2} onChange={(e) => setPassword2(e.target.value)} />
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[var(--foreground-muted)]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
        <span>
          <Link href="/kullanim-kosullari" target="_blank" className="text-[#fdba74] underline-offset-2 hover:underline">
            Kullanım Koşulları
          </Link>
          &apos;nı kabul ediyorum. Kişisel verilerimin{" "}
          <Link href="/gizlilik" target="_blank" className="text-[#fdba74] underline-offset-2 hover:underline">
            KVKK Aydınlatma Metni
          </Link>{" "}
          kapsamında işleneceği konusunda bilgilendirildim.
        </span>
      </label>
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" className="w-full justify-center" disabled={pending} aria-busy={pending}>
        {pending ? "Hesap oluşturuluyor…" : "Üye ol"}
      </Button>
      <p className="text-center text-sm text-[var(--foreground-muted)]">
        Zaten üye misiniz?{" "}
        <Link href="/giris" className="font-medium text-[#fdba74] underline-offset-2 hover:underline">
          Giriş yapın
        </Link>
      </p>
    </form>
  );
}
