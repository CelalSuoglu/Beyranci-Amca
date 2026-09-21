"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function KitchenLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const configError = searchParams.get("error") === "config";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError("E-posta veya şifre hatalı.");
          return;
        }

        const next = searchParams.get("next");
        router.replace(next?.startsWith("/mutfak") ? next : "/mutfak");
        router.refresh();
      } catch {
        setError(
          "Giriş yapılamadı. Supabase ayarlarını kontrol edin veya daha sonra tekrar deneyin.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md rounded-2xl border border-white/[0.08] bg-[var(--surface)] p-6 sm:p-8"
      noValidate
    >
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        Mutfak girişi
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground-muted)]">
        Yetkili personel için e-posta ve şifre ile oturum açın.
      </p>

      {configError ? (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-sm text-amber-100" role="alert">
          Supabase ortam değişkenleri henüz yapılandırılmamış. Vercel / `.env.local`
          ayarlarını tamamlayın.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[#fecaca]" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="mt-6 w-full justify-center"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
    </form>
  );
}

const fieldClass = cn(
  "mt-1.5 w-full rounded-xl border border-white/12 bg-black/25 px-3 py-3 text-[var(--foreground)]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
);
