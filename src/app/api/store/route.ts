import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestAuth } from "@/lib/auth/request";
import { isStaffRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStoreStatus, isValidHHMM } from "@/lib/store/hours";
import { getStoreSettings } from "@/lib/store/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sipariş açık mı + müşteriye gösterilecek ayarlar */
export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(
    { settings, status: getStoreStatus(settings) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

const dayHours = z.object({
  open: z.string().refine(isValidHHMM, "Saat SS:DD olmalı"),
  close: z.string().refine(isValidHHMM, "Saat SS:DD olmalı"),
  closed: z.boolean(),
});

const staffPatch = z.object({
  orders_enabled: z.boolean().optional(),
  pause_message: z.string().trim().max(200).nullable().optional(),
});

const adminPatch = staffPatch.extend({
  announcement: z.string().trim().max(300).nullable().optional(),
  eta_min: z.number().int().min(5).max(240).optional(),
  eta_max: z.number().int().min(5).max(240).optional(),
  last_order_minutes: z.number().int().min(0).max(180).optional(),
  opening_hours: z.array(dayHours).length(7).optional(),
});

/**
 * Personel: siparişleri durdur/aç (+ durdurma mesajı).
 * Yönetici: tüm ayarlar.
 */
export async function PATCH(request: Request) {
  const auth = await getRequestAuth(request);
  if (!auth.user) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  if (!isStaffRole(auth.role)) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const schema = auth.role === "admin" ? adminPatch.strict() : staffPatch.strict();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: auth.role === "admin" ? (parsed.error.issues[0]?.message ?? "Geçersiz ayar.") : "Bu ayarı değiştirme yetkiniz yok." },
      { status: 400 },
    );
  }

  const patch = { ...parsed.data } as Record<string, unknown>;
  for (const k of ["pause_message", "announcement"]) {
    if (typeof patch[k] === "string" && !(patch[k] as string).trim()) patch[k] = null;
  }
  if (
    typeof patch.eta_min === "number" &&
    typeof patch.eta_max === "number" &&
    (patch.eta_min as number) > (patch.eta_max as number)
  ) {
    return NextResponse.json({ error: "En kısa süre, en uzun süreden büyük olamaz." }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from("store_settings")
    .update(patch)
    .eq("id", 1)
    .select("*")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "Ayarlar kaydedilemedi." }, { status: 500 });
  }
  const settings = await getStoreSettings();
  return NextResponse.json({ ok: true, settings, status: getStoreStatus(settings) });
}
