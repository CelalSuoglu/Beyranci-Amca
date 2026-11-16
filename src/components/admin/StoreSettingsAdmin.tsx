"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, Card, fieldClass } from "@/components/account/ui";
import {
  DAY_NAMES,
  getStoreStatus,
  isValidHHMM,
  type DayHours,
  type StoreSettings,
} from "@/lib/store/hours";
import { cn } from "@/lib/utils";

export function StoreSettingsAdmin() {
  const [s, setS] = useState<StoreSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/store", { cache: "no-store" })
      .then((r) => r.json())
      .then((b) => setS(b.settings as StoreSettings))
      .catch(() => setError("Ayarlar yüklenemedi."));
  }, []);

  if (!s) return <p className="text-[var(--foreground-muted)]">{error ?? "Yükleniyor…"}</p>;

  const setDay = (i: number, patch: Partial<DayHours>) =>
    setS({ ...s, opening_hours: s.opening_hours.map((d, j) => (j === i ? { ...d, ...patch } : d)) });

  async function save() {
    if (!s || saving) return;
    setError(null);
    setNotice(null);
    for (const [i, d] of s.opening_hours.entries()) {
      if (!d.closed && (!isValidHHMM(d.open) || !isValidHHMM(d.close))) {
        return setError(`${DAY_NAMES[i]}: saatleri SS:DD biçiminde yazın (ör. 08:30).`);
      }
    }
    if (s.eta_min > s.eta_max) return setError("En kısa süre, en uzun süreden büyük olamaz.");
    setSaving(true);
    const res = await fetch("/api/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orders_enabled: s.orders_enabled,
        pause_message: s.pause_message,
        announcement: s.announcement,
        eta_min: s.eta_min,
        eta_max: s.eta_max,
        last_order_minutes: s.last_order_minutes,
        opening_hours: s.opening_hours,
      }),
    });
    const body = await res.json().catch(() => null);
    setSaving(false);
    if (!res.ok) return setError(body?.error ?? "Kaydedilemedi.");
    setS(body.settings as StoreSettings);
    setNotice("Ayarlar kaydedildi. Sipariş sayfasına hemen yansır.");
  }

  const status = getStoreStatus(s);

  return (
    <div className="space-y-5">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Sipariş ayarları</h1>
      <Alert tone={status.open ? "success" : "error"}>
        Şu anki durum: <strong>{status.open ? "Sipariş alınıyor" : "Sipariş alınmıyor"}</strong> — {status.message}
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Online sipariş</h2>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={s.orders_enabled}
              onChange={(e) => setS({ ...s, orders_enabled: e.target.checked })}
              className="h-5 w-5 accent-[var(--accent)]"
            />
            <span>
              <strong>Siparişler açık</strong>
              <span className="block text-[var(--foreground-muted)]">
                Kapatınca çalışma saatleri içinde de sipariş alınmaz. Personel mutfak panelinden de açıp kapatabilir.
              </span>
            </span>
          </label>
          <label className="mt-4 block text-sm font-medium">
            Durdurulunca gösterilecek mesaj (isteğe bağlı)
            <input
              value={s.pause_message ?? ""}
              maxLength={200}
              placeholder="Yoğunluk nedeniyle kısa bir süre sipariş alamıyoruz."
              onChange={(e) => setS({ ...s, pause_message: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Duyuru (sipariş sayfasının üstünde, isteğe bağlı)
            <textarea
              value={s.announcement ?? ""}
              maxLength={300}
              rows={2}
              placeholder="Örn. Bugün kuşbaşılı pide servis edilmemektedir."
              onChange={(e) => setS({ ...s, announcement: e.target.value })}
              className={cn(fieldClass, "resize-y")}
            />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <label className="text-sm font-medium">
              En kısa (dk)
              <input type="number" min={5} max={240} value={s.eta_min} onChange={(e) => setS({ ...s, eta_min: Number(e.target.value) })} className={fieldClass} />
            </label>
            <label className="text-sm font-medium">
              En uzun (dk)
              <input type="number" min={5} max={240} value={s.eta_max} onChange={(e) => setS({ ...s, eta_max: Number(e.target.value) })} className={fieldClass} />
            </label>
            <label className="text-sm font-medium">
              Son sipariş (dk önce)
              <input type="number" min={0} max={180} value={s.last_order_minutes} onChange={(e) => setS({ ...s, last_order_minutes: Number(e.target.value) })} className={fieldClass} />
            </label>
          </div>
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">
            Tahmini teslimat müşteriye &quot;{s.eta_min}–{s.eta_max} dk&quot; olarak gösterilir. Son sipariş: kapanıştan {s.last_order_minutes} dk önce sipariş alımı biter.
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Paket sipariş saatleri</h2>
          <ul className="space-y-2">
            {s.opening_hours.map((d, i) => (
              <li key={DAY_NAMES[i]} className="flex flex-wrap items-center gap-2">
                <span className="w-24 text-sm font-medium">{DAY_NAMES[i]}</span>
                <input
                  aria-label={`${DAY_NAMES[i]} açılış`}
                  value={d.open}
                  disabled={d.closed}
                  onChange={(e) => setDay(i, { open: e.target.value })}
                  className={cn(fieldClass, "!mt-0 w-20 text-center")}
                />
                <span aria-hidden>–</span>
                <input
                  aria-label={`${DAY_NAMES[i]} kapanış`}
                  value={d.close}
                  disabled={d.closed}
                  onChange={(e) => setDay(i, { close: e.target.value })}
                  className={cn(fieldClass, "!mt-0 w-20 text-center")}
                />
                <label className="ml-1 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={d.closed} onChange={(e) => setDay(i, { closed: e.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
                  Kapalı
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--foreground-muted)]">
            Kapanış açılıştan küçükse (ör. 08:30 – 01:00) ertesi gece kapanır. Saatler Türkiye saatidir.
          </p>
        </Card>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <Button type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Kaydediliyor…" : "Ayarları kaydet"}
      </Button>
    </div>
  );
}
