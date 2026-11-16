"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, Card, fieldClass } from "@/components/account/ui";
import { createClient } from "@/lib/supabase/client";
import { formatTry } from "@/lib/orders/format";
import { cn } from "@/lib/utils";
import {
  SPICE_PRESETS,
  revalidateMenu,
  slugify,
  spicePresetOf,
  type AdminCategory,
  type AdminProduct,
  type SpicePreset,
} from "./shared";

type Draft = {
  id?: string;
  category_id: string;
  name: string;
  description: string;
  price: string;
  calories: string;
  is_active: boolean;
  is_orderable: boolean;
  spice: SpicePreset;
  requires_garlic: boolean;
  in_sub_section: boolean;
};

const emptyDraft = (categoryId: string): Draft => ({
  category_id: categoryId,
  name: "",
  description: "",
  price: "",
  calories: "",
  is_active: true,
  is_orderable: true,
  spice: "none",
  requires_garlic: false,
  in_sub_section: false,
});

function parsePrice(raw: string): number | null {
  const v = Number(raw.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(v) && v >= 0 && v < 1_000_000 ? Math.round(v * 100) / 100 : null;
}

export function ProductsAdmin() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const [c, p] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
    ]);
    if (c.error || p.error) {
      setError("Menü yüklenemedi. Veritabanı kurulumunu (migration) çalıştırdığınızdan emin olun.");
    } else {
      setCategories(c.data as AdminCategory[]);
      setProducts((p.data as AdminProduct[]).map((x) => ({ ...x, price: Number(x.price) })));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return categories.map((cat) => ({
      cat,
      items: products.filter(
        (p) => p.category_id === cat.id && (!q || p.name.toLocaleLowerCase("tr-TR").includes(q)),
      ),
    }));
  }, [categories, products, query]);

  function edit(p: AdminProduct) {
    setDraft({
      id: p.id,
      category_id: p.category_id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price).replace(".", ","),
      calories: p.calories ? String(p.calories) : "",
      is_active: p.is_active,
      is_orderable: p.is_orderable,
      spice: spicePresetOf(p.spice_levels),
      requires_garlic: p.requires_garlic,
      in_sub_section: p.in_sub_section,
    });
    setNotice(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function quickToggle(p: AdminProduct, field: "is_active" | "is_orderable") {
    const { error: err } = await createClient()
      .from("products")
      .update({ [field]: !p[field] })
      .eq("id", p.id);
    if (err) setError("Güncellenemedi.");
    await load();
    void revalidateMenu();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft || saving) return;
    const price = parsePrice(draft.price);
    const name = draft.name.trim();
    if (name.length < 2) return setError("Ürün adı en az 2 karakter olmalı.");
    if (price === null) return setError("Geçerli bir fiyat girin (ör. 450 veya 450,50).");
    if (!draft.category_id) return setError("Kategori seçin.");
    const calTrim = draft.calories.trim();
    const calories = calTrim ? Number(calTrim) : null;
    if (calories !== null && (!Number.isInteger(calories) || calories < 0 || calories > 10000)) {
      return setError("Kalori 0–10000 arasında tam sayı olmalı (boş bırakılabilir).");
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const payload = {
      category_id: draft.category_id,
      name,
      description: draft.description.trim() || null,
      price,
      calories,
      is_active: draft.is_active,
      is_orderable: draft.is_orderable,
      spice_levels: SPICE_PRESETS[draft.spice] ? [...SPICE_PRESETS[draft.spice]!] : null,
      requires_garlic: draft.requires_garlic,
      in_sub_section: draft.in_sub_section,
    };

    try {
      if (draft.id) {
        const { error: err } = await supabase.from("products").update(payload).eq("id", draft.id);
        if (err) throw err;
        setNotice(`"${name}" güncellendi.`);
      } else {
        let id = `${draft.category_id}-${slugify(name)}`.slice(0, 80);
        if (products.some((p) => p.id === id)) id = `${id}-${Date.now().toString(36)}`;
        const maxSort = Math.max(0, ...products.filter((p) => p.category_id === draft.category_id).map((p) => p.sort_order));
        const { error: err } = await supabase.from("products").insert({ id, sort_order: maxSort + 10, ...payload });
        if (err) throw err;
        setNotice(`"${name}" eklendi.`);
      }
      setDraft(null);
      await load();
      void revalidateMenu();
    } catch {
      setError("Kaydedilemedi. Yönetici olarak giriş yaptığınızdan emin olun.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: AdminProduct) {
    if (!window.confirm(`"${p.name}" kalıcı olarak silinsin mi? Sadece gizlemek için "Menüde" düğmesini kapatabilirsiniz.`)) return;
    const { error: err } = await createClient().from("products").delete().eq("id", p.id);
    if (err) setError("Silinemedi.");
    setDraft(null);
    await load();
    void revalidateMenu();
  }

  async function move(p: AdminProduct, dir: -1 | 1) {
    const siblings = products.filter((x) => x.category_id === p.category_id).sort((a, b) => a.sort_order - b.sort_order);
    const i = siblings.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (j < 0 || j >= siblings.length) return;
    const other = siblings[j];
    const supabase = createClient();
    await Promise.all([
      supabase.from("products").update({ sort_order: other.sort_order }).eq("id", p.id),
      supabase.from("products").update({ sort_order: p.sort_order }).eq("id", other.id),
    ]);
    await load();
    void revalidateMenu();
  }

  if (loading) return <p className="text-[var(--foreground-muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Ürünler</h1>
        <div className="flex flex-wrap gap-2">
          <input type="search" placeholder="Ürün ara…" value={query} onChange={(e) => setQuery(e.target.value)} className={cn(fieldClass, "!mt-0 w-56")} />
          <Button type="button" onClick={() => setDraft(emptyDraft(categories[0]?.id ?? ""))} disabled={!categories.length}>
            Yeni ürün
          </Button>
        </div>
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {draft ? (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">{draft.id ? "Ürünü düzenle" : "Yeni ürün"}</h2>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
            <label className="text-sm font-medium">
              Kategori
              <select value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })} className={fieldClass}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Ürün adı
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={fieldClass} />
            </label>
            <label className="text-sm font-medium">
              Fiyat (TL)
              <input inputMode="decimal" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={fieldClass} placeholder="450" />
            </label>
            <label className="text-sm font-medium">
              Kalori (kcal, isteğe bağlı)
              <input inputMode="numeric" value={draft.calories} onChange={(e) => setDraft({ ...draft, calories: e.target.value })} className={fieldClass} placeholder="330" />
            </label>
            <label className="text-sm font-medium">
              Acı seçeneği
              <select value={draft.spice} onChange={(e) => setDraft({ ...draft, spice: e.target.value as SpicePreset })} className={fieldClass}>
                <option value="none">Yok</option>
                <option value="simple">Acılı / Acısız</option>
                <option value="full">Acılı / Az acılı / Acısız</option>
              </select>
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Açıklama (isteğe bağlı)
              <textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={cn(fieldClass, "resize-y")} />
            </label>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm sm:col-span-2">
              <Check label="Menüde göster" checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
              <Check label="Paket siparişte satılsın" checked={draft.is_orderable} onChange={(v) => setDraft({ ...draft, is_orderable: v })} />
              <Check label="Sarımsak seçeneği zorunlu" checked={draft.requires_garlic} onChange={(v) => setDraft({ ...draft, requires_garlic: v })} />
              <Check label="Alt bölümde göster" checked={draft.in_sub_section} onChange={(v) => setDraft({ ...draft, in_sub_section: v })} />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</Button>
              <Button type="button" variant="ghost" onClick={() => setDraft(null)}>Vazgeç</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {grouped.map(({ cat, items }) => (
        <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
          <h2 id={`cat-${cat.id}`} className="mb-2 font-semibold text-[#e8c76a]">
            {cat.title} {!cat.is_active ? <span className="text-xs text-[var(--foreground-muted)]">(gizli kategori)</span> : null}
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-[var(--foreground-muted)]">Ürün yok.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--surface)]">
              {items.map((p, idx) => (
                <li key={p.id} className={cn("flex flex-wrap items-center gap-3 px-4 py-3", !p.is_active && "opacity-60")}>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{p.option_group ? `${p.option_group} — ${p.option_name ?? p.name}` : p.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {p.spice_levels?.length ? "Acı seçimli · " : ""}
                      {p.requires_garlic ? "Sarımsak seçimli · " : ""}
                      {p.in_sub_section ? "Alt bölüm · " : ""}
                      {p.calories ? `${p.calories} kcal · ` : ""}
                      <span className="tabular-nums text-[#e8c76a]">{formatTry(p.price)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Toggle on={p.is_active} label="Menüde" onClick={() => void quickToggle(p, "is_active")} />
                    <Toggle on={p.is_orderable} label="Siparişte" onClick={() => void quickToggle(p, "is_orderable")} />
                    <IconBtn label="Yukarı taşı" disabled={idx === 0} onClick={() => void move(p, -1)}>↑</IconBtn>
                    <IconBtn label="Aşağı taşı" disabled={idx === items.length - 1} onClick={() => void move(p, 1)}>↓</IconBtn>
                    <button type="button" onClick={() => edit(p)} className="min-h-9 rounded-full border border-white/12 px-3 text-xs hover:border-white/25">Düzenle</button>
                    <button type="button" onClick={() => void remove(p)} className="min-h-9 rounded-full border border-red-500/40 px-3 text-xs text-[#fecaca] hover:bg-red-950/40">Sil</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
      {label}
    </label>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "min-h-9 rounded-full border px-3 text-xs font-medium",
        on ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200" : "border-white/12 text-[var(--foreground-muted)]",
      )}
    >
      {label}: {on ? "Açık" : "Kapalı"}
    </button>
  );
}

function IconBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="h-9 w-9 rounded-full border border-white/12 text-sm hover:border-white/25 disabled:opacity-30">
      {children}
    </button>
  );
}
