import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createOrderInputSchema,
  validateAndPriceOrder,
} from "@/lib/orders/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }

  const parsed = createOrderInputSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Form bilgileri geçersiz.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const priced = validateAndPriceOrder(parsed.data);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.message }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
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
      })
      .select("id, order_number, total, created_at")
      .single();

    if (error || !data) {
      console.error("[orders] insert failed", error?.code ?? "unknown");
      return NextResponse.json(
        {
          error:
            "Sipariş şu anda kaydedilemedi. Lütfen biraz sonra tekrar deneyin veya telefonla sipariş verin.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        orderNumber: data.order_number,
        total: Number(data.total),
        createdAt: data.created_at,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[orders] unexpected", err instanceof Error ? err.name : "error");
    return NextResponse.json(
      {
        error:
          "Sipariş sistemi geçici olarak kullanılamıyor. Lütfen telefonla sipariş verin.",
      },
      { status: 503 },
    );
  }
}
