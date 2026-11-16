import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Loading, Message, Screen } from "../../src/components/ui";
import { useCart } from "../../src/context/CartContext";
import { OrderProgress, StatusBadge, type ProgressEvent } from "../../src/components/OrderProgress";
import {
  PAYMENT_METHOD_LABELS,
  formatOrderTime,
  formatTry,
  type OrderItemRecord,
  type OrderStatus,
  type PaymentMethod,
} from "../../src/lib/orders";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme";

type Detail = {
  id: string;
  order_number: string;
  status: OrderStatus;
  items: OrderItemRecord[];
  total: number;
  created_at: string;
  address: string;
  note: string | null;
  payment_method: PaymentMethod;
  eta_at: string | null;
  cancel_reason: string | null;
  cash_change_for: number | null;
  wants_cutlery: boolean;
};

const RESTAURANT_PHONE = "tel:+905340600707";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Detail | null>(null);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { add, productById } = useCart();

  const load = useCallback(async () => {
    if (!id) return;
    const [o, e] = await Promise.all([
      supabase.from("orders").select("id, order_number, status, items, total, created_at, address, note, payment_method, eta_at, cancel_reason, cash_change_for, wants_cutlery").eq("id", id).maybeSingle(),
      supabase.from("order_events").select("to_status, created_at").eq("order_id", id).order("created_at"),
    ]);
    if (o.error || !o.data) {
      setError("Sipariş bulunamadı veya görme yetkiniz yok.");
      return;
    }
    setOrder({ ...(o.data as Detail), total: Number(o.data.total) });
    setEvents((e.data ?? []) as ProgressEvent[]);
    setError(null);
  }, [id]);

  useEffect(() => {
    void load();
    const ch = supabase
      .channel(`order-detail-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => void load())
      .subscribe();
    const poll = setInterval(() => void load(), 20000);
    const sub = AppState.addEventListener("change", (st) => st === "active" && void load());
    return () => {
      clearInterval(poll);
      sub.remove();
      void supabase.removeChannel(ch);
    };
  }, [id, load]);

  if (error) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Message>{error}</Message>
      </Screen>
    );
  }
  if (!order) return <Loading />;

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <Card>
        <Text style={{ color: colors.goldLight, fontSize: 22, fontWeight: "700" }}>{order.order_number}</Text>
        <Text style={{ color: colors.muted, marginTop: 2, marginBottom: 12 }}>{formatOrderTime(order.created_at)}</Text>
        <StatusBadge status={order.status} />
        <View style={{ marginTop: 16 }}>
          <OrderProgress status={order.status} events={events} etaAt={order.eta_at} cancelReason={order.cancel_reason} />
        </View>
      </Card>
      <Card>
        {order.items.map((it, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.foreground, flex: 1 }}>
              {it.quantity}× {it.name}
            </Text>
            <Text style={{ color: colors.goldLight }}>{formatTry(it.lineTotal)}</Text>
          </View>
        ))}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }}>
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>Toplam</Text>
          <Text style={{ color: colors.goldLight, fontWeight: "700" }}>{formatTry(order.total)}</Text>
        </View>
      </Card>
      <Card>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Teslimat adresi</Text>
        <Text style={{ color: colors.foreground, marginBottom: 10 }}>{order.address}</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Ödeme</Text>
        <Text style={{ color: colors.foreground }}>
          {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
          {order.cash_change_for ? ` · ${formatTry(Number(order.cash_change_for))} üzerinden` : ""}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 10 }}>Servis</Text>
        <Text style={{ color: colors.foreground }}>{order.wants_cutlery ? "Çatal-bıçak ve peçete istendi" : "Çatal-bıçak istenmedi"}</Text>
        {order.note ? (
          <>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 10 }}>Not</Text>
            <Text style={{ color: colors.foreground }}>{order.note}</Text>
          </>
        ) : null}
        <Button
          label="Tekrar sipariş ver"
          variant="outline"
          style={{ marginTop: 16 }}
          onPress={() => {
            let missing = 0;
            for (const it of order.items) {
              // Menüden kalkmış ürünler eklenmez; fiyatlar güncel menüden
              if (!productById(it.productId)) {
                missing += 1;
                continue;
              }
              add(it.productId, it.quantity, it.spiceLevel ?? null, it.garlicLevel ?? null);
            }
            router.push("/sepet");
            if (missing) setError(`${missing} ürün artık menüde olmadığı için sepete eklenmedi.`);
          }}
        />
        <Text onPress={() => void Linking.openURL(RESTAURANT_PHONE)} style={{ color: colors.accentSoft, fontWeight: "600", marginTop: 14 }}>
          Restoranı ara: 0534 060 07 07
        </Text>
      </Card>
    </Screen>
  );
}
