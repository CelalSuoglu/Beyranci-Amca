"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { MAX_DELIVERY_KM } from "@/lib/orders/constants";
import { Alert, Card, Field, TextArea } from "./ui";

type Address = { id: string; label: string; address: string; is_default: boolean };

export function AddressManager() {
  const [list, setList] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Address | null>(null);
  const [label, setLabel] = useState("Ev");
  const [text, setText] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await createClient()
      .from("addresses")
      .select("id, label, address, is_default")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (err) setError("Adresler yüklenemedi.");
    setList((data ?? []) as Address[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(a: Address | null) {
    setEditing(a);
    setLabel(a?.label ?? "Ev");
    setText(a?.address ?? "");
    setIsDefault(a?.is_default ?? list.length === 0);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (label.trim().length < 1 || label.trim().length > 40) return setError("Adres adı 1–40 karakter olmalı.");
    if (text.trim().length < 10) return setError("Adres en az 10 karakter olmalı (mahalle, sokak, no, ilçe).");
    setBusy(true);
    setError(null);
    const supabase = createClient();
    try {
      if (isDefault) {
        await supabase.from("addresses").update({ is_default: false }).eq("is_default", true);
      }
      const payload = { label: label.trim(), address: text.trim(), is_default: isDefault };
      const { error: err } = editing
        ? await supabase.from("addresses").update(payload).eq("id", editing.id)
        : await supabase.from("addresses").insert(payload);
      if (err) {
        setError("Adres kaydedilemedi.");
        return;
      }
      setEditing(null);
      setText("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: Address) {
    if (!window.confirm(`"${a.label}" adresi silinsin mi?`)) return;
    const { error: err } = await createClient().from("addresses").delete().eq("id", a.id);
    if (err) setError("Adres silinemedi.");
    await load();
  }

  const formOpen = editing !== null || text !== "" || list.length === 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        {loading ? <p className="text-sm text-[var(--foreground-muted)]">Yükleniyor…</p> : null}
        {!loading && list.length === 0 ? (
          <p className="text-sm text-[var(--foreground-muted)]">Kayıtlı adresiniz yok.</p>
        ) : null}
        {list.map((a) => (
          <Card key={a.id} className="!p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  {a.label}{" "}
                  {a.is_default ? <span className="ml-1 rounded-full bg-[#d4af37]/15 px-2 py-0.5 text-xs text-[#fde68a]">Varsayılan</span> : null}
                </p>
                <p className="mt-1 break-words text-sm leading-relaxed text-[var(--foreground-muted)]">{a.address}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => startEdit(a)} className="min-h-10 rounded-full border border-white/12 px-4 text-sm hover:border-white/25">Düzenle</button>
              <button type="button" onClick={() => void remove(a)} className="min-h-10 rounded-full border border-red-500/40 px-4 text-sm text-[#fecaca] hover:bg-red-950/40">Sil</button>
            </div>
          </Card>
        ))}
        {!formOpen ? (
          <Button type="button" variant="outline" onClick={() => startEdit(null)}>Yeni adres ekle</Button>
        ) : null}
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">{editing ? "Adresi düzenle" : "Yeni adres"}</h2>
        <form onSubmit={save} className="space-y-4" noValidate>
          <Field id="label" label="Adres adı" placeholder="Ev, İş…" value={label} onChange={(e) => setLabel(e.target.value)} />
          <TextArea id="address" label="Açık adres" rows={3} placeholder="Mahalle, sokak, bina no, daire, ilçe" value={text} onChange={(e) => setText(e.target.value)} />
          <p className="text-xs text-[var(--foreground-muted)]">Restorana en fazla {MAX_DELIVERY_KM} km mesafedeki adreslere teslimat yapılır.</p>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Varsayılan adres olsun
          </label>
          {error ? <Alert>{error}</Alert> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>{busy ? "Kaydediliyor…" : "Kaydet"}</Button>
            {editing ? (
              <Button type="button" variant="ghost" onClick={() => { setEditing(null); setText(""); }}>Vazgeç</Button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
