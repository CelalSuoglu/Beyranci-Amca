import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestAuth } from "@/lib/auth/request";
import { isStaffRole } from "@/lib/auth/roles";
import { ORDER_STATUSES, STATUS_TRANSITIONS, type OrderStatus } from "@/lib/orders/constants";
import { notifyCustomerStatus } from "@/lib/push";

export const runtime = "nodejs";

const bodySchema = z.object({ status: z.enum(ORDER_STATUSES) });

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

  const { data, error } = await auth.client
    .from("orders")
    .update({ status: next })
    .eq("id", id)
    .select("id, order_number, status, user_id, updated_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Durum güncellenemedi." }, { status: 409 });
  }

  await notifyCustomerStatus({
    id: data.id,
    order_number: data.order_number,
    user_id: data.user_id,
    status: data.status as OrderStatus,
  });

  return NextResponse.json({ ok: true, status: data.status, updatedAt: data.updated_at });
}
