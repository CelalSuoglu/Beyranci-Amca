import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Misafir sipariş takibi: yalnızca siparişe özel tahmin edilemez bağlantı anahtarı ile.
 * Telefon ve adres gibi kişisel bilgiler döndürülmez.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ error: "Geçersiz takip bağlantısı." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, status, items, total, created_at, updated_at, payment_method, eta_at, cancel_reason")
    .eq("tracking_token", token)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  const { data: events } = await admin
    .from("order_events")
    .select("to_status, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  const { id: _omit, ...publicOrder } = order;
  void _omit;
  return NextResponse.json(
    { order: publicOrder, events: events ?? [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}
