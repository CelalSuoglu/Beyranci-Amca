import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkDeliveryRadius } from "@/lib/orders/delivery-radius";
import { createOrderInputSchema, validateAndPriceOrder } from "@/lib/orders/schemas";
import { getCatalog } from "@/lib/menu/catalog";
import { getRequestAuth } from "@/lib/auth/request";
import { notifyCustomerOrderReceived, notifyStaffNewOrder } from "@/lib/push";

export const runtime = "nodejs";

const RETURN_FIELDS = "id, order_number, total, created_at, tracking_token, user_id";

type InsertedOrder = {
  id: string;
  order_number: string;
  total: number | string;
  created_at: string;
  tracking_token: string;
  user_id: string | null;
};

function okResponse(row: InsertedOrder, status: number) {
  return NextResponse.json(
    {
      ok: true,
      orderId: row.id,
      orderNumber: row.order_number,
      total: Number(row.total),
      createdAt: row.created_at,
      trackingToken: row.tracking_token,
    },
    { status },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const parsed = createOrderInputSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Form bilgileri geçersiz.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const headerKey = request.headers.get("idempotency-key")?.trim();
  const idempotencyKey = (headerKey || parsed.data.idempotencyKey || "").slice(0, 100) || null;

  // Giriş yapmış müşteri varsa sipariş hesabına bağlanır (misafir sipariş de serbest)
  let userId: string | null = null;
  try {
    const auth = await getRequestAuth(request);
    userId = auth.user?.id ?? null;
  } catch {
    userId = null;
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Sipariş sistemi geçici olarak kullanılamıyor. Lütfen telefonla sipariş verin." },
      { status: 503 },
    );
  }

  // Aynı anahtarla daha önce oluşturulmuş sipariş varsa onu döndür (çift sipariş yok)
  if (idempotencyKey) {
    const { data: existing } = await admin
      .from("orders")
      .select(RETURN_FIELDS)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existing) return okResponse(existing as InsertedOrder, 200);
  }

  const catalog = await getCatalog();
  const byId = new Map(catalog.orderable.map((p) => [p.id, p]));
  const priced = validateAndPriceOrder(parsed.data, (id) => byId.get(id));
  if (!priced.ok) {
    return NextResponse.json({ error: priced.message }, { status: 400 });
  }

  const delivery = await checkDeliveryRadius(priced.order.address);
  if (!delivery.ok) {
    return NextResponse.json({ error: delivery.message }, { status: 400 });
  }

  const { order } = priced;
  const { data, error } = await admin
    .from("orders")
    .insert({
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      note: order.note,
      payment_method: order.paymentMethod,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      status: "new",
      user_id: userId,
      idempotency_key: idempotencyKey,
      payment_status: "unpaid",
    })
    .select(RETURN_FIELDS)
    .single();

  if (error || !data) {
    // Aynı anda iki istek geldiyse ikinci insert benzersizlik hatası alır → ilkini döndür
    if (error?.code === "23505" && idempotencyKey) {
      const { data: existing } = await admin
        .from("orders")
        .select(RETURN_FIELDS)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (existing) return okResponse(existing as InsertedOrder, 200);
    }
    console.error("[orders] insert failed", error?.code ?? "unknown");
    return NextResponse.json(
      {
        error:
          "Sipariş şu anda kaydedilemedi. Lütfen biraz sonra tekrar deneyin veya telefonla sipariş verin.",
      },
      { status: 503 },
    );
  }

  const row = data as InsertedOrder;
  await Promise.allSettled([
    notifyStaffNewOrder({
      id: row.id,
      order_number: row.order_number,
      total: Number(row.total),
      customer_name: order.customerName,
    }),
    notifyCustomerOrderReceived({ id: row.id, order_number: row.order_number, user_id: row.user_id }),
  ]);

  return okResponse(row, 201);
}
