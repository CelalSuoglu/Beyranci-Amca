"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function KitchenLogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function logout() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/mutfak/giris");
        router.refresh();
      } catch {
        setError("Çıkış yapılamadı.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        className="!min-h-10 !px-4 text-sm"
        onClick={logout}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Çıkış…" : "Çıkış yap"}
      </Button>
      {error ? (
        <p className="text-xs text-[#fecaca]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
