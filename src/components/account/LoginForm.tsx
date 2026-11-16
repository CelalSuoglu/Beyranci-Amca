"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Alert, Field, safeNext } from "./ui";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const next = safeNext(params.get("next"));
  const linkError = params.get("error") === "link";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    start(async () => {
      try {
        const { error: err } = await createClient().auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) {
          if (/not confirmed/i.test(err.message)) {
            setError("E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzdaki bağlantıya tıklayın.");
          } else {
            setError("E-posta veya şifre hatalı.");
          }
          return;
        }
        router.replace(next);
        router.refresh();
      } catch {
        setError("Giriş yapılamadı. İnternet bağlantınızı kontrol edin.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {linkError ? (
        <Alert>Bağlantının süresi dolmuş veya geçersiz. Lütfen tekrar deneyin.</Alert>
      ) : null}
      <Field id="email" label="E-posta" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field id="password" label="Şifre" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="text-right text-sm">
        <Link href="/sifremi-unuttum" className="text-[#fdba74] underline-offset-2 hover:underline">
          Şifremi unuttum
        </Link>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" className="w-full justify-center" disabled={pending} aria-busy={pending}>
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
      <p className="text-center text-sm text-[var(--foreground-muted)]">
        Hesabınız yok mu?{" "}
        <Link href={`/kayit${next !== "/hesabim" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-[#fdba74] underline-offset-2 hover:underline">
          Üye olun
        </Link>
      </p>
    </form>
  );
}
