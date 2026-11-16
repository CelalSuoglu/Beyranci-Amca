"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { normalizeTurkishPhone } from "@/lib/orders/format";
import { Alert, Field } from "./ui";

export function ProfileForm({
  userId,
  email,
  initialName,
  initialPhone,
}: {
  userId: string;
  email: string;
  initialName: string;
  initialPhone: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setOk(false);
    const name = fullName.trim();
    const normalized = phone.trim() ? normalizeTurkishPhone(phone) : null;
    if (name.length < 3) return setError("Ad soyad en az 3 karakter olmalı.");
    if (phone.trim() && !normalized) return setError("Geçerli bir cep telefonu girin.");
    start(async () => {
      // Sadece ad ve telefon güncellenebilir; rol kolonu veritabanında kilitli
      const { error: err } = await createClient()
        .from("profiles")
        .update({ full_name: name, phone: normalized })
        .eq("id", userId);
      if (err) {
        setError("Bilgiler kaydedilemedi.");
        return;
      }
      setOk(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field id="email" label="E-posta" value={email} disabled readOnly />
      <Field id="fullName" label="Ad soyad" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Field id="phone" label="Cep telefonu" type="tel" inputMode="tel" autoComplete="tel" placeholder="05XX XXX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
      {error ? <Alert>{error}</Alert> : null}
      {ok ? <Alert tone="success">Bilgileriniz kaydedildi.</Alert> : null}
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}

export function DeleteAccount() {
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function remove() {
    if (confirm.trim().toLocaleUpperCase("tr-TR") !== "SİL") {
      setError("Onaylamak için kutuya SİL yazın.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await fetch("/api/account", { method: "DELETE" });
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(body?.error ?? "Hesap silinemedi.");
        return;
      }
      await createClient().auth.signOut();
      window.location.replace("/");
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
        Hesabınız, profiliniz ve kayıtlı adresleriniz kalıcı olarak silinir. Geçmiş siparişler yasal
        kayıt olarak işletmede kalır ancak hesabınızla bağlantısı kaldırılır. Bu işlem geri alınamaz.
      </p>
      <Field id="confirmDelete" label="Onay için SİL yazın" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
      {error ? <Alert>{error}</Alert> : null}
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full border border-red-500/50 px-5 text-sm font-semibold text-[#fecaca] hover:bg-red-950/40 disabled:opacity-50"
      >
        {pending ? "Siliniyor…" : "Hesabımı sil"}
      </button>
    </div>
  );
}
