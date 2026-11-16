"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, Card, fieldClass } from "@/components/account/ui";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { revalidateMenu, slugify, type AdminCategory } from "./shared";

export function CategoriesAdmin() {
  const [list, setList] = useState<AdminCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [layout, setLayout] = useState<"cards" | "rows">("rows");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await createClient().from("categories").select("*").order("sort_order");
    if (err) setError("Kategoriler yüklenemedi.");
    setList((data ?? []) as AdminCategory[]);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load]);

  async function update(c: AdminCategory, patch: Partial<AdminCategory>) {
    const { error: err } = await createClient().from("categories").update(patch).eq("id", c.id);
    if (err) setError("Güncellenemedi.");
    await load();
    void revalidateMenu();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (t.length < 2) return setError("Kategori adı en az 2 karakter olmalı.");
    const id = slugify(t) || `kategori-${Date.now().toString(36)}`;
    if (list.some((c) => c.id === id)) return setError("Bu adla bir kategori zaten var.");
    setBusy(true);
    const { error: err } = await createClient().from("categories").insert({
      id,
      title: t,
      layout,
      sort_order: Math.max(0, ...list.map((c) => c.sort_order)) + 10,
    });
    setBusy(false);
    if (err) return setError("Kategori eklenemedi.");
    setTitle("");
    setError(null);
    await load();
    void revalidateMenu();
  }

  async function move(c: AdminCategory, dir: -1 | 1) {
    const i = list.findIndex((x) => x.id === c.id);
    const other = list[i + dir];
    if (!other) return;
    const supabase = createClient();
    await Promise.all([
      supabase.from("categories").update({ sort_order: other.sort_order }).eq("id", c.id),
      supabase.from("categories").update({ sort_order: c.sort_order }).eq("id", other.id),
    ]);
    await load();
    void revalidateMenu();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Kategoriler</h1>
      {error ? <Alert>{error}</Alert> : null}

      <Card>
        <form onSubmit={add} className="flex flex-wrap items-end gap-3" noValidate>
          <label className="min-w-[14rem] flex-1 text-sm font-medium">
            Yeni kategori adı
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm font-medium">
            Görünüm
            <select value={layout} onChange={(e) => setLayout(e.target.value as "cards" | "rows")} className={fieldClass}>
              <option value="rows">Satır listesi</option>
              <option value="cards">Açıklamalı kartlar</option>
            </select>
          </label>
          <Button type="submit" disabled={busy}>Ekle</Button>
        </form>
      </Card>

      <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--surface)]">
        {list.map((c, i) => (
          <li key={c.id} className={cn("flex flex-wrap items-center gap-3 px-4 py-3", !c.is_active && "opacity-60")}>
            <input
              defaultValue={c.title}
              aria-label="Kategori adı"
              onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== c.title && void update(c, { title: e.target.value.trim() })}
              className={cn(fieldClass, "!mt-0 min-w-[12rem] flex-1")}
            />
            <select
              value={c.layout}
              aria-label="Görünüm"
              onChange={(e) => void update(c, { layout: e.target.value as "cards" | "rows" })}
              className={cn(fieldClass, "!mt-0 w-auto")}
            >
              <option value="rows">Satır</option>
              <option value="cards">Kart</option>
            </select>
            <button
              type="button"
              onClick={() => void update(c, { is_active: !c.is_active })}
              className={cn("min-h-9 rounded-full border px-3 text-xs", c.is_active ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200" : "border-white/12")}
            >
              {c.is_active ? "Görünür" : "Gizli"}
            </button>
            <button type="button" aria-label="Yukarı" disabled={i === 0} onClick={() => void move(c, -1)} className="h-9 w-9 rounded-full border border-white/12 disabled:opacity-30">↑</button>
            <button type="button" aria-label="Aşağı" disabled={i === list.length - 1} onClick={() => void move(c, 1)} className="h-9 w-9 rounded-full border border-white/12 disabled:opacity-30">↓</button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[var(--foreground-muted)]">
        Kategoriyi silmek yerine gizleyin; içindeki ürünler menüden kalkar ama geçmiş kayıtlar bozulmaz.
      </p>
    </div>
  );
}
