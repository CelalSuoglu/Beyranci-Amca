import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestAuth } from "@/lib/auth/request";
import { isStaffRole } from "@/lib/auth/roles";
import { ORDER_STATUSES, STATUS_TRANSITIONS, type OrderStatus } from "@/lib/orders/constants";
import { notifyCustomerStatus } from "@/lib/push";

export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(ORDER_STATUSES),
  /** Onaylarken: kaç dakikada teslim edilecek */
  etaMinutes: z.number().int().min(5).max(240).optional(),
  /** İptalde müşteriye gösterilecek neden */
  cancelReason: z.string().trim().min(2).max(200).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Geçersiz sipariş." }, { status: 400 });
  }

  const auth = await getRequestAuth(request);
  if (!auth.user) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
  }
  if (!isStaffRole(auth.role)) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }
  const next = parsed.data.status as OrderStatus;

  // Kullanıcının kendi yetkisiyle oku/güncelle: RLS + veritabanı geçiş kuralı da devrede
  const { data: current, error: readError } = await auth.client
    .from("orders")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (readError || !current) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  const allowed = STATUS_TRANSITIONS[current.status as OrderStatus] ?? [];
  if (auth.role !== "admin" && !allowed.includes(next)) {
    return NextResponse.json(
      { error: "Bu durum değişikliği yapılamaz." },
      { status: 409 },
    );
  }

  const patch: Record<string, unknown> = { status: next };
  if (parsed.data.etaMinutes && next !== "cancelled" && next !== "completed") {
    patch.eta_at = new Date(Date.now() + parsed.data.etaMinutes * 60000).toISOString();
  }
  if (next === "cancelled") {
    patch.cancel_reason = parsed.data.cancelReason ?? null;
  }

  const { data, error } = await auth.client
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("id, order_number, status, user_id, updated_at, eta_at, cancel_reason")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Durum güncellenemedi." }, { status: 409 });
  }

  await notifyCustomerStatus({
    id: data.id,
    order_number: data.order_number,
    user_id: data.user_id,
    status: data.status as OrderStatus,
    eta_at: (data.eta_at as string | null) ?? null,
    cancel_reason: (data.cancel_reason as string | null) ?? null,
  });

  return NextResponse.json({
    ok: true,
    status: data.status,
    updatedAt: data.updated_at,
    etaAt: data.eta_at ?? null,
    cancelReason: data.cancel_reason ?? null,
  });
}
