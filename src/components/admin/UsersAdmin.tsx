"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, fieldClass } from "@/components/account/ui";
import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/lib/auth/roles";
import { formatOrderTime, formatPhoneDisplay } from "@/lib/orders/format";
import { cn } from "@/lib/utils";

type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: AppRole;
  confirmed: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

export function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (search: string) => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`, { cache: "no-store" });
    const body = await res.json().catch(() => null);
    if (!res.ok) setError(body?.error ?? "Kullanıcılar yüklenemedi.");
    else setUsers(body.users as AdminUser[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(q), 250);
    return () => window.clearTimeout(t);
  }, [q, load]);

  async function changeRole(u: AdminUser, role: AppRole) {
    if (role === u.role) return;
    const label = ROLE_LABELS[role];
    if (!window.confirm(`${u.email} kullanıcısının rolü "${label}" olarak değiştirilsin mi?`)) return;
    setBusyId(u.id);
    setError(null);
    setNotice(null);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.id, role }),
    });
    const body = await res.json().catch(() => null);
    setBusyId(null);
    if (!res.ok) {
      setError(body?.error ?? "Rol değiştirilemedi.");
      return;
    }
    setNotice(`${u.email} artık ${label}.`);
    await load(q);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Kullanıcılar ve yetkiler</h1>
        <input type="search" placeholder="E-posta, ad veya telefon ara…" value={q} onChange={(e) => setQ(e.target.value)} className={cn(fieldClass, "!mt-0 w-full sm:w-72")} />
      </div>
      <p className="text-sm text-[var(--foreground-muted)]">
        <strong>Personel</strong> sipariş paneline girer ve sipariş durumlarını günceller.{" "}
        <strong>Yönetici</strong> ayrıca ürünleri ve kullanıcı yetkilerini yönetir. Yeni üyeler her
        zaman müşteri olarak başlar.
      </p>
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {loading ? <p className="text-[var(--foreground-muted)]">Yükleniyor…</p> : null}

      <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--surface)]">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="break-all font-medium">{u.email}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {u.fullName ?? "İsimsiz"}
                {u.phone ? ` · ${formatPhoneDisplay(u.phone)}` : ""} · Kayıt {formatOrderTime(u.createdAt)}
                {!u.confirmed ? " · E-posta doğrulanmadı" : ""}
              </p>
            </div>
            <label className="sr-only" htmlFor={`role-${u.id}`}>Rol</label>
            <select
              id={`role-${u.id}`}
              value={u.role}
              disabled={busyId === u.id}
              onChange={(e) => void changeRole(u, e.target.value as AppRole)}
              className={cn(fieldClass, "!mt-0 w-auto")}
            >
              {APP_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </li>
        ))}
        {!loading && users.length === 0 ? <li className="px-4 py-6 text-center text-sm text-[var(--foreground-muted)]">Kullanıcı bulunamadı.</li> : null}
      </ul>
    </div>
  );
}
